import nodemailer from 'nodemailer';

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL
    || ('https://' + (process.env.REPLIT_DEV_DOMAIN || process.env.REPLIT_DOMAINS?.split(',')[0] || 'ruggtech.com'))
}

function createTransporter() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!user || !pass) {
    console.error('SMTP credentials missing - SMTP_USER:', !!user, 'SMTP_PASS:', !!pass);
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: false,
    auth: { user, pass },
    tls: {
      rejectUnauthorized: true
    }
  });
}

const generateOrderEmailHTML = (orderData) => {
  const { orderId, items, total, paymentMethod, customerEmail, customerName, shippingAddress } = orderData;

  let paymentDisplay = '';
  let paymentIcon = '';

  if (paymentMethod === 'paypal') {
    paymentDisplay = 'PayPal';
    paymentIcon = '💳';
  } else if (paymentMethod === 'nowpayments_usdt') {
    paymentDisplay = 'USDT (TRC20)';
    paymentIcon = '₮';
  } else if (paymentMethod === 'google_pay') {
    paymentDisplay = 'Google Pay';
    paymentIcon = '📱';
  } else if (paymentMethod === 'stripe') {
    paymentDisplay = 'Credit Card (Stripe)';
    paymentIcon = '💳';
  } else {
    paymentDisplay = 'Credit Card';
    paymentIcon = '💳';
  }

  const displayName = customerName || customerEmail || 'Valued Customer';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Order Confirmation - RUGGTECH</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f5f5; margin: 0; padding: 0;">
      <div style="max-width: 600px; margin: 0 auto; background: white;">
        <div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 30px 20px; text-align: center;">
          <div style="font-size: 28px; font-weight: bold; color: #3b82f6; margin-bottom: 10px;">🛡️ RUGGTECH</div>
          <h1 style="margin: 0; font-size: 24px;">Order Confirmation</h1>
        </div>
        
        <div style="padding: 30px 20px; background: #f8fafc;">
          <div style="background: white; padding: 25px; border-radius: 12px; margin-bottom: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #10b981; margin-top: 0;">Thank you for your order, ${displayName}!</h2>
            <p>Your order has been successfully processed and will be prepared for shipping.</p>
            <div style="background: #10b981; color: white; padding: 8px 16px; border-radius: 20px; font-size: 14px; font-weight: 600; display: inline-block; margin: 15px 0;">✅ Order Confirmed</div>
          </div>
          
          <div style="background: white; padding: 25px; border-radius: 12px; margin: 25px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #1e293b; margin-top: 0;">Order Information</h3>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Order ID:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;"><strong>${orderId}</strong></td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Customer Email:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">${customerEmail}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Payment Method:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">
                  <span style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 6px 12px; border-radius: 8px; display: inline-block;">${paymentIcon} ${paymentDisplay}</span>
                </td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: 600; color: #64748b;">Order Date:</td>
                <td style="padding: 8px 0; color: #1e293b; text-align: right;">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
              </tr>
            </table>
            
            ${shippingAddress ? `
              <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <h4 style="color: #1e293b; margin-top: 0; margin-bottom: 10px;">📍 Shipping Address</h4>
                <p style="color: #64748b; margin: 0; line-height: 1.8;">
                  <strong>${shippingAddress.fullName || ''}</strong><br>
                  ${shippingAddress.phone ? `📞 ${shippingAddress.phone}<br>` : ''}
                  ${shippingAddress.address || ''}<br>
                  ${shippingAddress.city || ''}, ${shippingAddress.state || ''} ${shippingAddress.zipCode || ''}<br>
                  ${shippingAddress.country || ''}
                </p>
              </div>
            ` : ''}
            
            ${paymentMethod === 'nowpayments_usdt' ? `
              <div style="background: #e0f7fa; border-left: 4px solid #26a69a; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
                <p style="margin: 0; color: #00695c;"><strong>USDT Payment Status:</strong> Your USDT payment is being processed on the Tron blockchain. You will receive another email once the payment is confirmed.</p>
              </div>
            ` : ''}
            
            <h3 style="color: #1e293b; font-size: 18px; font-weight: 600; margin: 20px 0 15px 0; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Items Ordered</h3>
            ${(items || []).map(item => `
              <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px 0; border-bottom: 1px solid #e2e8f0;">
                <div style="flex: 1;">
                  <div style="font-weight: 600; color: #1e293b; margin-bottom: 5px;">${item.name || 'Product'}</div>
                  <div style="color: #64748b; font-size: 14px;">Quantity: ${item.quantity || 1}</div>
                </div>
                <div style="font-weight: 700; color: #f59e0b; font-size: 16px;">$${(item.total || item.price || 0).toFixed(2)}</div>
              </div>
            `).join('')}
            
            <div style="background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; padding: 20px; text-align: center; border-radius: 12px; margin: 25px 0;">
              <div style="font-size: 18px;">Order Total</div>
              <div style="font-size: 24px; font-weight: bold; margin: 10px 0;">$${(total || 0).toFixed(2)} USD</div>
              ${paymentMethod === 'nowpayments_usdt' ? '<div style="font-size: 14px; opacity: 0.9;">Paid with USDT (TRC20)</div>' : ''}
            </div>
          </div>
          
          <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 20px; border-radius: 12px; margin: 20px 0; text-align: center;">
            <div style="font-size: 14px; margin-bottom: 8px;">Track Your Order Anytime</div>
            <a href="${getSiteUrl()}/track/${orderId}?email=${encodeURIComponent(customerEmail || '')}"
               style="display: inline-block; background: white; color: #059669; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 16px; margin-top: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.15);">
              📦 Track My Order
            </a>
          </div>

          <div style="background: #dbeafe; border-left: 4px solid #3b82f6; padding: 15px; margin: 20px 0; border-radius: 0 8px 8px 0;">
            <p style="margin: 0; color: #1e40af;"><strong>What's Next?</strong></p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">• You'll receive a shipping confirmation email with tracking information</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">• Orders typically ship within 1-2 business days</p>
            <p style="margin: 5px 0 0 0; color: #1e40af;">• Track your order status in your account dashboard</p>
          </div>
          
          <div style="background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
            <h3 style="color: #1e293b; margin-bottom: 10px;">Need Help?</h3>
            <p style="color: #64748b; margin: 5px 0;">Our support team is here to help with any questions.</p>
            <p style="color: #64748b; margin: 5px 0;"><strong>Email:</strong> ruggtech@gmail.com</p>
          </div>
        </div>
        
        <div style="background: #1e293b; color: #94a3b8; text-align: center; padding: 30px 20px;">
          <div style="color: #3b82f6; font-size: 20px; font-weight: bold; margin-bottom: 10px;">🛡️ RUGGTECH</div>
          <p style="margin: 5px 0;">© ${new Date().getFullYear()} RUGGTECH. All rights reserved.</p>
          <p style="margin: 5px 0;">Designed for extreme durability and performance</p>
          <p style="margin-top: 15px; font-size: 12px;">
            This email was sent to ${customerEmail}. 
            If you did not place this order, please contact us immediately.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export async function POST(request) {
  try {
    console.log('📧 Sending confirmation email');
    console.log('SMTP_USER configured:', !!process.env.SMTP_USER);
    console.log('SMTP_PASS configured:', !!process.env.SMTP_PASS);
    
    const body = await request.json();
    const { to, orderId, items, total, paymentMethod, shippingAddress, customerName } = body;
    
    if (!to || !orderId) {
      console.error('❌ Missing required email data - to:', !!to, 'orderId:', !!orderId);
      return Response.json({ 
        error: 'Missing required email data',
        details: 'to and orderId are required'
      }, { status: 400 });
    }

    const transporter = createTransporter();
    if (!transporter) {
      console.error('❌ Could not create email transporter - SMTP credentials missing');
      return Response.json({
        error: 'Email configuration error',
        details: 'SMTP credentials are not configured. Set SMTP_USER and SMTP_PASS.'
      }, { status: 500 });
    }

    try {
      await transporter.verify();
      console.log('✅ Email transporter verified successfully');
    } catch (verifyError) {
      console.error('❌ Email transporter verification failed:', verifyError.message);
      console.error('Error code:', verifyError.code);
      return Response.json({
        error: 'Email configuration error',
        details: `SMTP verification failed: ${verifyError.message}. Make sure SMTP_PASS is a valid Google App Password.`
      }, { status: 500 });
    }

    const mailOptions = {
      from: `"RUGGTECH Store" <${process.env.SMTP_USER}>`,
      to: to,
      subject: `🛡️ Order Confirmation - ${orderId} - RUGGTECH`,
      html: generateOrderEmailHTML({
        orderId,
        items: items || [],
        total: total || 0,
        paymentMethod: paymentMethod || 'unknown',
        customerEmail: to,
        customerName: customerName || '',
        shippingAddress: shippingAddress || null
      }),
    };

    console.log('📤 Sending email to:', to, 'for order:', orderId);
    const result = await transporter.sendMail(mailOptions);
    
    console.log(`✅ Confirmation email sent to ${to} for order ${orderId}`);
    console.log('Message ID:', result.messageId);
    
    return Response.json({ 
      success: true, 
      message: 'Confirmation email sent successfully',
      orderId: orderId,
      messageId: result.messageId
    });

  } catch (error) {
    console.error('❌ Error sending email:', error.message);
    console.error('Error code:', error.code);
    console.error('Full error:', error);
    
    let errorDetails = error.message;
    if (error.code === 'EAUTH') {
      errorDetails = 'Email authentication failed. Make sure SMTP_PASS is a valid Google App Password (not your regular Gmail password). Generate one at: Google Account > Security > App Passwords.';
    } else if (error.code === 'ECONNECTION') {
      errorDetails = 'Could not connect to email server. Check SMTP_HOST and SMTP_PORT.';
    } else if (error.code === 'ESOCKET') {
      errorDetails = 'Socket error connecting to email server. The server may be blocking the connection.';
    }
    
    return Response.json({ 
      error: 'Failed to send email',
      details: errorDetails,
      code: error.code
    }, { status: 500 });
  }
}
