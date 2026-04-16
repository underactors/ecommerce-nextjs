import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'
import nodemailer from 'nodemailer'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

const sanityClient = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const PRODUCT_TYPES = ['product', 'phone', 'car', 'agritechPage', 'offgrid', 'phoneacc', 'electronic', 'watch', 'product2']

async function isAdmin() {
  try {
    const user = await currentUser()
    if (!user) return false
    const email = user.emailAddresses?.[0]?.emailAddress
    return email && ADMIN_EMAILS.includes(email)
  } catch {
    return false
  }
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

export async function GET() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const products = await sanityClient.fetch(
      `*[_type in $types && (stock <= 10 || !defined(stock))]{ _id, _type, name, stock, price, brand, "imageUrl": image[0].asset->url }`,
      { types: PRODUCT_TYPES }
    )

    const outOfStock = products.filter(p => !p.stock || p.stock <= 0)
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5)
    const warning = products.filter(p => p.stock > 5 && p.stock <= 10)

    return NextResponse.json({
      success: true,
      alerts: { outOfStock, lowStock, warning },
      counts: {
        outOfStock: outOfStock.length,
        lowStock: lowStock.length,
        warning: warning.length,
        total: products.length,
      },
    })
  } catch (error) {
    console.error('Stock alerts error:', error)
    return NextResponse.json({ error: 'Failed to fetch alerts', details: error.message }, { status: 500 })
  }
}

export async function POST() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const products = await sanityClient.fetch(
      `*[_type in $types && (stock <= 5 || !defined(stock))]{ _id, _type, name, stock, price, brand }`,
      { types: PRODUCT_TYPES }
    )

    if (products.length === 0) {
      return NextResponse.json({ success: true, message: 'No low stock items to report' })
    }

    const transporter = createTransporter()
    if (!transporter) {
      return NextResponse.json({ error: 'SMTP not configured' }, { status: 500 })
    }

    const outOfStock = products.filter(p => !p.stock || p.stock <= 0)
    const lowStock = products.filter(p => p.stock > 0 && p.stock <= 5)

    const html = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"><title>Stock Alert - RUGGTECH</title></head>
      <body style="font-family: Arial, sans-serif; background: #f5f5f5; margin: 0; padding: 0;">
        <div style="max-width: 600px; margin: 0 auto; background: white;">
          <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px 20px; text-align: center;">
            <div style="font-size: 28px; font-weight: bold; color: #3b82f6;">RUGGTECH</div>
            <h1 style="margin: 10px 0 0; font-size: 20px;">⚠️ Low Stock Alert</h1>
          </div>
          <div style="padding: 30px 20px;">
            <p style="color: #64748b;">The following products need attention:</p>
            ${outOfStock.length > 0 ? `
              <h3 style="color: #ef4444;">❌ Out of Stock (${outOfStock.length})</h3>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                <tr style="background: #fef2f2;"><th style="padding: 8px; text-align: left; border: 1px solid #fecaca;">Product</th><th style="padding: 8px; text-align: center; border: 1px solid #fecaca;">Stock</th></tr>
                ${outOfStock.map(p => `<tr><td style="padding: 8px; border: 1px solid #fecaca;">${p.name || 'Unknown'}</td><td style="padding: 8px; text-align: center; border: 1px solid #fecaca; color: #ef4444; font-weight: bold;">${p.stock || 0}</td></tr>`).join('')}
              </table>
            ` : ''}
            ${lowStock.length > 0 ? `
              <h3 style="color: #f59e0b;">⚠️ Low Stock (${lowStock.length})</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #fffbeb;"><th style="padding: 8px; text-align: left; border: 1px solid #fed7aa;">Product</th><th style="padding: 8px; text-align: center; border: 1px solid #fed7aa;">Stock</th></tr>
                ${lowStock.map(p => `<tr><td style="padding: 8px; border: 1px solid #fed7aa;">${p.name || 'Unknown'}</td><td style="padding: 8px; text-align: center; border: 1px solid #fed7aa; color: #f59e0b; font-weight: bold;">${p.stock}</td></tr>`).join('')}
              </table>
            ` : ''}
          </div>
          <div style="background: #1e293b; color: #94a3b8; text-align: center; padding: 20px;">
            <p style="margin: 0; font-size: 12px;">RUGGTECH Inventory Management System</p>
          </div>
        </div>
      </body>
      </html>
    `

    await transporter.sendMail({
      from: `"RUGGTECH Inventory" <${process.env.SMTP_USER}>`,
      to: ADMIN_EMAILS[0],
      subject: `⚠️ Stock Alert: ${outOfStock.length} out of stock, ${lowStock.length} low stock items`,
      html,
    })

    return NextResponse.json({ success: true, message: 'Alert email sent', counts: { outOfStock: outOfStock.length, lowStock: lowStock.length } })
  } catch (error) {
    console.error('Stock alert email error:', error)
    return NextResponse.json({ error: 'Failed to send alert email', details: error.message }, { status: 500 })
  }
}
