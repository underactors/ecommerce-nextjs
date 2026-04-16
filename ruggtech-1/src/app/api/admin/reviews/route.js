import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { writeClient, client } from '../../../lib/sanity';

const ADMIN_EMAILS = ['davoncudjoe88@gmail.com'];

async function verifyAdmin() {
  try {
    const user = await currentUser();
    if (!user) return false;
    const email = user.emailAddresses?.[0]?.emailAddress;
    return email && ADMIN_EMAILS.includes(email);
  } catch {
    return false;
  }
}

export async function GET(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const filter = searchParams.get('filter') || 'all';

    let query = `*[_type == "review"]`;
    if (filter === 'pending') query = `*[_type == "review" && approved == false]`;
    else if (filter === 'approved') query = `*[_type == "review" && approved == true]`;

    const reviews = await client.fetch(
      `${query} | order(createdAt desc) {
        _id,
        productId,
        productSlug,
        productType,
        customerName,
        customerEmail,
        rating,
        title,
        content,
        verified,
        approved,
        helpful,
        createdAt
      }`
    );

    const allReviews = await client.fetch(`*[_type == "review"]{ approved }`);
    const stats = {
      total: allReviews.length,
      pending: allReviews.filter(r => !r.approved).length,
      approved: allReviews.filter(r => r.approved).length
    };

    return NextResponse.json({ success: true, reviews, stats });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json({ success: false, error: 'Failed to fetch reviews' }, { status: 500 });
  }
}

export async function PATCH(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { reviewId, action } = body;

    if (!reviewId || !action) {
      return NextResponse.json({ success: false, error: 'Missing reviewId or action' }, { status: 400 });
    }

    if (action === 'approve') {
      await writeClient.patch(reviewId).set({ approved: true }).commit();
      return NextResponse.json({ success: true, message: 'Review approved' });
    } else if (action === 'reject') {
      await writeClient.patch(reviewId).set({ approved: false }).commit();
      return NextResponse.json({ success: true, message: 'Review rejected' });
    } else {
      return NextResponse.json({ success: false, error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Error updating review:', error);
    return NextResponse.json({ success: false, error: 'Failed to update review' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('id');

    if (!reviewId) {
      return NextResponse.json({ success: false, error: 'Missing review ID' }, { status: 400 });
    }

    await writeClient.delete(reviewId);
    return NextResponse.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ success: false, error: 'Failed to delete review' }, { status: 500 });
  }
}
