import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

const notion = new Client({ auth: process.env.NOTION_API_TOKEN })

let stockHistoryDbId = process.env.NOTION_STOCK_HISTORY_DB_ID || null

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

async function getOrCreateStockHistoryDb() {
  if (stockHistoryDbId) return stockHistoryDbId

  try {
    const searchResponse = await notion.search({
      filter: { property: 'object', value: 'database' },
      query: 'Stock History',
    })

    const existing = searchResponse.results.find(
      db => db.title?.[0]?.plain_text === 'Stock History'
    )

    if (existing) {
      stockHistoryDbId = existing.id
      return stockHistoryDbId
    }
  } catch {}

  stockHistoryDbId = process.env.NOTION_DATABASE_ID
  return stockHistoryDbId
}

export async function GET(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const productId = searchParams.get('productId')

    const dbId = await getOrCreateStockHistoryDb()
    if (!dbId) {
      return NextResponse.json({ success: true, history: [] })
    }

    const filterConditions = {
      and: [
        { property: 'Event Type', select: { equals: 'Stock Change' } },
      ],
    }

    if (productId) {
      filterConditions.and.push({
        property: 'Product ID',
        rich_text: { equals: productId },
      })
    }

    let history = []
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        filter: filterConditions,
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 50,
      })

      history = response.results.map(page => ({
        id: page.id,
        productName: page.properties['Customer Name']?.title?.[0]?.plain_text || '',
        productId: page.properties['Product ID']?.rich_text?.[0]?.plain_text || '',
        oldStock: page.properties['Total Value']?.number || 0,
        newStock: page.properties['Results Count']?.number || 0,
        reason: page.properties['Search Query']?.rich_text?.[0]?.plain_text || '',
        user: page.properties['User ID']?.rich_text?.[0]?.plain_text || '',
        timestamp: page.properties['Date']?.date?.start || '',
      }))
    } catch {
      history = []
    }

    return NextResponse.json({ success: true, history })
  } catch (error) {
    console.error('Stock history error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock history', details: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { productId, productName, oldStock, newStock, reason, userId } = await request.json()

    const dbId = await getOrCreateStockHistoryDb()
    if (!dbId) {
      return NextResponse.json({ success: false, error: 'No Notion database configured' })
    }

    const changeAmount = (newStock || 0) - (oldStock || 0)

    try {
      await notion.pages.create({
        parent: { database_id: dbId },
        properties: {
          'Event Type': { select: { name: 'Stock Change' } },
          'Customer Name': { title: [{ text: { content: `Stock: ${productName || 'Unknown'}` } }] },
          'Product ID': { rich_text: [{ text: { content: productId || '' } }] },
          'Search Query': { rich_text: [{ text: { content: `${reason || 'Manual update'} | Change: ${changeAmount > 0 ? '+' : ''}${changeAmount}` } }] },
          'Total Value': { number: oldStock || 0 },
          'Results Count': { number: newStock || 0 },
          'User ID': { rich_text: [{ text: { content: userId || 'system' } }] },
          'Date': { date: { start: new Date().toISOString() } },
        },
      })
    } catch (notionError) {
      console.error('Notion stock history logging failed:', notionError.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Stock history POST error:', error)
    return NextResponse.json({ error: 'Failed to log stock change', details: error.message }, { status: 500 })
  }
}
