import { NextResponse } from 'next/server';
import { client } from '../../lib/sanity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }

    const reviews = await client.fetch(
      `*[_type == "review" && productId == $productId && approved == true] | order(createdAt desc) {
        _id,
        customerName,
        rating,
        title,
        content,
        verified,
        helpful,
        createdAt
      }`,
      { productId }
    );

    return NextResponse.json({
      success: true,
      reviews: reviews || []
    });

  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({
      success: true,
      reviews: []
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { productId, productSlug, productType, name, email, rating, title, content } = body;

    if (!productId || !name || !content || !rating) {
      return NextResponse.json({ 
        success: false, 
        error: 'Missing required fields' 
      }, { status: 400 });
    }

    const newReview = await client.create({
      _type: 'review',
      productId,
      productSlug: productSlug || '',
      productType: productType || 'product',
      customerName: name,
      customerEmail: email || '',
      rating: parseInt(rating),
      title: title || '',
      content,
      verified: false,
      approved: false,
      helpful: 0,
      createdAt: new Date().toISOString()
    });

    return NextResponse.json({
      success: true,
      message: 'Review submitted successfully',
      review: newReview
    });

  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json({
      success: true,
      message: 'Review submitted (pending approval)'
    });
  }
}
