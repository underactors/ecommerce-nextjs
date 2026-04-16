// app/api/paypal/create-order/route.js
// Called by the mobile app to create a PayPal order server-side
// (keeps the PayPal secret off the device)

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'ASHVkUdj2wnC54mNpkdfih3ejmBWQzSglCZoeF-MNI2_vx4RGlosX-5vJ3WfwPuQOzcxKa1nGM4XIFR_';
const PAYPAL_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const PAYPAL_API = 'https://api-m.paypal.com';

async function getAccessToken() {
  const credentials = Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64');
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${credentials}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  });
  if (!res.ok) throw new Error('Failed to get PayPal access token');
  const data = await res.json();
  return data.access_token;
}

export async function POST(request) {
  try {
    const { orderId, total, items } = await request.json();

    if (!PAYPAL_SECRET) {
      return Response.json({ error: 'PayPal not configured' }, { status: 500 });
    }

    const accessToken = await getAccessToken();

    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [
          {
            reference_id: orderId,
            amount: {
              currency_code: 'USD',
              value: parseFloat(total).toFixed(2),
            },
          },
        ],
        application_context: {
          return_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ruggtech.com'}/order-success`,
          cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://ruggtech.com'}/cart`,
          brand_name: 'RUGGTECH',
          user_action: 'PAY_NOW',
        },
      }),
    });

    if (!orderRes.ok) {
      const err = await orderRes.json();
      return Response.json({ error: err.message || 'Failed to create PayPal order' }, { status: 500 });
    }

    const order = await orderRes.json();
    const approvalUrl = order.links?.find((l) => l.rel === 'approve')?.href;

    return Response.json({ approvalUrl, orderId: order.id });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
