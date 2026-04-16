import { createClient } from '@sanity/client'
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
    offgrid: 'OFG', phoneacc: 'PAC', electronic: 'ELC', watch: 'WCH',
    product2: 'PR2', wholesaleSuzuki: 'WSZ', wholesaleFarming: 'WFM',
    wholesaleElectronics: 'WEL',
  }
  return `${typePrefix[type] || 'UNK'}-${(id || '').slice(-6).toUpperCase()}`
}

function getStatus(stock) {
  if (stock === undefined || stock === null || stock <= 0) return 'Out of Stock'
  if (stock <= 5) return 'Low Stock'
  if (stock <= 10) return 'Warning'
  return 'In Stock'
}

function escapeCSV(value) {
  const str = String(value ?? '')
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function fmtDate(iso) {
  if (!iso) return 'N/A'
  return new Date(iso).toLocaleDateString('en-CA') // YYYY-MM-DD
}

function yesNo(val) {
  return val !== false && val != null ? 'Yes' : 'No'
}

function buildSection(label, headers, dataRows) {
  const lines = [
    `=== ${label} ===`,
    headers.map(escapeCSV).join(','),
    ...dataRows,
  ]
  return lines.join('\n')
}

// ── GROQ Queries ──────────────────────────────────────────────────────────────

const QUERY_DEVICES = `*[_type in ["product", "phone"]] | order(name asc) {
  _id, _type, name, brand, price,
  "stock": coalesce(stockQuantity, 0),
  inStock, featured, protectionRating, battery, processor, ram, rom, connectivity5G, _updatedAt
}`

const QUERY_CAR = `*[_type == "car"] | order(name asc) {
  _id, _type, name, brand, partNumber, vehicleMake, vehicleModel, yearFrom, yearTo,
  partCategory, condition, price,
  "stock": coalesce(stockQuantity, 0),
  inStock, _updatedAt
}`

const QUERY_OFFGRID = `*[_type in ["offgrid", "electronic", "watch", "phoneacc", "product2"]] | order(_type asc, name asc) {
  _id, _type, name, brand, price,
  "stock": coalesce(stockQuantity, 0),
  inStock,
  "subcat": coalesce(subsubcategory, equipmentType, ""),
  location, _updatedAt
}`

const QUERY_WHOLESALE = `*[_type in ["agritechPage", "wholesaleSuzuki", "wholesaleFarming", "wholesaleElectronics"]] | order(_type asc, name asc) {
  _id, _type, name, brand, "skuField": sku, wholesalePrice, retailPrice, price,
  "stock": coalesce(stockQuantity, stock, 0),
  minOrderQty, category, isActive, _updatedAt
}`

// ── Row builders ──────────────────────────────────────────────────────────────

const SEC1_HEADERS = ['SKU', 'Name', 'Type', 'Brand', 'Price', 'Stock', 'Status',
  'Protection Rating', 'Battery', 'Processor', 'RAM', 'ROM', '5G', 'In Stock', 'Featured', 'Last Updated']

function rowDevices(p) {
  const stock = p.stock ?? 0
  return [
    generateSKU(p._type, p._id),
    p.name || 'Unnamed',
    p._type === 'product' ? 'Rugged Device' : 'Phone / Tablet',
    p.brand || '',
    (p.price || 0).toFixed(2),
    stock,
    getStatus(stock),
    p.protectionRating || '',
    p.battery || '',
    p.processor || '',
    p.ram || '',
    p.rom || '',
    p.connectivity5G ? 'Yes' : 'No',
    yesNo(p.inStock),
    p.featured ? 'Yes' : 'No',
    fmtDate(p._updatedAt),
  ].map(escapeCSV).join(',')
}

const SEC2_HEADERS = ['SKU', 'Name', 'Brand', 'Part Number', 'Vehicle Make', 'Vehicle Model',
  'Year From', 'Year To', 'Part Category', 'Condition', 'Price', 'Stock', 'Status', 'In Stock', 'Last Updated']

function rowCar(p) {
  const stock = p.stock ?? 0
  return [
    generateSKU(p._type, p._id),
    p.name || 'Unnamed',
    p.brand || '',
    p.partNumber || '',
    p.vehicleMake || 'Suzuki',
    p.vehicleModel || '',
    p.yearFrom || '',
    p.yearTo || '',
    p.partCategory || '',
    p.condition || '',
    (p.price || 0).toFixed(2),
    stock,
    getStatus(stock),
    yesNo(p.inStock),
    fmtDate(p._updatedAt),
  ].map(escapeCSV).join(',')
}

const SEC3_HEADERS = ['SKU', 'Name', 'Type', 'Brand', 'Price', 'Stock', 'Status',
  'Subcategory', 'Location', 'Last Updated']

const TYPE_LABELS_SEC3 = {
  offgrid: 'Off-Grid Equipment', electronic: 'Electronic',
  watch: 'Watch', phoneacc: 'Accessory', product2: 'Headset',
}

function rowOffgrid(p) {
  const stock = p.stock ?? 0
  return [
    generateSKU(p._type, p._id),
    p.name || 'Unnamed',
    TYPE_LABELS_SEC3[p._type] || p._type,
    p.brand || '',
    (p.price || 0).toFixed(2),
    stock,
    getStatus(stock),
    p.subcat || '',
    p.location || '',
    fmtDate(p._updatedAt),
  ].map(escapeCSV).join(',')
}

const SEC4_HEADERS = ['SKU', 'Name', 'Type', 'Brand / SKU', 'Wholesale Price', 'Retail Price',
  'Price', 'Stock', 'Min Order Qty', 'Category', 'Active', 'Last Updated']

const TYPE_LABELS_SEC4 = {
  agritechPage: 'AgriTech', wholesaleSuzuki: 'Wholesale Suzuki',
  wholesaleFarming: 'Wholesale Farming', wholesaleElectronics: 'Wholesale Electronics',
}

function rowWholesale(p) {
  const stock = p.stock ?? 0
  return [
    generateSKU(p._type, p._id),
    p.name || 'Unnamed',
    TYPE_LABELS_SEC4[p._type] || p._type,
    p.skuField || p.brand || '',
    p.wholesalePrice != null ? p.wholesalePrice.toFixed(2) : '',
    p.retailPrice != null ? p.retailPrice.toFixed(2) : '',
    (p.price || 0).toFixed(2),
    stock,
    p.minOrderQty ?? '',
    p.category || '',
    p.isActive != null ? (p.isActive ? 'Yes' : 'No') : 'N/A',
    fmtDate(p._updatedAt),
  ].map(escapeCSV).join(',')
}

// ── GET handler ───────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const [devicesData, carData, offgridData, wholesaleData] = await Promise.all([
      sanityClient.fetch(QUERY_DEVICES),
      sanityClient.fetch(QUERY_CAR),
      sanityClient.fetch(QUERY_OFFGRID),
      sanityClient.fetch(QUERY_WHOLESALE),
    ])

    const section1 = buildSection('Rugged Devices & Phones', SEC1_HEADERS, devicesData.map(rowDevices))
    const section2 = buildSection('Suzuki / Car Parts', SEC2_HEADERS, carData.map(rowCar))
    const section3 = buildSection('Off-Grid & Electronics', SEC3_HEADERS, offgridData.map(rowOffgrid))
    const section4 = buildSection('AgriTech & Wholesale', SEC4_HEADERS, wholesaleData.map(rowWholesale))

    const csv = [section1, '', section2, '', section3, '', section4].join('\n')
    const date = new Date().toISOString().split('T')[0]

    // \uFEFF = UTF-8 BOM — required for Excel to open special characters correctly
    return new Response('\uFEFF' + csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="ruggtech-catalogue-${date}.csv"`,
      },
    })
  } catch (error) {
    console.error('CSV export error:', error)
    return NextResponse.json({ error: 'Failed to export CSV', details: error.message }, { status: 500 })
  }
}
