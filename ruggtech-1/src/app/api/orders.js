// pages/api/orders.js or app/api/orders/route.js (for App Router)
import { client } from '.../../../lib/sanity';

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const orderData = req.body;
      
      // Validate required fields
      if (!orderData.orderId || !orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
        return res.status(400).json({ error: 'Missing required order data' });
      }

      // Create order document in Sanity
      const order = await client.create({
        _type: 'order',
        orderId: orderData.orderId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName || '',
        customerPhone: orderData.customerPhone || '',
        paymentMethod: orderData.paymentMethod,
        paymentDetails: orderData.paymentDetails,
        items: orderData.items,
        shippingAddress: orderData.shippingAddress,
        billingAddress: orderData.billingAddress,
        subtotal: orderData.subtotal,
        tax: orderData.tax,
        shipping: orderData.shipping,
        total: orderData.total,
        status: orderData.status || 'completed',
        trackingNumber: orderData.trackingNumber || '',
        notes: orderData.notes || '',
        createdAt: orderData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      res.status(200).json({ 
        success: true, 
        order: order,
        message: 'Order created successfully' 
      });

    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ 
        error: 'Failed to create order',
        details: error.message 
      });
    }
  } 
  else if (req.method === 'GET') {
    try {
      const { orderId, email } = req.query;
      
      let query = '*[_type == "order"]';
      let params = {};
      
      // Search by order ID
      if (orderId) {
        query = '*[_type == "order" && orderId == $orderId]';
        params.orderId = orderId;
      }
      // Search by customer email
      else if (email) {
        query = '*[_type == "order" && customerEmail == $email]';
        params.email = email;
      }
      
      query += ' | order(createdAt desc)';
      
      const orders = await client.fetch(query, params);
      
      res.status(200).json({ 
        success: true, 
        orders: orders,
        count: orders.length 
      });

    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({ 
        error: 'Failed to fetch orders',
        details: error.message 
      });
    }
  }
  else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}

// For App Router (app/api/orders/route.js)
export async function POST(request) {
  try {
    const orderData = await request.json();
    
    // Validate required fields
    if (!orderData.orderId || !orderData.customerEmail || !orderData.items || orderData.items.length === 0) {
      return Response.json({ error: 'Missing required order data' }, { status: 400 });
    }

    // Create order document in Sanity
    const order = await client.create({
      _type: 'order',
      orderId: orderData.orderId,
      customerEmail: orderData.customerEmail,
      customerName: orderData.customerName || '',
      customerPhone: orderData.customerPhone || '',
      paymentMethod: orderData.paymentMethod,
      paymentDetails: orderData.paymentDetails,
      items: orderData.items,
      shippingAddress: orderData.shippingAddress,
      billingAddress: orderData.billingAddress,
      subtotal: orderData.subtotal,
      tax: orderData.tax,
      shipping: orderData.shipping,
      total: orderData.total,
      status: orderData.status || 'completed',
      trackingNumber: orderData.trackingNumber || '',
      notes: orderData.notes || '',
      createdAt: orderData.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      order: order,
      message: 'Order created successfully' 
    });

  } catch (error) {
    console.error('Error creating order:', error);
    return Response.json({ 
      error: 'Failed to create order',
      details: error.message 
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');
    
    let query = '*[_type == "order"]';
    let params = {};
    
    // Search by order ID
    if (orderId) {
      query = '*[_type == "order" && orderId == $orderId]';
      params.orderId = orderId;
    }
    // Search by customer email
    else if (email) {
      query = '*[_type == "order" && customerEmail == $email]';
      params.email = email;
    }
    
    query += ' | order(createdAt desc)';
    
    const orders = await client.fetch(query, params);
    
    return Response.json({ 
      success: true, 
      orders: orders,
      count: orders.length 
    });

  } catch (error) {
    console.error('Error fetching orders:', error);
    return Response.json({ 
      error: 'Failed to fetch orders',
      details: error.message 
    }, { status: 500 });
  }
}