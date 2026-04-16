import { NextResponse } from 'next/server';
import { writeClient, getUserCart, createUserCart, updateUserCart, deleteUserCart } from '../../lib/sanity';

const memoryStorage = new Map();

function isSanityAvailable() {
  return !!(writeClient && getUserCart && createUserCart && updateUserCart && deleteUserCart);
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (isSanityAvailable()) {
      try {
        const existingCart = await getUserCart(userId);

        if (existingCart) {
          return NextResponse.json({
            cartItems: existingCart.cartItems || [],
            updatedAt: existingCart.lastUpdated || existingCart._updatedAt,
            source: 'sanity'
          });
        } else {
          return NextResponse.json({
            cartItems: [],
            updatedAt: null,
            source: 'sanity'
          });
        }
      } catch (sanityError) {
        console.error('Sanity error, falling back to memory:', sanityError);
      }
    }

    const memoryCart = memoryStorage.get(userId);
    
    return NextResponse.json({
      cartItems: memoryCart?.cartItems || [],
      updatedAt: memoryCart?.updatedAt || null,
      source: 'memory'
    });

  } catch (error) {
    console.error('Error in GET /api/cart:', error);
    return NextResponse.json({ 
      error: 'Failed to load cart',
      details: error.message,
      cartItems: [],
      source: 'error'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      return NextResponse.json({ error: 'Invalid JSON in request body' }, { status: 400 });
    }

    const { userId, cartItems, updatedAt } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (!Array.isArray(cartItems)) {
      return NextResponse.json({ error: 'Cart items must be an array' }, { status: 400 });
    }

    if (isSanityAvailable()) {
      try {
        const existingCart = await getUserCart(userId);

        let result;

        if (existingCart) {
          result = await updateUserCart(existingCart._id, cartItems);
        } else {
          result = await createUserCart(userId, cartItems);
        }

        return NextResponse.json({
          success: true,
          cartId: result._id,
          itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
          source: 'sanity'
        });

      } catch (sanityError) {
        console.error('Sanity error, falling back to memory:', sanityError);
      }
    }

    const cartData = {
      cartItems: cartItems,
      updatedAt: new Date().toISOString()
    };

    memoryStorage.set(userId, cartData);

    return NextResponse.json({
      success: true,
      cartId: `memory_${userId}`,
      itemCount: cartItems.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0),
      source: 'memory'
    });

  } catch (error) {
    console.error('Error in POST /api/cart:', error);
    return NextResponse.json({ 
      error: 'Failed to save cart',
      details: error.message
    }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (isSanityAvailable()) {
      try {
        const existingCart = await getUserCart(userId);

        if (existingCart) {
          await deleteUserCart(existingCart._id);
        }
      } catch (sanityError) {
        console.error('Error clearing from Sanity:', sanityError);
      }
    }

    memoryStorage.delete(userId);

    return NextResponse.json({
      success: true,
      message: 'Cart cleared'
    });

  } catch (error) {
    console.error('Error in DELETE /api/cart:', error);
    return NextResponse.json({ 
      error: 'Failed to clear cart',
      details: error.message
    }, { status: 500 });
  }
}
