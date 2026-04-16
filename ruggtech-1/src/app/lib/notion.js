import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_TOKEN
})

const databaseId = process.env.NOTION_DATABASE_ID

export async function trackCustomerOrder(orderData) {
  try {
    const { 
      orderId, 
      customerEmail, 
      customerName, 
      items, 
      total, 
      paymentMethod,
      userId
    } = orderData

    const itemsSummary = items.map(item => `${item.name} (x${item.quantity})`).join(', ')
    
    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Event Type': {
          select: { name: 'Order' }
        },
        'Customer Email': {
          email: customerEmail || null
        },
        'Customer Name': {
          title: [{ text: { content: customerName || 'Guest' } }]
        },
        'Order ID': {
          rich_text: [{ text: { content: orderId || '' } }]
        },
        'Items': {
          rich_text: [{ text: { content: itemsSummary.substring(0, 2000) } }]
        },
        'Total Value': {
          number: parseFloat(total) || 0
        },
        'Payment Method': {
          select: { name: paymentMethod || 'Unknown' }
        },
        'User ID': {
          rich_text: [{ text: { content: userId || '' } }]
        },
        'Date': {
          date: { start: new Date().toISOString() }
        }
      }
    })

    console.log('Order tracked in Notion:', orderId)
    return { success: true }
  } catch (error) {
    console.error('Error tracking order in Notion:', error)
    return { success: false, error: error.message }
  }
}

export async function trackSearchQuery(searchData) {
  try {
    const { query, userId, userEmail, userName, resultsCount } = searchData

    const properties = {
      'Event Type': {
        select: { name: 'Search' }
      },
      'Customer Name': {
        title: [{ text: { content: userName || 'Guest' } }]
      },
      'Search Query': {
        rich_text: [{ text: { content: query || '' } }]
      },
      'Results Count': {
        number: resultsCount || 0
      },
      'User ID': {
        rich_text: [{ text: { content: userId || '' } }]
      },
      'Date': {
        date: { start: new Date().toISOString() }
      }
    }

    // Only add email if it's a valid email
    if (userEmail && userEmail.includes('@')) {
      properties['Customer Email'] = { email: userEmail }
    }

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties
    })

    console.log('Search tracked in Notion:', query)
    return { success: true }
  } catch (error) {
    console.error('Error tracking search in Notion:', error)
    return { success: false, error: error.message }
  }
}

export async function trackProductView(viewData) {
  try {
    const { productId, productName, productPrice, category, userId, userEmail } = viewData

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Event Type': {
          select: { name: 'Product View' }
        },
        'Customer Email': {
          email: userEmail || null
        },
        'Customer Name': {
          title: [{ text: { content: `View: ${productName || 'Unknown Product'}` } }]
        },
        'Product ID': {
          rich_text: [{ text: { content: productId || '' } }]
        },
        'Product Price': {
          number: parseFloat(productPrice) || 0
        },
        'Category': {
          select: { name: category || 'Other' }
        },
        'User ID': {
          rich_text: [{ text: { content: userId || '' } }]
        },
        'Date': {
          date: { start: new Date().toISOString() }
        }
      }
    })

    console.log('Product view tracked in Notion:', productName)
    return { success: true }
  } catch (error) {
    console.error('Error tracking product view in Notion:', error)
    return { success: false, error: error.message }
  }
}

export async function trackAddToCart(cartData) {
  try {
    const { productId, productName, productPrice, quantity, userId, userEmail } = cartData

    await notion.pages.create({
      parent: { database_id: databaseId },
      properties: {
        'Event Type': {
          select: { name: 'Add to Cart' }
        },
        'Customer Email': {
          email: userEmail || null
        },
        'Customer Name': {
          title: [{ text: { content: `Cart: ${productName || 'Unknown Product'}` } }]
        },
        'Product ID': {
          rich_text: [{ text: { content: productId || '' } }]
        },
        'Product Price': {
          number: parseFloat(productPrice) || 0
        },
        'Quantity': {
          number: parseInt(quantity) || 1
        },
        'User ID': {
          rich_text: [{ text: { content: userId || '' } }]
        },
        'Date': {
          date: { start: new Date().toISOString() }
        }
      }
    })

    console.log('Add to cart tracked in Notion:', productName)
    return { success: true }
  } catch (error) {
    console.error('Error tracking add to cart in Notion:', error)
    return { success: false, error: error.message }
  }
}

export { notion, databaseId }
