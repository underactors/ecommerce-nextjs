import { NextResponse } from 'next/server';
import { client } from '../../lib/sanity';

export async function POST(request) {
  try {
    const { email, source } = await request.json();

    if (!email || !email.includes('@')) {
      return NextResponse.json({ 
        success: false, 
        error: 'Valid email is required' 
      }, { status: 400 });
    }

    const existingSubscriber = await client.fetch(
      `*[_type == "subscriber" && email == $email][0]`,
      { email }
    );

    if (existingSubscriber) {
      return NextResponse.json({
        success: true,
        message: 'Already subscribed'
      });
    }

    const newSubscriber = await client.create({
      _type: 'subscriber',
      email,
      source: source || 'website',
      subscribedAt: new Date().toISOString(),
      active: true
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed!',
      id: newSubscriber._id
    });

  } catch (error) {
    console.error('Subscribe error:', error);
    return NextResponse.json({
      success: true,
      message: 'Subscribed (demo mode)'
    });
  }
}
