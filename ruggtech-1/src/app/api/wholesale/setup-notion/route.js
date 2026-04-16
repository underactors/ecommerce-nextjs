import { Client } from '@notionhq/client'
import { NextResponse } from 'next/server'

const notion = new Client({ auth: process.env.NOTION_API_TOKEN })

export async function POST() {
  try {
    const searchResponse = await notion.search({
      query: 'Wholesale Orders',
    })

    const existing = searchResponse.results.find(
      (r) => r.object === 'database' && r.title?.[0]?.plain_text === 'Wholesale Orders'
    )

    if (existing) {
      return NextResponse.json({
        success: true,
        databaseId: existing.id,
        message: 'Wholesale Orders database already exists',
      })
    }

    const crmDbId = process.env.NOTION_DATABASE_ID
    let parentPageId = null

    if (crmDbId) {
      try {
        const parentPage = await notion.pages.create({
          parent: { database_id: crmDbId },
          properties: {
            'Customer Name': { title: [{ text: { content: 'Wholesale Orders Hub' } }] },
          },
        })
        parentPageId = parentPage.id
      } catch (e) {
        console.error('Could not create parent page in CRM:', e.message)
      }
    }

    if (!parentPageId) {
      return NextResponse.json(
        { success: false, error: 'Could not create a parent page in Notion. Check your NOTION_DATABASE_ID and API token.' },
        { status: 400 }
      )
    }

    const response = await notion.databases.create({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [{ type: 'text', text: { content: 'Wholesale Orders' } }],
      properties: {
        'Customer Name': { title: {} },
        'Order ID': { rich_text: {} },
        'Email': { email: {} },
        'Phone': { phone_number: {} },
        'Catalog Type': {
          select: {
            options: [
              { name: 'Suzuki Parts', color: 'red' },
              { name: 'Precision Farming', color: 'green' },
              { name: 'RUGGTECH Electronics', color: 'blue' },
              { name: 'Part Request', color: 'orange' },
            ],
          },
        },
        'Items': { rich_text: {} },
        'Total Amount': { number: { format: 'dollar' } },
        'Item Count': { number: {} },
        'Notes': { rich_text: {} },
        'Status': {
          select: {
            options: [
              { name: 'New', color: 'yellow' },
              { name: 'Processing', color: 'orange' },
              { name: 'Confirmed', color: 'green' },
              { name: 'Shipped', color: 'blue' },
              { name: 'Completed', color: 'purple' },
              { name: 'Cancelled', color: 'red' },
            ],
          },
        },
        'Date': { date: {} },
      },
    })

    return NextResponse.json({
      success: true,
      databaseId: response.id,
      message: 'Wholesale Orders database created successfully. Save this databaseId as NOTION_WHOLESALE_DB_ID.',
    })
  } catch (error) {
    console.error('Error creating Notion database:', error)
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    )
  }
}
