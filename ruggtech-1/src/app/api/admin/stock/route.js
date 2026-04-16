import { createClient } from '@sanity/client'
import { NextResponse } from 'next/server'
import { auth, currentUser } from '@clerk/nextjs/server'

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

function getProductStatus(stock) {
  if (stock === undefined || stock === null || stock <= 0) return 'out-of-stock'
  if (stock <= 5) return 'low-stock'
  if (stock <= 10) return 'warning'
  return 'in-stock'
}

function generateSKU(type, id) {
  const typePrefix = {
    product: 'PRD',
    phone: 'PHN',
    car: 'CAR',
    agritechPage: 'AGR',
    offgrid: 'OFG',
    phoneacc: 'PAC',
    electronic: 'ELC',
    watch: 'WCH',
    product2: 'PR2',
  }
  const prefix = typePrefix[type] || 'UNK'
  const shortId = (id || '').slice(-6).toUpperCase()
  return `${prefix}-${shortId}`
}

export async function GET() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const query = `*[_type in $types]{
      _id,
      _type,
      name,
      slug,
      price,
      stock,
      inStock,
      "imageUrl": image[0].asset->url,
      brand,
      _updatedAt
    }`

    const products = await sanityClient.fetch(query, { types: PRODUCT_TYPES })

    const enrichedProducts = products.map(p => ({
      ...p,
      sku: generateSKU(p._type, p._id),
      status: getProductStatus(p.stock),
      stock: p.stock || 0,
      price: p.price || 0,
    }))

    const stats = {
      totalProducts: enrichedProducts.length,
      totalStockValue: enrichedProducts.reduce((sum, p) => sum + (p.stock * p.price), 0),
      outOfStock: enrichedProducts.filter(p => p.status === 'out-of-stock').length,
      lowStock: enrichedProducts.filter(p => p.status === 'low-stock').length,
      warning: enrichedProducts.filter(p => p.status === 'warning').length,
      inStock: enrichedProducts.filter(p => p.status === 'in-stock').length,
    }

    return NextResponse.json({ success: true, products: enrichedProducts, stats })
  } catch (error) {
    console.error('Stock API error:', error)
    return NextResponse.json({ error: 'Failed to fetch stock data', details: error.message }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { productId, newStock, reason, userId } = await request.json()

    if (!productId || newStock === undefined) {
      return NextResponse.json({ error: 'productId and newStock required' }, { status: 400 })
    }

    const existing = await sanityClient.fetch('*[_id == $id][0]{ stock, name, _type }', { id: productId })
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    const oldStock = existing.stock || 0
    const stockNum = parseInt(newStock)

    await sanityClient.patch(productId).set({ stock: stockNum, inStock: stockNum > 0 }).commit()

    try {
      const origin = request.headers.get('origin') || request.headers.get('host') || ''
      const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
      await fetch(`${baseUrl}/api/admin/stock/history`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          productName: existing.name,
          oldStock,
          newStock: stockNum,
          reason: reason || 'Manual update',
          userId: userId || 'admin',
        }),
      }).catch(() => {})
    } catch {}

    if (stockNum > 0 && oldStock <= 0) {
      try {
        const origin = request.headers.get('origin') || request.headers.get('host') || ''
        const baseUrl = origin.startsWith('http') ? origin : `https://${origin}`
        await fetch(`${baseUrl}/api/admin/stock/back-in-stock`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productId,
            productName: existing.name,
            productSlug: '',
          }),
        }).catch(() => {})
      } catch {}
    }

    return NextResponse.json({
      success: true,
      product: { _id: productId, name: existing.name, oldStock, newStock: stockNum, status: getProductStatus(stockNum) },
    })
  } catch (error) {
    console.error('Stock update error:', error)
    return NextResponse.json({ error: 'Failed to update stock', details: error.message }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { updates, userId } = await request.json()

    if (!updates || !Array.isArray(updates)) {
      return NextResponse.json({ error: 'updates array required' }, { status: 400 })
    }

    const results = []

    for (const update of updates) {
      try {
        const existing = await sanityClient.fetch('*[_id == $id][0]{ stock, name }', { id: update.productId })
        if (!existing) {
          results.push({ productId: update.productId, success: false, error: 'Not found' })
          continue
        }

        const oldStock = existing.stock || 0
        const stockNum = parseInt(update.newStock)

        await sanityClient.patch(update.productId).set({ stock: stockNum, inStock: stockNum > 0 }).commit()

        results.push({
          productId: update.productId,
          name: existing.name,
          oldStock,
          newStock: stockNum,
          success: true,
        })
      } catch (err) {
        results.push({ productId: update.productId, success: false, error: err.message })
      }
    }

    return NextResponse.json({
      success: true,
      results,
      updated: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
    })
  } catch (error) {
    console.error('Bulk stock update error:', error)
    return NextResponse.json({ error: 'Failed to bulk update stock', details: error.message }, { status: 500 })
  }
}
