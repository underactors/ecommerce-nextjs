import { createClient } from '@sanity/client'
import { auth, currentUser } from '@clerk/nextjs/server'

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com']

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
  token: process.env.SANITY_API_TOKEN
})

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const all = searchParams.get('all')
    
    if (all === 'true') {
      const adminCheck = await isAdmin()
      if (!adminCheck) {
        return Response.json({ error: 'Unauthorized' }, { status: 403 })
      }
      
      const promoCodes = await client.fetch(`
        *[_type == "promoCode"] | order(createdAt desc) {
          _id,
          code,
          discountPercent,
          maxUses,
          maxUsesPerUser,
          usedCount,
          expiresAt,
          isActive,
          createdAt
        }
      `)
      
      return Response.json({ success: true, promoCodes })
    }
    
    if (code) {
      const userId = searchParams.get('userId')
      
      const promoCode = await client.fetch(`
        *[_type == "promoCode" && code == $code][0] {
          _id,
          code,
          discountPercent,
          maxUses,
          maxUsesPerUser,
          usedCount,
          expiresAt,
          isActive
        }
      `, { code: code.toUpperCase() })
      
      if (!promoCode) {
        return Response.json({ 
          success: false, 
          error: 'Invalid promo code' 
        }, { status: 404 })
      }
      
      if (!promoCode.isActive) {
        return Response.json({ 
          success: false, 
          error: 'This promo code is no longer active' 
        }, { status: 400 })
      }
      
      if (promoCode.expiresAt && new Date(promoCode.expiresAt) < new Date()) {
        return Response.json({ 
          success: false, 
          error: 'This promo code has expired' 
        }, { status: 400 })
      }
      
      if (promoCode.maxUses && promoCode.usedCount >= promoCode.maxUses) {
        return Response.json({ 
          success: false, 
          error: 'This promo code has reached its usage limit' 
        }, { status: 400 })
      }
      
      if (promoCode.maxUsesPerUser && userId) {
        const userUsageCount = await client.fetch(
          `count(*[_type == "order" && promoCode == $code && userId == $userId])`,
          { code: promoCode.code, userId }
        )
        
        if (userUsageCount >= promoCode.maxUsesPerUser) {
          return Response.json({ 
            success: false, 
            error: `You have already used this code ${promoCode.maxUsesPerUser} time(s)` 
          }, { status: 400 })
        }
      }
      
      return Response.json({ 
        success: true, 
        promoCode: {
          code: promoCode.code,
          discountPercent: promoCode.discountPercent
        }
      })
    }
    
    return Response.json({ error: 'Code parameter required' }, { status: 400 })
  } catch (error) {
    console.error('Promo code fetch error:', error)
    return Response.json({ error: 'Failed to fetch promo code' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const data = await request.json()
    const { code, discountPercent, maxUses, maxUsesPerUser, expiresAt } = data
    
    if (!code || !discountPercent) {
      return Response.json({ 
        error: 'Code and discount percent are required' 
      }, { status: 400 })
    }
    
    if (discountPercent < 1 || discountPercent > 100) {
      return Response.json({ 
        error: 'Discount must be between 1 and 100 percent' 
      }, { status: 400 })
    }
    
    const existing = await client.fetch(
      '*[_type == "promoCode" && code == $code][0]',
      { code: code.toUpperCase() }
    )
    
    if (existing) {
      return Response.json({ 
        error: 'A promo code with this name already exists' 
      }, { status: 400 })
    }
    
    const promoCode = await client.create({
      _type: 'promoCode',
      code: code.toUpperCase(),
      discountPercent: parseInt(discountPercent),
      maxUses: maxUses ? parseInt(maxUses) : null,
      maxUsesPerUser: maxUsesPerUser ? parseInt(maxUsesPerUser) : null,
      usedCount: 0,
      expiresAt: expiresAt || null,
      isActive: true,
      createdAt: new Date().toISOString()
    })
    
    return Response.json({ success: true, promoCode })
  } catch (error) {
    console.error('Promo code creation error:', error)
    return Response.json({ error: 'Failed to create promo code' }, { status: 500 })
  }
}

export async function PATCH(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const action = searchParams.get('action')
    
    if (!id) {
      return Response.json({ error: 'Promo code ID required' }, { status: 400 })
    }
    
    if (action === 'increment') {
      await client
        .patch(id)
        .inc({ usedCount: 1 })
        .commit()
      
      return Response.json({ success: true })
    }
    
    if (action === 'toggle') {
      const current = await client.fetch(
        '*[_type == "promoCode" && _id == $id][0]',
        { id }
      )
      
      await client
        .patch(id)
        .set({ isActive: !current.isActive })
        .commit()
      
      return Response.json({ success: true, isActive: !current.isActive })
    }
    
    const updates = await request.json()
    
    const updateData = {}
    if (updates.discountPercent) updateData.discountPercent = parseInt(updates.discountPercent)
    if (updates.maxUses !== undefined) updateData.maxUses = updates.maxUses ? parseInt(updates.maxUses) : null
    if (updates.expiresAt !== undefined) updateData.expiresAt = updates.expiresAt || null
    if (updates.isActive !== undefined) updateData.isActive = updates.isActive
    
    await client.patch(id).set(updateData).commit()
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Promo code update error:', error)
    return Response.json({ error: 'Failed to update promo code' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const adminCheck = await isAdmin()
    if (!adminCheck) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 })
    }
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    
    if (!id) {
      return Response.json({ error: 'Promo code ID required' }, { status: 400 })
    }
    
    await client.delete(id)
    
    return Response.json({ success: true })
  } catch (error) {
    console.error('Promo code delete error:', error)
    return Response.json({ error: 'Failed to delete promo code' }, { status: 500 })
  }
}
