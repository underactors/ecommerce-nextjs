// app/api/parts-request/route.js
import { createClient } from '@sanity/client'
import nodemailer from 'nodemailer'

const ADMIN_EMAIL = 'ruggtech@ruggtech.com'
const ADMIN_WHATSAPP = '18683661212'

const client = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2022-07-20',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

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

function buildAdminEmail(data, requestId) {
  const typeLabels = {
    part_not_found: 'Part / Product Not Found',
    price_quote:    'Price / Bulk Quote',
    custom_order:   'Custom Order',
    support_ticket: 'Support Ticket',
  }
  const urgencyLabels = { low: '🟢 Low', normal: '🟡 Normal', urgent: '🔴 Urgent' }
  const rows = [
    ['Inquiry Type',       typeLabels[data.inquiryType] || data.inquiryType],
    ['Product / Part',     data.partName || '—'],
    ['Vehicle Make',       data.vehicleMake || '—'],
    ['Vehicle Model',      data.vehicleModel || '—'],
    ['Vehicle Year',       data.vehicleYear || '—'],
    ['Part Number',        data.partNumber || '—'],
    ['Quantity',           data.quantity ?? 1],
    ['Urgency',            urgencyLabels[data.urgency] || data.urgency || 'Normal'],
    ['Notes',              data.notes || '—'],
    ['Customer Name',      data.customerName || '—'],
    ['Customer Email',     data.customerEmail || '—'],
    ['Customer WhatsApp',  data.customerWhatsapp || '—'],
    ['Preferred Contact',  data.preferredContact || '—'],
    ['Request ID',         requestId],
  ]
  const tableRows = rows.map(([label, val]) =>
    `<tr>
      <td style="padding:6px 10px;color:#64748b;font-weight:600;white-space:nowrap;border-bottom:1px solid #e2e8f0;">${label}</td>
      <td style="padding:6px 10px;color:#1e293b;border-bottom:1px solid #e2e8f0;">${val}</td>
    </tr>`
  ).join('')

  const studioUrl = `https://pb8lzqs5.sanity.studio/production/structure/partsRequest`

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="utf-8"><title>New Inquiry — RUGGTECH</title></head>
    <body style="font-family:Arial,sans-serif;background:#f5f5f5;margin:0;padding:0;">
      <div style="max-width:600px;margin:0 auto;background:white;">
        <div style="background:linear-gradient(135deg,#1e293b,#0f172a);padding:24px 20px;text-align:center;">
          <div style="font-size:24px;font-weight:bold;color:#3b82f6;margin-bottom:6px;">RUGGTECH</div>
          <h2 style="margin:0;color:white;font-size:18px;">
            🔔 New Customer Inquiry
          </h2>
        </div>
        <div style="padding:24px 20px;">
          <table style="width:100%;border-collapse:collapse;font-size:14px;">
            ${tableRows}
          </table>
          <div style="margin-top:24px;text-align:center;">
            <a href="${studioUrl}"
               style="display:inline-block;background:#3b82f6;color:white;padding:12px 28px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;">
              Open in Sanity Studio
            </a>
          </div>
        </div>
        <div style="background:#f8fafc;padding:12px 20px;text-align:center;color:#94a3b8;font-size:12px;">
          RUGGTECH Admin — reply to this email to respond directly to the customer
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request) {
  try {
    const data = await request.json()

    // Basic validation
    if (!data.partName && !data.notes) {
      return Response.json({ error: 'Please provide a product/part name or notes.' }, { status: 400 })
    }
    if (!data.customerEmail && !data.customerWhatsapp) {
      return Response.json({ error: 'A contact email or WhatsApp number is required.' }, { status: 400 })
    }

    // Write to Sanity
    const doc = await client.create({
      _type: 'partsRequest',
      inquiryType:       data.inquiryType || 'part_not_found',
      partName:          data.partName || '',
      vehicleMake:       data.vehicleMake || '',
      vehicleModel:      data.vehicleModel || '',
      vehicleYear:       data.vehicleYear || '',
      partNumber:        data.partNumber || '',
      quantity:          Number(data.quantity) || 1,
      urgency:           data.urgency || 'normal',
      notes:             data.notes || '',
      customerName:      data.customerName || '',
      customerEmail:     data.customerEmail || '',
      customerWhatsapp:  data.customerWhatsapp || '',
      customerId:        data.customerId || '',
      preferredContact:  data.preferredContact || 'email',
      status:            'new',
      createdAt:         new Date().toISOString(),
      source:            'chat',
    })

    const requestId = doc._id

    // Admin email (non-blocking)
    try {
      const transporter = createTransporter()
      if (transporter) {
        const typeLabel = {
          part_not_found: 'Part Not Found',
          price_quote:    'Price Quote',
          custom_order:   'Custom Order',
          support_ticket: 'Support Ticket',
        }[data.inquiryType] || data.inquiryType

        await transporter.sendMail({
          from:    `"RUGGTECH Chat" <${process.env.SMTP_USER}>`,
          to:      ADMIN_EMAIL,
          subject: `🔧 New Inquiry — ${typeLabel}: ${data.partName || data.notes?.slice(0, 40) || 'General'}`,
          html:    buildAdminEmail(data, requestId),
          replyTo: data.customerEmail || undefined,
        })
      }
    } catch (emailErr) {
      console.error('Admin email failed (non-blocking):', emailErr.message)
    }

    // Build WhatsApp deep link for admin notification
    const waText = [
      `🔔 New RUGGTECH Inquiry`,
      `Type: ${data.inquiryType || 'General'}`,
      `Product: ${data.partName || data.notes?.slice(0, 60) || '—'}`,
      `Customer: ${data.customerName || '—'}`,
      `Contact: ${data.customerEmail || data.customerWhatsapp || '—'}`,
      `ID: ${requestId}`,
    ].join('\n')

    const whatsappAdminLink = `https://wa.me/${ADMIN_WHATSAPP}?text=${encodeURIComponent(waText)}`

    // Build customer WhatsApp reply link (if they want replies on WhatsApp)
    let whatsappReplyLink = null
    if (data.customerWhatsapp) {
      const replyText = [
        `Hi ${data.customerName || 'there'}, this is RUGGTECH.`,
        `We received your inquiry for: ${data.partName || 'your request'}.`,
        `We'll get back to you soon!`,
      ].join(' ')
      whatsappReplyLink = `https://wa.me/${data.customerWhatsapp}?text=${encodeURIComponent(replyText)}`
    }

    return Response.json({
      success: true,
      requestId,
      whatsappAdminLink,
      whatsappReplyLink,
    })

  } catch (error) {
    console.error('parts-request POST error:', error)
    return Response.json({ error: 'Failed to submit inquiry.', details: error.message }, { status: 500 })
  }
}
