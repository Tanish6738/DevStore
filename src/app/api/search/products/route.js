import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Product } from '../../../../../lib/models';


export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (!q || q.trim() === '') {
      return NextResponse.json({
        products: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const skip = (page - 1) * limit;

    // Build search query
    const query = {
      $text: { $search: q },
    };

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .populate('addedBy', 'displayName avatarUrl')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching products:', error);
    return NextResponse.json(
      { error: 'Error searching products' },
      { status: 500 }
    );
  }
}
