import { NextResponse } from 'next/server';
import { client } from '../../lib/sanity';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const productId = searchParams.get('productId');
    const category = searchParams.get('category');
    const type = searchParams.get('type') || 'product';

    if (!productId) {
      return NextResponse.json({ 
        success: false, 
        error: 'Product ID is required' 
      }, { status: 400 });
    }

    let query = `*[_type == "${type}" && _id != $productId && defined(price)] | order(_createdAt desc) [0...6] {
      _id,
      _type,
      name,
      title,
      price,
      slug,
      image
    }`;

    if (category) {
      query = `*[_type == "${type}" && _id != $productId && category == $category && defined(price)] | order(_createdAt desc) [0...6] {
        _id,
        _type,
        name,
        title,
        price,
        slug,
        image
      }`;
    }

    const products = await client.fetch(query, { productId, category });

    return NextResponse.json({
      success: true,
      products: products || []
    });

  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json({
      success: true,
      products: []
    });
  }
}
