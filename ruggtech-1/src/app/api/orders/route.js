// app/api/orders/route.js
import { createClient } from '@sanity/client'
import nodemailer from 'nodemailer'
import { auth, currentUser } from '@clerk/nextjs/server'
import { trackCustomerOrder } from '../../lib/notion'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL
    || ('https://' + (process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'ruggtech.com'))
}

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

const client = createClient({
  projectId: 'pb8lzqs5',
  dataset: 'production',
  apiVersion: '2022-07-20',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
})

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) return null;
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: { rejectUnauthorized: true }
  });
}

const generateShippingUpdateEmail = (order, updateType) => {
  const statusMessages = {
    processing: {
      title: 'Your Order is Being Prepared',
      icon: '📦',
      message: 'Great news! Your order is now being prepared for shipment.',
      color: '#3b82f6'
    },
    shipped: {
      title: 'Your Order Has Been Shipped',
      icon: '🚚',
      message: 'Your order is on its way! Track your package using the tracking number below.',
      color: '#10b981'
    },
    delivered: {
      title: 'Your Order Has Been Delivered',
      icon: '✅',
      message: 'Your order has been delivered. We hope you enjoy your purchase!',
      color: '#22c55e'
    },
    cancelled: {
      title: 'Your Order Has Been Cancelled',
      icon: '❌',
      message: 'Your order has been cancelled. If you have questions, please contact support.',
      color: '#ef4444'
    }
  }

  const statusInfo = statusMessages[order.status] || {
    title: 'Order Update',
    icon: '📋',
    message: 'Your order status has been updated.',
    color: '#6366f1'
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${statusInfo.title} - RUGGTECH</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; background: white; }
        .header { background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px 20px; text-align: center; }
        .logo { font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 10px; }
        .content { padding: 30px 20px; background: #f8fafc; }
        .status-card { background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .status-icon { font-size: 48px; margin-bottom: 15px; }
        .status-title { font-size: 24px; font-weight: bold; color: ${statusInfo.color}; margin-bottom: 10px; }
        .status-message { color: #64748b; font-size: 16px; }
        .order-details { background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; margin-bottom: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #64748b; }
        .detail-value { color: #1e293b; font-weight: 500; }
        .tracking-box { background: linear-gradient(135deg, ${statusInfo.color}, ${statusInfo.color}dd); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center; }
        .tracking-number { font-size: 20px; font-weight: bold; letter-spacing: 2px; margin: 10px 0; }
        .tracking-link { color: white; text-decoration: underline; }
        .items-section { background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .items-header { color: #1e293b; font-size: 18px; font-weight: 600; margin-bottom: 15px; }
        .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e2e8f0; }
        .item:last-child { border-bottom: none; }
        .item-name { color: #1e293b; font-weight: 500; }
        .item-qty { color: #64748b; font-size: 14px; }
        .item-price { color: #f59e0b; font-weight: 600; }
        .footer { background: #1e293b; color: #94a3b8; text-align: center; padding: 30px 20px; }
        .footer-logo { color: #3b82f6; font-size: 20px; font-weight: bold; margin-bottom: 10px; }
        .support-btn { display: inline-block; background: #3b82f6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 15px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">RUGGTECH</div>
          <h1 style="margin: 0; font-size: 20px;">Order Update</h1>
        </div>
        
        <div class="content">
          <div class="status-card">
            <div class="status-icon">${statusInfo.icon}</div>
            <div class="status-title">${statusInfo.title}</div>
            <div class="status-message">${statusInfo.message}</div>
          </div>
          
          <div class="order-details">
            <div class="detail-row">
              <span class="detail-label">Order Number:</span>
              <span class="detail-value">${order.orderId}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Order Date:</span>
              <span class="detail-value">${new Date(order.createdAt).toLocaleDateString()}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Status:</span>
              <span class="detail-value" style="color: ${statusInfo.color}; text-transform: capitalize;">${order.status}</span>
            </div>
            ${order.trackingNumber ? `
            <div class="detail-row">
              <span class="detail-label">Tracking Number:</span>
              <span class="detail-value">${order.trackingNumber}</span>
            </div>
            ` : ''}
          </div>

          <div class="tracking-box">
            ${order.trackingNumber ? `
            <div style="font-size: 14px; margin-bottom: 8px;">Track Your Package</div>
            <div class="tracking-number">${order.trackingNumber}</div>
            ` : `
            <div style="font-size: 14px; margin-bottom: 8px;">View Your Order</div>
            `}
            <a href="${getSiteUrl()}/track/${order.orderId}?email=${encodeURIComponent(order.customerEmail || '')}"
               style="display: inline-block; background: white; color: ${statusInfo.color}; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              📦 ${order.trackingNumber ? 'Track My Order' : 'View Order Details'}
            </a>
            <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Click the button above to see your full order timeline</div>
          </div>

          ${order.shippingAddress ? `
          <div class="order-details">
            <div class="items-header">Shipping Address</div>
            <p style="margin: 0; color: #1e293b;">
              ${order.shippingAddress.fullName || order.customerName}<br>
              ${order.shippingAddress.address}<br>
              ${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}<br>
              ${order.shippingAddress.country}
            </p>
          </div>
          ` : ''}

          <div class="items-section">
            <div class="items-header">Order Items</div>
            ${order.items?.map(item => `
              <div class="item">
                <div>
                  <div class="item-name">${item.name}</div>
                  <div class="item-qty">Qty: ${item.quantity}</div>
                </div>
                <div class="item-price">$${(item.total || item.price * item.quantity).toFixed(2)}</div>
              </div>
            `).join('') || '<p>No items</p>'}
            <div class="item" style="border-top: 2px solid #e2e8f0; margin-top: 15px; padding-top: 15px;">
              <div class="item-name" style="font-weight: bold;">Total</div>
              <div class="item-price" style="font-size: 18px;">$${order.total?.toFixed(2) || '0.00'}</div>
            </div>
          </div>
        </div>
        
        <div class="footer">
          <div class="footer-logo">RUGGTECH</div>
          <p>Need help? Contact our support team.</p>
          <p style="font-size: 12px;">This email was sent to ${order.customerEmail}</p>
        </div>
      </div>
    </body>
    </html>
  `
}

export async function POST(request) {
  try {
    console.log('Creating order')
    
    const orderData = await request.json()
    console.log('Order data received:', {
      orderId: orderData.orderId,
      customerEmail: orderData.customerEmail,
      paymentMethod: orderData.paymentMethod,
      itemCount: orderData.items?.length || 0,
      total: orderData.total
    })
    
    if (!orderData.orderId || !orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
      console.error('Missing required order data')
      return Response.json({ 
        error: 'Missing required order data',
        details: 'orderId, customerEmail, and items are required'
      }, { status: 400 })
    }

    try {
      console.log('Testing Sanity connection...')
      await client.fetch('*[_type == "order"][0]')
      console.log('Sanity connection successful')
    } catch (connectionError) {
      console.error('Sanity connection failed:', connectionError)
      return Response.json({
        error: 'Database connection error',
        details: 'Failed to connect to Sanity. Check your API token and project configuration.'
      }, { status: 500 })
    }

    console.log('Creating order in Sanity...')
    
    let validatedPromoCode = ''
    let validatedDiscount = 0
    
    if (orderData.promoCode) {
      try {
        const promoValidation = await client.fetch(
          '*[_type == "promoCode" && code == $code && isActive == true][0]',
          { code: orderData.promoCode }
        )
        
        if (promoValidation) {
          const isExpired = promoValidation.expiresAt && new Date(promoValidation.expiresAt) < new Date()
          const isMaxedOut = promoValidation.maxUses && promoValidation.usedCount >= promoValidation.maxUses
          
          let isUserMaxedOut = false
          if (promoValidation.maxUsesPerUser && orderData.userId) {
            const userUsageCount = await client.fetch(
              `count(*[_type == "order" && promoCode == $code && userId == $userId])`,
              { code: promoValidation.code, userId: orderData.userId }
            )
            isUserMaxedOut = userUsageCount >= promoValidation.maxUsesPerUser
          }
          
          if (!isExpired && !isMaxedOut && !isUserMaxedOut) {
            validatedPromoCode = promoValidation.code
            validatedDiscount = parseFloat(orderData.subtotal || 0) * (promoValidation.discountPercent / 100)
            console.log('Promo code validated:', validatedPromoCode, 'Discount:', validatedDiscount)
          } else {
            console.log('Promo code invalid, expired, or user limit reached:', orderData.promoCode)
          }
        }
      } catch (promoError) {
        console.error('Error validating promo code:', promoError)
      }
    }
    
    const order = await client.create({
      _type: 'order',
      orderId: orderData.orderId,
      userId: orderData.userId || '',
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName || '',
      customerPhone: orderData.customerPhone || '',
      paymentMethod: orderData.paymentMethod,
      paymentDetails: orderData.paymentDetails || {},
      items: orderData.items.map(item => ({
        id: item.id || '',
        name: item.name || '',
        price: parseFloat(item.price) || 0,
        quantity: parseInt(item.quantity) || 1,
        total: parseFloat(item.total) || 0,
        imageUrl: item.imageUrl || '',
        slug: item.slug || '',
        productType: item.type || '',
      })),
      shippingAddress: orderData.shippingAddress || {},
      shippingMethod: orderData.shippingMethod ? {
        provider: orderData.shippingMethod.provider || '',
        serviceName: orderData.shippingMethod.serviceName || '',
        amount: parseFloat(orderData.shippingMethod.amount) || 0,
        currency: orderData.shippingMethod.currency || 'USD',
        estimatedDays: orderData.shippingMethod.estimatedDays || '',
        rateId: orderData.shippingMethod.id || '',
      } : null,
      billingAddress: orderData.billingAddress || {},
      subtotal: parseFloat(orderData.subtotal) || 0,
      tax: parseFloat(orderData.tax) || 0,
      shipping: parseFloat(orderData.shipping) || 0,
      discount: validatedDiscount,
      promoCode: validatedPromoCode,
      total: parseFloat(orderData.total) || 0,
      status: orderData.status || 'pending',
      trackingNumber: orderData.trackingNumber || '',
      notes: orderData.notes || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    })

    console.log('Order created successfully:', order._id)

    try {
      for (const item of orderData.items) {
        const itemId = item.id || item._id
        if (itemId) {
          try {
            const product = await client.fetch('*[_id == $id][0]{ stock, stockQuantity, name }', { id: itemId })
            if (product) {
              const qty = parseInt(item.quantity) || 1
              // Use stockQuantity if available (what Studio shows), fall back to stock
              const oldStock = product.stockQuantity ?? product.stock ?? 0
              const newStock = Math.max(0, oldStock - qty)
              await client.patch(itemId).set({
                stock: newStock,
                stockQuantity: newStock,
                inStock: newStock > 0,
              }).commit()

              const origin = request.headers.get('origin') || request.headers.get('host') || ''
              const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
              fetch(`${baseUrl}/api/admin/stock/history`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  productId: itemId,
                  productName: product.name || item.name,
                  oldStock,
                  newStock,
                  reason: `Sale - Order #${orderData.orderId}`,
                  userId: orderData.userId || 'customer',
                }),
              }).catch(() => {})
            }
          } catch (stockErr) {
            console.error('Stock decrement failed for item:', itemId, stockErr.message)
          }
        }
      }
    } catch (stockError) {
      console.error('Stock decrement process error:', stockError.message)
    }

    // Send admin notification email for every new order
    try {
      const transporter = createTransporter()
      if (transporter) {
        const itemLines = orderData.items.map(i =>
          `<tr>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;">${i.name}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:center;">${i.quantity}</td>
            <td style="padding:6px 8px;border-bottom:1px solid #e2e8f0;text-align:right;">$${parseFloat(i.price).toFixed(2)}</td>
          </tr>`
        ).join('')
        await transporter.sendMail({
          from: `"RUGGTECH Store" <${process.env.SMTP_USER}>`,
          to: ADMIN_EMAILS.join(','),
          subject: `🛒 New Order ${orderData.orderId} — $${parseFloat(orderData.total).toFixed(2)}`,
          html: `
            <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;">
              <div style="background:#1e293b;color:white;padding:20px;text-align:center;">
                <h2 style="margin:0;color:#3b82f6;">🛡️ RUGGTECH — New Order</h2>
              </div>
              <div style="padding:20px;">
                <table style="width:100%;border-collapse:collapse;margin-bottom:16px;">
                  <tr><td style="color:#64748b;padding:4px 0;width:140px;">Order ID</td><td style="font-weight:600;">${orderData.orderId}</td></tr>
                  <tr><td style="color:#64748b;padding:4px 0;">Customer</td><td>${orderData.customerName || ''} &lt;${orderData.customerEmail || ''}&gt;</td></tr>
                  <tr><td style="color:#64748b;padding:4px 0;">Phone</td><td>${orderData.customerPhone || '—'}</td></tr>
                  <tr><td style="color:#64748b;padding:4px 0;">Payment</td><td>${orderData.paymentMethod}</td></tr>
                  <tr><td style="color:#64748b;padding:4px 0;">Total</td><td style="font-weight:700;color:#10b981;font-size:18px;">$${parseFloat(orderData.total).toFixed(2)}</td></tr>
                </table>
                <h3 style="margin:16px 0 8px;">Items Ordered</h3>
                <table style="width:100%;border-collapse:collapse;font-size:14px;">
                  <thead><tr style="background:#f1f5f9;">
                    <th style="padding:6px 8px;text-align:left;">Product</th>
                    <th style="padding:6px 8px;text-align:center;">Qty</th>
                    <th style="padding:6px 8px;text-align:right;">Price</th>
                  </tr></thead>
                  <tbody>${itemLines}</tbody>
                </table>
                ${orderData.shippingAddress ? `
                <h3 style="margin:16px 0 8px;">Ship To</h3>
                <p style="margin:0;color:#374151;">
                  ${orderData.shippingAddress.fullName || ''}<br/>
                  ${orderData.shippingAddress.address || ''}<br/>
                  ${orderData.shippingAddress.city || ''}, ${orderData.shippingAddress.state || ''} ${orderData.shippingAddress.zipCode || ''}<br/>
                  ${orderData.shippingAddress.country || ''}
                </p>` : ''}
              </div>
              <div style="background:#f8fafc;padding:12px 20px;text-align:center;color:#94a3b8;font-size:12px;">
                RUGGTECH Admin Notification — reply to this email to contact the customer
              </div>
            </div>
          `,
          replyTo: orderData.customerEmail || undefined,
        })
        console.log('Admin order notification sent for:', orderData.orderId)
      }
    } catch (adminEmailErr) {
      console.error('Admin email failed (non-blocking):', adminEmailErr.message)
    }

    if (validatedPromoCode) {
      try {
        const promoToUpdate = await client.fetch(
          '*[_type == "promoCode" && code == $code][0]',
          { code: validatedPromoCode }
        )
        if (promoToUpdate) {
          await client.patch(promoToUpdate._id).inc({ usedCount: 1 }).commit()
          console.log('Promo code usage incremented:', validatedPromoCode)
        }
      } catch (promoError) {
        console.error('Error incrementing promo code usage:', promoError)
      }
    }
    
    trackCustomerOrder({
      orderId: order.orderId,
      customerEmail: order.customerEmail,
      customerName: order.customerName,
      items: orderData.items,
      total: order.total,
      paymentMethod: order.paymentMethod,
      userId: order.userId
    }).catch(err => console.error('Notion tracking failed:', err))
    
    return Response.json({ 
      success: true, 
      order: order,
      message: 'Order created successfully' 
    })

  } catch (error) {
    console.error('Error creating order:', error)
    
    let errorDetails = error.message
    if (error.message.includes('Insufficient permissions')) {
      errorDetails = 'Sanity API token does not have write permissions.'
    } else if (error.message.includes('Authorization')) {
      errorDetails = 'Sanity authorization failed. Check your API token.'
    }
    
    return Response.json({ 
      error: 'Failed to create order',
      details: errorDetails
    }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const orderId = searchParams.get('orderId')
    const docId = searchParams.get('docId')   // Sanity _id lookup
    const email = searchParams.get('email')
    const userId = searchParams.get('userId')
    const all = searchParams.get('all')
    
    if (all === 'true') {
      const adminCheck = await isAdmin()
      if (!adminCheck) {
        return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
      }
    }
    
    let query = '*[_type == "order"]'
    let params = {}
    
    if (docId) {
      // Direct Sanity _id lookup — used by mobile app order detail screen
      query = '*[_type == "order" && _id == $docId]'
      params.docId = docId
    } else if (orderId) {
      const verifyEmail = searchParams.get('verifyEmail')
      let authed = false
      try {
        const authResult = await auth()
        if (authResult?.userId) authed = true
      } catch {}
      const adminCheck = authed ? await isAdmin() : false

      if (verifyEmail) {
        query = '*[_type == "order" && orderId == $orderId]'
        params.orderId = orderId
      } else if (authed || adminCheck) {
        query = '*[_type == "order" && orderId == $orderId]'
        params.orderId = orderId
      } else {
        return Response.json({
          success: true,
          orders: [],
          count: 0,
          requireVerification: true
        })
      }
    } else if (userId) {
      query = '*[_type == "order" && userId == $userId]'
      params.userId = userId
    } else if (email) {
      query = '*[_type == "order" && customerEmail == $email]'
      params.email = email
    }
    
    query += ' | order(createdAt desc)'
    
    let orders = await client.fetch(query, params)
    
    const verifyEmail = searchParams.get('verifyEmail')
    if (verifyEmail && orderId) {
      orders = orders.filter(o =>
        o.customerEmail?.toLowerCase() === verifyEmail.toLowerCase()
      )
      if (orders.length === 0) {
        console.log(`Email verification failed for order ${orderId}`)
        return Response.json({
          success: false,
          orders: [],
          count: 0,
          emailMismatch: true
        })
      }
    }
    
    console.log(`Fetched ${orders.length} orders`)

    // Heal orders where total was saved as 0 — recompute from items so the UI shows the right amount
    const healedOrders = orders.map(order => {
      const t = parseFloat(order.total)
      if (!isNaN(t) && t > 0) return order
      const itemsSum = (order.items || []).reduce((sum, i) => {
        const it = parseFloat(i.total)
        if (!isNaN(it) && it > 0) return sum + it
        return sum + ((parseFloat(i.price) || 0) * (parseInt(i.quantity) || 1))
      }, 0)
      const sub = parseFloat(order.subtotal) || itemsSum
      const tax = parseFloat(order.tax) || 0
      const shipping = parseFloat(order.shipping) || 0
      const discount = parseFloat(order.discount) || 0
      const computed = sub + tax + shipping - discount
      return { ...order, total: computed > 0 ? computed : itemsSum }
    })

    return Response.json({
      success: true,
      orders: healedOrders,
      count: healedOrders.length
    })

  } catch (error) {
    console.error('Error fetching orders:', error)
    return Response.json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return Response.json({ error: 'Unauthorized - Admin access required' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const documentId = searchParams.get('id')
    const sendEmail = searchParams.get('sendEmail') !== 'false'
    
    if (!documentId) {
      return Response.json({ error: 'Order ID required' }, { status: 400 })
    }

    const updates = await request.json()
    console.log('Updating order:', documentId, updates)

    const existingOrder = await client.fetch(
      '*[_type == "order" && _id == $id][0]',
      { id: documentId }
    )

    if (!existingOrder) {
      return Response.json({ error: 'Order not found' }, { status: 404 })
    }

    const updatedOrder = await client
      .patch(documentId)
      .set({
        ...updates,
        updatedAt: new Date().toISOString()
      })
      .commit()

    console.log('Order updated successfully')

    if (sendEmail && updates.status && existingOrder.customerEmail) {
      try {
        console.log('Sending shipping update email to:', existingOrder.customerEmail)
        const emailTransporter = createTransporter();
        if (!emailTransporter) {
          console.error('SMTP credentials not configured, skipping email');
        } else {
          const mergedOrder = { ...existingOrder, ...updates }
          await emailTransporter.sendMail({
            from: `"RUGGTECH Store" <${process.env.SMTP_USER}>`,
            to: existingOrder.customerEmail,
            subject: `Order Update: ${existingOrder.orderId} - ${updates.status.charAt(0).toUpperCase() + updates.status.slice(1)}`,
            html: generateShippingUpdateEmail(mergedOrder, updates.status)
          })
          console.log('Shipping update email sent successfully')
        }
      } catch (emailError) {
        console.error('Failed to send email:', emailError.message)
      }
    }

    return Response.json({ 
      success: true, 
      order: updatedOrder,
      emailSent: sendEmail && updates.status
    })

  } catch (error) {
    console.error('Error updating order:', error)
    return Response.json({ 
      error: 'Failed to update order',
      details: error.message 
    }, { status: 500 })
  }
}
