// app/api/admin/stock/sync/route.js
// Receives Sanity webhooks when products are created/updated/deleted.
// Verifies Sanity's HMAC signature and logs the event.
// No Clerk auth — this is a server-to-server call from Sanity.

import { NextResponse } from 'next/server'
import crypto from 'crypto'

// In-memory state — lives for the duration of this serverless instance.
// Purely informational; the export route always fetches fresh from Sanity.
let lastSyncAt = null
let lastDocumentType = null
let lastOperation = null

/**
 * Verify Sanity webhook signature.
 * Sanity sends: sanity-webhook-signature: t=<unix_ts>,v1=<hmac_sha256_hex>
 * HMAC input: "<timestamp>.<rawBody>"
 */
function verifyWebhookSignature(rawBody, signatureHeader, secret) {
  try {
    const parts = Object.fromEntries(
      signatureHeader.split(',').map(part => {
        const idx = part.indexOf('=')
        return [part.slice(0, idx), part.slice(idx + 1)]
      })
    )
    const timestamp = parts.t
    const sig = parts.v1

    if (!timestamp || !sig) return false

    // Replay protection — reject requests older than 5 minutes
    if (Math.abs(Date.now() / 1000 - parseInt(timestamp, 10)) > 300) {
      console.warn('[sync] Webhook timestamp too old:', timestamp)
      return false
    }

    const hmac = crypto.createHmac('sha256', secret)
    hmac.update(`${timestamp}.${rawBody}`)
    const expected = hmac.digest('hex')

    return crypto.timingSafeEqual(
      Buffer.from(sig, 'utf8'),
      Buffer.from(expected, 'utf8')
    )
  } catch {
    return false
  }
}

export async function POST(request) {
  try {
    const rawBody = await request.text()
    const secret = process.env.SANITY_WEBHOOK_SECRET

    if (secret) {
      const sigHeader = request.headers.get('sanity-webhook-signature') || ''
      if (!sigHeader) {
        console.warn('[sync] Missing sanity-webhook-signature header')
        return NextResponse.json({ error: 'Missing signature' }, { status: 401 })
      }
      if (!verifyWebhookSignature(rawBody, sigHeader, secret)) {
        console.warn('[sync] Invalid webhook signature')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    } else {
      console.warn('[sync] SANITY_WEBHOOK_SECRET not configured — skipping signature check')
    }

    let payload
    try {
      payload = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const docType = payload?._type || 'unknown'
    const operation = payload?.operation || 'update'
    const docId = payload?._id || 'unknown'

    console.log(`[sync] Sanity webhook received: operation=${operation}, type=${docType}, id=${docId}`)

    lastSyncAt = new Date().toISOString()
    lastDocumentType = docType
    lastOperation = operation

    return NextResponse.json({
      received: true,
      docType,
      operation,
      syncedAt: lastSyncAt,
    })
  } catch (error) {
    console.error('[sync] Webhook error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET — check last sync status (admin use)
export async function GET() {
  return NextResponse.json({
    lastSyncAt,
    lastDocumentType,
    lastOperation,
  })
}
