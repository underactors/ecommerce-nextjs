import { createClient } from '@sanity/client'
import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'
import { currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

const sanityClient = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

const notion = new Client({ auth: process.env.NOTION_API_TOKEN })

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

function generateSKU(type, id) {
  const typePrefix = {
    product: 'PRD', phone: 'PHN', car: 'CAR', agritechPage: 'AGR',
    offgrid: 'OFG', phoneacc: 'PAC', electronic: 'ELC', watch: 'WCH', product2: 'PR2',
  }
  return `${typePrefix[type] || 'UNK'}-${(id || '').slice(-6).toUpperCase()}`
}

function getStatus(stock) {
  if (stock === undefined || stock === null || stock <= 0) return 'Out of Stock'
  if (stock <= 5) return 'Low Stock'
  if (stock <= 10) return 'Warning'
  return 'In Stock'
}

let inventoryDbId = null

async function getInventoryDb() {
  if (inventoryDbId) return inventoryDbId

  try {
    const searchResponse = await notion.search({
      filter: { property: 'object', value: 'database' },
      query: 'Product Inventory',
    })

    const existing = searchResponse.results.find(
      db => db.title?.[0]?.plain_text?.includes('Product Inventory')
    )

    if (existing) {
      inventoryDbId = existing.id
      return inventoryDbId
    }
  } catch {}

  return process.env.NOTION_DATABASE_ID || null
}

export async function POST() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const products = await sanityClient.fetch(
      `*[_type in $types]{ _id, _type, name, price, stock, brand }`,
      { types: PRODUCT_TYPES }
    )

    const dbId = await getInventoryDb()
    if (!dbId) {
      return NextResponse.json({ error: 'No Notion inventory database found' }, { status: 500 })
    }

    let synced = 0
    let errors = 0

    for (const product of products) {
      try {
        const stock = product.stock || 0
        const sku = generateSKU(product._type, product._id)
        const status = getStatus(stock)

        await notion.pages.create({
          parent: { database_id: dbId },
          properties: {
            'Customer Name': { title: [{ text: { content: product.name || 'Unknown' } }] },
            'Event Type': { select: { name: 'Inventory Sync' } },
            'Product ID': { rich_text: [{ text: { content: product._id } }] },
            'Search Query': { rich_text: [{ text: { content: `SKU: ${sku} | Status: ${status} | Category: ${product._type}` } }] },
            'Total Value': { number: product.price || 0 },
            'Results Count': { number: stock },
            'User ID': { rich_text: [{ text: { content: 'system-sync' } }] },
            'Date': { date: { start: new Date().toISOString() } },
          },
        })
        synced++
      } catch (err) {
        console.error('Failed to sync product:', product.name, err.message)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: products.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error('Notion sync error:', error)
    return NextResponse.json({ error: 'Failed to sync to Notion', details: error.message }, { status: 500 })
  }
}

export async function GET() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const dbId = await getInventoryDb()
    if (!dbId) {
      return NextResponse.json({ error: 'No Notion inventory database found' }, { status: 500 })
    }

    let updates = []
    try {
      const response = await notion.databases.query({
        database_id: dbId,
        filter: {
          property: 'Event Type',
          select: { equals: 'Stock Update' },
        },
        sorts: [{ property: 'Date', direction: 'descending' }],
        page_size: 50,
      })

      for (const page of response.results) {
        const productId = page.properties['Product ID']?.rich_text?.[0]?.plain_text
        const newStock = page.properties['Results Count']?.number

        if (productId && newStock !== undefined && newStock !== null) {
          try {
            await sanityClient.patch(productId).set({ stock: newStock, inStock: newStock > 0 }).commit()
            updates.push({ productId, newStock, success: true })

            await notion.pages.update({ page_id: page.id, archived: true })
          } catch (err) {
            updates.push({ productId, newStock, success: false, error: err.message })
          }
        }
      }
    } catch (queryErr) {
      console.error('Failed to query Notion for updates:', queryErr.message)
    }

    return NextResponse.json({ success: true, updates, count: updates.length })
  } catch (error) {
    console.error('Notion read-back error:', error)
    return NextResponse.json({ error: 'Failed to read from Notion', details: error.message }, { status: 500 })
  }
}
