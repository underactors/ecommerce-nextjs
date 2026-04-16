import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import nodemailer from 'nodemailer'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

const notion = new Client({ auth: process.env.NOTION_API_TOKEN })

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL
    || ('https://' + (process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'ruggtech.com'))
}

function createTransporter() {
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS
  if (!user || !pass) return null
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: true },
  })
}

let subscribersDbId = null

async function getSubscribersDb() {
  if (subscribersDbId) return subscribersDbId

  try {
    const searchResponse = await notion.search({
      filter: { property: 'object', value: 'database' },
      query: 'Back in Stock',
    })

    const existing = searchResponse.results.find(
      db => db.title?.[0]?.plain_text?.includes('Back in Stock')
    )

    if (existing) {
      subscribersDbId = existing.id
      return subscribersDbId
    }
  } catch {}

  return null
}

export async function POST(request) {
  try {
    const { productId, productName, productSlug } = await request.json()

    if (!productId) {
      return NextResponse.json({ error: 'productId required' }, { status: 400 })
    }

    const dbId = await getSubscribersDb()
    if (!dbId) {
      return NextResponse.json({ success: true, message: 'No subscribers database found, skipping notifications' })
    }

    let subscribers = []
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        filter: {
          property: 'Product ID',
          rich_text: { equals: productId },
        },
      })

      subscribers = response.results.map(page => ({
        id: page.id,
        email: page.properties['Customer Email']?.email || page.properties['Email']?.email || '',
      })).filter(s => s.email)
    } catch {
      return NextResponse.json({ success: true, message: 'Could not query subscribers', notified: 0 })
    }

    if (subscribers.length === 0) {
      return NextResponse.json({ success: true, message: 'No subscribers for this product', notified: 0 })
    }

    const transporter = createTransporter()
    if (!transporter) {
      return NextResponse.json({ success: true, message: 'SMTP not configured, could not send notifications', notified: 0 })
    }

    const siteUrl = getSiteUrl()
    let sent = 0

    for (const subscriber of subscribers) {
      try {
        await transporter.sendMail({
          from: `"RUGGTECH Store" <${process.env.SMTP_USER}>`,
          to: subscriber.email,
          subject: `Great news! ${productName} is back in stock! - RUGGTECH`,
          html: `
            <!DOCTYPE html>
            <html>
            <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
              <div style="max-width: 600px; margin: 0 auto; background: white;">
                <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px 20px; text-align: center;">
                  <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">RUGGTECH</div>
                  <h1 style="margin: 10px 0 0; font-size: 20px;">🎉 Back in Stock!</h1>
                </div>
                <div style="padding: 30px 20px; text-align: center;">
                  <h2 style="color: #1e293b;">${productName}</h2>
                  <p style="color: #64748b; font-size: 16px;">Great news! The product you were waiting for is now back in stock.</p>
                  <a href="${siteUrl}/product/${productSlug || productId}" style="display: inline-block; background: #3b82f6; color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; margin-top: 20px;">Shop Now</a>
                  <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">Hurry! Stock is limited.</p>
                </div>
                <div style="background: #1e293b; color: #94a3b8; text-align: center; padding: 20px;">
                  <p style="margin: 0; font-size: 12px;">RUGGTECH - Rugged Technology for Every Adventure</p>
                </div>
              </div>
            </body>
            </html>
          `,
        })
        sent++

        try {
          await notion.pages.update({
            page_id: subscriber.id,
            archived: true,
          })
        } catch {}
      } catch (emailErr) {
        console.error('Failed to send back-in-stock email:', emailErr.message)
      }
    }

    return NextResponse.json({ success: true, notified: sent, total: subscribers.length })
  } catch (error) {
    console.error('Back in stock notification error:', error)
    return NextResponse.json({ error: 'Failed to process notifications', details: error.message }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    const { email, productId, productName } = await request.json()

    if (!email || !productId) {
      return NextResponse.json({ error: 'email and productId required' }, { status: 400 })
    }

    const dbId = await getSubscribersDb()
    if (!dbId) {
      return NextResponse.json({ error: 'Subscribers database not found. Please create a "Back in Stock Subscribers" database in Notion.' }, { status: 500 })
    }

    try {
      const existing = await notion.databases.query({
        database_id: dbId,
        filter: {
          and: [
            { property: 'Customer Email', email: { equals: email } },
            { property: 'Product ID', rich_text: { equals: productId } },
          ],
        },
      })

      if (existing.results.length > 0) {
        return NextResponse.json({ success: true, message: 'Already subscribed' })
      }
    } catch {}

    await notion.pages.create({
      parent: { database_id: dbId },
      properties: {
        'Customer Name': { title: [{ text: { content: `Notify: ${productName || productId}` } }] },
        'Customer Email': { email: email },
        'Product ID': { rich_text: [{ text: { content: productId } }] },
        'Search Query': { rich_text: [{ text: { content: productName || '' } }] },
        'Date': { date: { start: new Date().toISOString() } },
      },
    })

    return NextResponse.json({ success: true, message: 'Subscribed for back-in-stock notification' })
  } catch (error) {
    console.error('Back in stock subscribe error:', error)
    return NextResponse.json({ error: 'Failed to subscribe', details: error.message }, { status: 500 })
  }
}
