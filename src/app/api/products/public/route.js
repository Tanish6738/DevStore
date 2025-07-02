import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Product } from '../../../../../lib/models';

// GET /api/products/public - Get public community products
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const approved = searchParams.get('approved') !== 'false'; // Default to true
    const sort = searchParams.get('sort') || 'newest'; // newest, popular, rating

    const skip = (page - 1) * limit;

    // Build query for public products
    const query = {
      isPublic: true,
      'communityData.isHidden': false,
    };

    // Remove approval requirement for now (as requested by user)
    // if (approved) {
    //   query['communityData.isApproved'] = true;
    // }

    if (category && category !== 'all') {
      query.category = category;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Build sort criteria
    let sortCriteria = {};
    switch (sort) {
      case 'popular':
        sortCriteria = { 'publicAnalytics.viewCount': -1, 'publicAnalytics.clickCount': -1 };
        break;
      case 'rating':
        sortCriteria = { 'averageRating': -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortCriteria = search ? { score: { $meta: 'textScore' } } : { createdAt: -1 };
        break;
    }

    // Execute query
    const products = await Product.find(query)
      .populate('addedBy', 'displayName avatarUrl')
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    // Get categories for filtering
    const categories = await Product.distinct('category', {
      isPublic: true,
      'communityData.isHidden': false,
      'communityData.isApproved': approved
    });

    return NextResponse.json({
      products,
      categories,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error('Error fetching public products:', error);
    return NextResponse.json(
      { error: 'Error fetching public products' },
      { status: 500 }
    );
  }
}
