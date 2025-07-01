import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Collection } from '../../../../../lib/models';


export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q') || '';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    if (!q || q.trim() === '') {
      return NextResponse.json({
        collections: [],
        pagination: {
          page,
          limit,
          total: 0,
          pages: 0,
        },
      });
    }

    const skip = (page - 1) * limit;

    // Search public collections only
    const query = {
      $text: { $search: q },
      isPublic: true,
    };

    const collections = await Collection.find(query)
      .populate('userId', 'displayName avatarUrl')
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    const total = await Collection.countDocuments(query);

    return NextResponse.json({
      collections,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error searching collections:', error);
    return NextResponse.json(
      { error: 'Error searching collections' },
      { status: 500 }
    );
  }
}
