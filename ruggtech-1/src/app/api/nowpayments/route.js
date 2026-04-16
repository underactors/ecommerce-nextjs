// app/api/nowpayments/route.js
export async function POST(request) {
  try {
    console.log('🔄 Creating NOWPayments invoice');
    
    const {
      price_amount,
      price_currency,
      pay_currency,
      order_id,
      order_description,
      success_url,
      cancel_url
    } = await request.json();

    // Validate required fields
    if (!price_amount || !order_id) {
      return Response.json({
        error: 'Missing required payment data',
        details: 'price_amount and order_id are required'
      }, { status: 400 });
    }

    console.log('Creating NOWPayments invoice with:', {
      price_amount,
      pay_currency,
      order_id
    });

    // Create payment with NOWPayments using invoice endpoint
    const nowPaymentsResponse = await fetch('https://api.nowpayments.io/v1/invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.NOWPAYMENTS_API_KEY,
      },
      body: JSON.stringify({
        price_amount: price_amount,
        price_currency: price_currency || 'USD',
        pay_currency: pay_currency || 'USDTTRC20',
        order_id: order_id,
        order_description: order_description || `RUGGTECH Order ${order_id}`,
        success_url: success_url,
        cancel_url: cancel_url,
        is_fee_paid_by_user: true,
        is_fixed_rate: true
      }),
    });

    if (!nowPaymentsResponse.ok) {
      const errorText = await nowPaymentsResponse.text();
      console.error('❌ NOWPayments API Error:', errorText);
      
      return Response.json({
        error: 'NOWPayments API error',
        details: errorText,
        status: nowPaymentsResponse.status
      }, { status: nowPaymentsResponse.status });
    }

    const paymentData = await nowPaymentsResponse.json();
    console.log('✅ NOWPayments invoice created:', paymentData.id);
    console.log('Invoice data received:', paymentData);

    return Response.json({
      success: true,
      payment_id: paymentData.id,
      payment_status: paymentData.payment_status,
      pay_address: paymentData.pay_address,
      price_amount: paymentData.price_amount,
      price_currency: paymentData.price_currency,
      pay_amount: paymentData.pay_amount,
      pay_currency: paymentData.pay_currency,
      order_id: paymentData.order_id,
      invoice_url: paymentData.invoice_url,
      created_at: paymentData.created_at,
      updated_at: paymentData.updated_at
    });

  } catch (error) {
    console.error('❌ Error creating NOWPayments invoice:', error);
    return Response.json({
      error: 'Failed to create payment',
      details: error.message
    }, { status: 500 });
  }
}

// Handle payment status updates from NOWPayments webhook
export async function PUT(request) {
  try {
    console.log('🔔 NOWPayments webhook received');
    
    const webhookData = await request.json();
    console.log('Webhook data:', webhookData);

    // Verify webhook signature (recommended for production)
    const signature = request.headers.get('x-nowpayments-sig');
    
    // Import your Sanity client
    const { client } = await import('../../../app/lib/sanity');

    // Update order status in Sanity based on payment status
    if (webhookData.order_id && webhookData.payment_status) {
      let orderStatus = 'pending';
      
      switch (webhookData.payment_status) {
        case 'finished':
          orderStatus = 'completed';
          break;
        case 'partially_paid':
          orderStatus = 'processing';
          break;
        case 'failed':
        case 'expired':
          orderStatus = 'cancelled';
          break;
        default:
          orderStatus = 'pending';
      }

      // Update order in Sanity
      const updatedOrder = await client
        .patch({
          query: '*[_type == "order" && orderId == $orderId][0]',
          params: { orderId: webhookData.order_id }
        })
        .set({
          status: orderStatus,
          'paymentDetails.nowPaymentsStatus': webhookData.payment_status,
          'paymentDetails.actualAmount': webhookData.actually_paid,
          'paymentDetails.transactionHash': webhookData.outcome?.hash,
          updatedAt: new Date().toISOString()
        })
        .commit();

      console.log('✅ Order status updated:', webhookData.order_id, orderStatus);
    }

    return Response.json({ success: true });

  } catch (error) {
    console.error('❌ Error handling NOWPayments webhook:', error);
    return Response.json({
      error: 'Webhook processing failed',
      details: error.message
    }, { status: 500 });
  }
}