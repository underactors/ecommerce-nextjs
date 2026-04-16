import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { client } from '../../lib/sanity';

const smtpPort = parseInt(process.env.SMTP_PORT || '587');
const isProduction = process.env.NODE_ENV === 'production';
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: smtpPort,
  secure: smtpPort === 465,
  requireTLS: smtpPort === 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: isProduction,
    minVersion: 'TLSv1.2'
  }
});

export async function POST(request) {
  try {
    const { email, cartItems, userId } = await request.json();

    if (!email || !cartItems || cartItems.length === 0) {
      return NextResponse.json(
        { error: 'Email and cart items are required' },
        { status: 400 }
      );
    }

    const totalValue = cartItems.reduce((sum, item) => 
      sum + (item.price * (item.quantity || 1)), 0
    );

    const abandonedCart = {
      _type: 'abandonedCart',
      email,
      userId: userId || null,
      items: cartItems.map(item => ({
        _key: item._id || `item-${Date.now()}-${Math.random()}`,
        productId: item._id,
        name: item.name,
        price: item.price,
        quantity: item.quantity || 1,
        imageUrl: item.imageUrl || item.image
      })),
      totalValue,
      createdAt: new Date().toISOString(),
      reminderSent: false,
      recovered: false
    };

    const result = await client.create(abandonedCart);

    return NextResponse.json({ 
      success: true, 
      message: 'Cart saved for recovery',
      cartId: result._id
    });

  } catch (error) {
    console.error('Error saving abandoned cart:', error);
    return NextResponse.json(
      { error: 'Failed to save cart' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const cronSecret = searchParams.get('secret');

    if (action === 'send-reminders') {
      const expectedSecret = process.env.CRON_SECRET;
      if (!expectedSecret || cronSecret !== expectedSecret) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }

      const pendingCarts = await client.fetch(`
        *[_type == "abandonedCart" && reminderSent == false && recovered == false && 
          dateTime(createdAt) < dateTime(now()) - 60*60*1] | order(createdAt desc) [0...50] {
          _id,
          email,
          items,
          totalValue,
          createdAt
        }
      `);

      let sentCount = 0;
      for (const cart of pendingCarts) {
        try {
          await sendReminderEmail(cart);
          await client.patch(cart._id).set({ reminderSent: true, reminderSentAt: new Date().toISOString() }).commit();
          sentCount++;
        } catch (err) {
          console.error(`Failed to send reminder to ${cart.email}:`, err);
        }
      }

      return NextResponse.json({ 
        success: true, 
        message: `Sent ${sentCount} reminder emails` 
      });
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });

  } catch (error) {
    console.error('Error fetching abandoned cart:', error);
    return NextResponse.json(
      { error: 'Failed to fetch cart' },
      { status: 500 }
    );
  }
}

async function sendReminderEmail(cart) {
  const itemsList = cart.items.map(item => 
    `<tr>
      <td style="padding: 12px; border-bottom: 1px solid #333;">
        ${item.imageUrl ? `<img src="${item.imageUrl}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">` : ''}
      </td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #fff;">x${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #333; color: #00d4ff; font-weight: bold;">$${item.price.toFixed(2)}</td>
    </tr>`
  ).join('');

  const emailHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #0a0a0a; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
      <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #00d4ff; font-size: 28px; margin: 0;">RUGGTECH</h1>
          <p style="color: #888; margin-top: 8px;">Premium Tech & Auto Parts</p>
        </div>
        
        <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; padding: 30px; border: 1px solid #333;">
          <h2 style="color: #fff; margin: 0 0 10px 0; font-size: 24px;">You left something behind!</h2>
          <p style="color: #aaa; margin: 0 0 25px 0; line-height: 1.6;">
            We noticed you didn't complete your purchase. Your items are still waiting for you!
          </p>
          
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 25px;">
            <tbody>
              ${itemsList}
            </tbody>
          </table>
          
          <div style="background: #0f0f1a; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="color: #888; font-size: 16px;">Cart Total:</span>
              <span style="color: #00d4ff; font-size: 24px; font-weight: bold;">$${cart.totalValue.toFixed(2)}</span>
            </div>
          </div>
          
          <div style="text-align: center;">
            <a href="https://ruggtech.com/cart" style="display: inline-block; background: linear-gradient(135deg, #00d4ff, #0099cc); color: #000; text-decoration: none; padding: 16px 40px; border-radius: 50px; font-weight: bold; font-size: 16px;">
              Complete Your Order
            </a>
          </div>
          
          <p style="color: #666; text-align: center; margin-top: 25px; font-size: 13px;">
            Fast worldwide shipping | 30-day returns | Secure checkout
          </p>
        </div>
        
        <div style="text-align: center; margin-top: 30px; color: #666; font-size: 12px;">
          <p>You're receiving this because you started checkout at RUGGTECH.</p>
          <p>If you don't want these reminders, simply complete or clear your cart.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await transporter.sendMail({
    from: `"RUGGTECH" <${process.env.SMTP_USER}>`,
    to: cart.email,
    subject: '🛒 You left items in your cart!',
    html: emailHtml,
  });
}

export async function PATCH(request) {
  try {
    const { cartId, recovered } = await request.json();

    if (!cartId) {
      return NextResponse.json(
        { error: 'Cart ID required' },
        { status: 400 }
      );
    }

    await client.patch(cartId).set({ 
      recovered: recovered || true,
      recoveredAt: new Date().toISOString()
    }).commit();

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error updating cart:', error);
    return NextResponse.json(
      { error: 'Failed to update cart' },
      { status: 500 }
    );
  }
}
