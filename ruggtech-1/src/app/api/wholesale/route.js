import { createClient } from '@sanity/client'
import { Client } from '@notionhq/client'
import nodemailer from 'nodemailer'
import { NextResponse } from 'next/server'

const sanityClient = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
})

const notion = new Client({ auth: process.env.NOTION_API_TOKEN })

const CATALOG_MAP = {
  'suzuki-parts': {
    schemaType: 'wholesaleSuzuki',
    title: 'Suzuki Parts Catalog',
    notionLabel: 'Suzuki Parts',
  },
  'precision-farming': {
    schemaType: 'wholesaleFarming',
    title: 'Precision Farming Catalog',
    notionLabel: 'Precision Farming',
  },
  'ruggtech-electronics': {
    schemaType: 'wholesaleElectronics',
    title: 'RUGGTECH Electronics Catalog',
    notionLabel: 'RUGGTECH Electronics',
  },
}

export async function GET(request) {
  const { searchParams } = new URL(request.url)

  // TEMPORARY DEBUG - remove after fixing
  if (searchParams.get('debug') === 'true') {
    return NextResponse.json({
      smtp_host: process.env.SMTP_HOST ? `✅ set (${process.env.SMTP_HOST})` : '❌ missing',
      smtp_port: process.env.SMTP_PORT ? `✅ set (${process.env.SMTP_PORT})` : '❌ missing',
      smtp_user: process.env.SMTP_USER ? `✅ set (${process.env.SMTP_USER})` : '❌ missing',
      smtp_pass: process.env.SMTP_PASS ? '✅ set (hidden)' : '❌ missing',
      notion_token: process.env.NOTION_API_TOKEN ? '✅ set (hidden)' : '❌ missing',
      notion_db: process.env.NOTION_DATABASE_ID ? `✅ set (${process.env.NOTION_DATABASE_ID})` : '❌ missing',
      notion_wholesale: process.env.NOTION_WHOLESALE_DB_ID ? `✅ set (${process.env.NOTION_WHOLESALE_DB_ID})` : '❌ missing',
    })
  }

  try {
    const catalog = searchParams.get('catalog')

    if (!catalog || !CATALOG_MAP[catalog]) {
      return NextResponse.json(
        { error: 'Invalid catalog. Use: suzuki-parts, precision-farming, or ruggtech-electronics' },
        { status: 400 }
      )
    }

    const { schemaType, title } = CATALOG_MAP[catalog]

    const products = await sanityClient.fetch(
      `*[_type == $type && isActive == true] | order(sortOrder asc, name asc) {
        _id,
        name,
        sku,
        description,
        "imageUrl": image.asset->url,
        wholesalePrice,
        retailPrice,
        stock,
        category,
        minOrderQty
      }`,
      { type: schemaType }
    )

    return NextResponse.json({
      success: true,
      catalog: catalog,
      title: title,
      products: products,
    })
  } catch (error) {
    console.error('Error fetching wholesale products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { catalog, customerName, email, phone, items, notes } = body

    if (!catalog || !CATALOG_MAP[catalog]) {
      return NextResponse.json({ error: 'Invalid catalog' }, { status: 400 })
    }

    if (!customerName || !email || !phone) {
      return NextResponse.json(
        { error: 'Customer name, email, and phone are required' },
        { status: 400 }
      )
    }

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'At least one item is required' },
        { status: 400 }
      )
    }

    const { notionLabel, title } = CATALOG_MAP[catalog]

    const totalAmount = items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    )
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
    const orderId = `WH-${Date.now().toString(36).toUpperCase()}`

    const itemsSummary = items
      .map((item) => `${item.name} x${item.quantity} @ TT$${item.price.toFixed(2)}`)
      .join('\n')

    const wholesaleDbId = process.env.NOTION_WHOLESALE_DB_ID
    const crmDbId = process.env.NOTION_DATABASE_ID

    if (wholesaleDbId) {
      try {
        await notion.pages.create({
          parent: { database_id: wholesaleDbId },
          properties: {
            'Customer Name': {
              title: [{ text: { content: customerName } }],
            },
            'Order ID': {
              rich_text: [{ text: { content: orderId } }],
            },
            'Email': { email: email },
            'Phone': { phone_number: phone },
            'Catalog Type': { select: { name: notionLabel } },
            'Items': {
              rich_text: [
                { text: { content: itemsSummary.substring(0, 2000) } },
              ],
            },
            'Total Amount': { number: totalAmount },
            'Item Count': { number: totalItems },
            'Notes': {
              rich_text: [{ text: { content: (notes || '').substring(0, 2000) } }],
            },
            'Status': { select: { name: 'New' } },
            'Date': { date: { start: new Date().toISOString() } },
          },
        })
        console.log('Wholesale order saved to Notion wholesale DB:', orderId)
      } catch (notionError) {
        console.error('Notion wholesale DB error (non-blocking):', notionError.message)
      }
    }

    if (crmDbId) {
      try {
        await notion.pages.create({
          parent: { database_id: crmDbId },
          properties: {
            'Event Type': { select: { name: 'Wholesale Order' } },
            'Customer Name': {
              title: [{ text: { content: customerName } }],
            },
            'Customer Email': { email: email },
            'Order ID': {
              rich_text: [{ text: { content: orderId } }],
            },
            'Items': {
              rich_text: [
                { text: { content: `[${notionLabel}] ${itemsSummary.substring(0, 1900)}` } },
              ],
            },
            'Total Value': { number: totalAmount },
            'Date': { date: { start: new Date().toISOString() } },
          },
        })
        console.log('Wholesale order tracked in CRM:', orderId)
      } catch (crmError) {
        console.error('CRM tracking error (non-blocking):', crmError.message)
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Shared items table HTML used in both emails
    const itemsHtml = items
      .map(
        (item) => `
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #333;">${item.name}${item.sku ? `<br><span style="color:#888;font-size:12px">SKU: ${item.sku}</span>` : ''}</td>
          <td style="padding: 8px; border-bottom: 1px solid #333; text-align: center;">${item.quantity}</td>
          <td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">TT$ ${item.price.toFixed(2)}</td>
          <td style="padding: 8px; border-bottom: 1px solid #333; text-align: right;">TT$ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
      )
      .join('')

    const itemsTableHtml = `
      <table style="width: 100%; border-collapse: collapse; color: #ffffff;">
        <thead>
          <tr style="border-bottom: 2px solid #6c63ff;">
            <th style="padding: 8px; text-align: left;">Product</th>
            <th style="padding: 8px; text-align: center;">Qty</th>
            <th style="padding: 8px; text-align: right;">Price</th>
            <th style="padding: 8px; text-align: right;">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
        <tfoot>
          <tr>
            <td colspan="3" style="padding: 12px 8px; text-align: right; font-weight: bold; color: #6c63ff;">Total:</td>
            <td style="padding: 12px 8px; text-align: right; font-weight: bold; color: #6c63ff; font-size: 18px;">TT$ ${totalAmount.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>
    `

    // Internal notification email (to you)
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 12px;">
        <div style="text-align: center; margin-bottom: 20px;">
          <h1 style="color: #6c63ff; margin: 0;">RUGGTECH</h1>
          <h2 style="color: #cccccc; margin: 5px 0 0;">Wholesale Order - ${title}</h2>
        </div>
        <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="color: #6c63ff; margin-top: 0;">Order Details</h3>
          <p><strong>Order ID:</strong> ${orderId}</p>
          <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="color: #6c63ff; margin-top: 0;">Customer Information</h3>
          <p><strong>Name:</strong> ${customerName}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
        </div>
        <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="color: #6c63ff; margin-top: 0;">Items Ordered</h3>
          ${itemsTableHtml}
        </div>
        ${notes ? `
        <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
          <h3 style="color: #6c63ff; margin-top: 0;">Additional Notes</h3>
          <p>${notes}</p>
        </div>
        ` : ''}
        <div style="text-align: center; padding: 16px; color: #666;">
          <p>This is a wholesale order from the RUGGTECH catalog.</p>
        </div>
      </div>
    `

    await transporter.sendMail({
      from: `"RUGGTECH Wholesale" <${process.env.SMTP_USER}>`,
      to: process.env.SMTP_USER,
      replyTo: email,
      subject: `Wholesale Order ${orderId} - ${title} - ${customerName}`,
      html: emailHtml,
    })

    // Customer confirmation email — now includes full items list
    try {
      await transporter.sendMail({
        from: `"RUGGTECH" <${process.env.SMTP_USER}>`,
        to: email,
        subject: `Your Wholesale Order ${orderId} - RUGGTECH`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #6c63ff;">RUGGTECH</h1>
              <h2 style="color: #cccccc;">Order Confirmation</h2>
            </div>
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <p>Hi ${customerName},</p>
              <p>Thank you for your wholesale order! We've received your request and will be in touch shortly.</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Catalog:</strong> ${title}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #6c63ff; margin-top: 0;">Your Items</h3>
              ${itemsTableHtml}
            </div>
            ${notes ? `
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #6c63ff; margin-top: 0;">Your Notes</h3>
              <p>${notes}</p>
            </div>
            ` : ''}
            <div style="text-align: center; padding: 16px; color: #666;">
              <p>We'll contact you via WhatsApp or email to confirm your order.</p>
            </div>
          </div>
        `,
      })
    } catch (customerEmailError) {
      console.error('Customer email error (non-blocking):', customerEmailError.message)
    }

    console.log('Wholesale order processed:', orderId)

    return NextResponse.json({
      success: true,
      orderId: orderId,
      message: 'Order submitted successfully! Check your email for confirmation.',
    })
  } catch (error) {
    console.error('Error processing wholesale order:', error)
    return NextResponse.json(
      { error: 'Failed to process order. Please try again.', details: error.message },
      { status: 500 }
    )
  }
}

export async function PUT(request) {
  try {
    const body = await request.json()
    const { type, customerName, email, phone, partNumber, partDescription } = body

    if (type !== 'part-request') {
      return NextResponse.json({ error: 'Invalid request type' }, { status: 400 })
    }

    if (!customerName || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    if (!partNumber && !partDescription) {
      return NextResponse.json(
        { error: 'Please enter a part number or description' },
        { status: 400 }
      )
    }

    const requestId = `PR-${Date.now().toString(36).toUpperCase()}`

    const crmDbId = process.env.NOTION_DATABASE_ID
    if (crmDbId) {
      try {
        await notion.pages.create({
          parent: { database_id: crmDbId },
          properties: {
            'Event Type': { select: { name: 'Part Request' } },
            'Customer Name': {
              title: [{ text: { content: customerName } }],
            },
            'Customer Email': { email: email },
            'Order ID': {
              rich_text: [{ text: { content: requestId } }],
            },
            'Items': {
              rich_text: [
                {
                  text: {
                    content: `Part #: ${partNumber || 'N/A'} | Description: ${partDescription || 'N/A'}`,
                  },
                },
              ],
            },
            'Date': { date: { start: new Date().toISOString() } },
          },
        })
        console.log('Part request tracked in CRM:', requestId)
      } catch (crmError) {
        console.error('CRM part request error (non-blocking):', crmError.message)
      }
    }

    const wholesaleDbId = process.env.NOTION_WHOLESALE_DB_ID
    if (wholesaleDbId) {
      try {
        await notion.pages.create({
          parent: { database_id: wholesaleDbId },
          properties: {
            'Customer Name': {
              title: [{ text: { content: customerName } }],
            },
            'Order ID': {
              rich_text: [{ text: { content: requestId } }],
            },
            'Email': { email: email },
            'Phone': { phone_number: phone },
            'Catalog Type': { select: { name: 'Part Request' } },
            'Items': {
              rich_text: [
                {
                  text: {
                    content: `Part #: ${partNumber || 'N/A'} | ${partDescription || 'No description'}`,
                  },
                },
              ],
            },
            'Status': { select: { name: 'New' } },
            'Date': { date: { start: new Date().toISOString() } },
          },
        })
      } catch (notionError) {
        console.error('Notion wholesale DB part request error (non-blocking):', notionError.message)
      }
    }

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    try {
      await transporter.sendMail({
        from: `"RUGGTECH Parts" <${process.env.SMTP_USER}>`,
        to: process.env.SMTP_USER,
        replyTo: email,
        subject: `Part Request ${requestId} - ${partNumber || 'No Part #'} - ${customerName}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff; padding: 20px; border-radius: 12px;">
            <div style="text-align: center; margin-bottom: 20px;">
              <h1 style="color: #6c63ff; margin: 0;">RUGGTECH</h1>
              <h2 style="color: #cccccc; margin: 5px 0 0;">Part Sourcing Request</h2>
            </div>
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #6c63ff; margin-top: 0;">Request Details</h3>
              <p><strong>Request ID:</strong> ${requestId}</p>
              <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
            </div>
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #6c63ff; margin-top: 0;">Customer</h3>
              <p><strong>Name:</strong> ${customerName}</p>
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Phone:</strong> ${phone}</p>
            </div>
            <div style="background: #1a1a2e; padding: 16px; border-radius: 8px; margin-bottom: 16px;">
              <h3 style="color: #6c63ff; margin-top: 0;">Part Information</h3>
              <p><strong>Part Number:</strong> ${partNumber || 'Not provided'}</p>
              <p><strong>Description:</strong> ${partDescription || 'Not provided'}</p>
            </div>
            <div style="text-align: center; padding: 16px; color: #666;">
              <p>This customer is looking for a part not in the catalog. Please follow up.</p>
            </div>
          </div>
        `,
      })
    } catch (emailError) {
      console.error('Part request email error (non-blocking):', emailError.message)
    }

    console.log('Part request processed:', requestId)

    return NextResponse.json({
      success: true,
      requestId,
      message: "We've received your request! Our team will reach out to you shortly.",
    })
  } catch (error) {
    console.error('Error processing part request:', error)
    return NextResponse.json(
      { error: 'Failed to submit request. Please try again.', details: error.message },
      { status: 500 }
    )
  }
}