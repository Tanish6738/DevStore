import { NextResponse } from 'next/server';
import { Product } from '../../../../../lib/models';
import connectDB from '../../../../../lib/connectDB';

export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');

    const skip = (page - 1) * limit;

    // Build query for predefined products
    const query = { isPredefined: true };
    
    if (category) {
      query.category = category;
    }

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    // Get unique categories
    const categories = await Product.distinct('category', { isPredefined: true });

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
    console.error('Error fetching predefined products:', error);
    return NextResponse.json(
      { error: 'Error fetching predefined products' },
      { status: 500 }
    );
  }
}
