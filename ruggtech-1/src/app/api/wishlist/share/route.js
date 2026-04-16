import { NextResponse } from 'next/server';
import { writeClient, client } from '../../../lib/sanity';
import { auth, currentUser } from '@clerk/nextjs/server';
import crypto from 'crypto';

function generateShareId() {
  return crypto.randomBytes(8).toString('hex');
}

function validateShareId(id) {
  return typeof id === 'string' && /^[a-zA-Z0-9]{12,16}$/.test(id);
}

export async function POST(request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const user = await currentUser();
    const ownerName = user?.firstName 
      ? `${user.firstName}${user.lastName ? ' ' + user.lastName : ''}`
      : 'RUGGTECH User';

    const body = await request.json();
    const { items } = body;

    if (!items || items.length === 0) {
      return NextResponse.json(
        { error: 'Wishlist is empty' },
        { status: 400 }
      );
    }

    const existingWishlist = await client.fetch(
      `*[_type == 'sharedWishlist' && ownerId == $userId][0]`,
      { userId }
    );

    const sanitizedItems = items.map(item => ({
      id: item.id || '',
      name: item.name || '',
      price: parseFloat(item.price) || 0,
      brand: item.brand || '',
      category: item.category || '',
      type: item.type || 'product',
      slug: typeof item.slug === 'object' ? item.slug?.current : item.slug || '',
      imageUrl: typeof item.image === 'string' ? item.image : item.image?.url || '',
    }));

    let shareId;
    
    if (existingWishlist) {
      shareId = existingWishlist.shareId;
      await writeClient.patch(existingWishlist._id)
        .set({
          items: sanitizedItems,
          ownerName,
          updatedAt: new Date().toISOString(),
        })
        .commit();
    } else {
      shareId = generateShareId();
      await writeClient.create({
        _type: 'sharedWishlist',
        shareId,
        ownerId: userId,
        ownerName,
        items: sanitizedItems,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      shareId,
      message: 'Wishlist shared successfully',
    });

  } catch (error) {
    console.error('Error sharing wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to share wishlist' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const shareId = searchParams.get('id');

    if (!shareId) {
      return NextResponse.json(
        { error: 'Share ID required' },
        { status: 400 }
      );
    }

    if (!validateShareId(shareId)) {
      return NextResponse.json(
        { error: 'Invalid share ID format' },
        { status: 400 }
      );
    }

    const wishlist = await client.fetch(
      `*[_type == 'sharedWishlist' && shareId == $shareId][0]`,
      { shareId }
    );

    if (!wishlist) {
      return NextResponse.json(
        { error: 'Wishlist not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      wishlist: {
        ownerName: wishlist.ownerName || 'RUGGTECH User',
        items: (wishlist.items || []).map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          brand: item.brand,
          type: item.type,
          slug: item.slug,
          imageUrl: item.imageUrl,
        })),
        createdAt: wishlist.createdAt,
      },
    });

  } catch (error) {
    console.error('Error fetching shared wishlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch wishlist' },
      { status: 500 }
    );
  }
}
