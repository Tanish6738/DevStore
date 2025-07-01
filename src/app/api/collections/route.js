import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { Collection, CollectionItem } from '../../../../lib/models';
import { withAuth } from '../../../../lib/auth';


// Get user's collections
export const GET = withAuth(async (request) => {
  try {
    const user = request.user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const skip = (page - 1) * limit;

    const collections = await Collection.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Get item counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const itemCount = await CollectionItem.countDocuments({
          collectionId: collection._id,
        });
        return {
          ...collection.toObject(),
          itemCount,
        };
      })
    );

    const total = await Collection.countDocuments({ userId: user._id });

    return NextResponse.json({
      collections: collectionsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Error fetching collections' },
      { status: 500 }
    );
  }
});

// Create a new collection
export const POST = withAuth(async (request) => {
  try {
    const user = request.user;
    const data = await request.json();

    const { name, description, isPublic } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    const collection = new Collection({
      name: name.trim(),
      description: description || '',
      isPublic: isPublic || false,
      userId: user._id,
    });

    await collection.save();

    return NextResponse.json({
      ...collection.toObject(),
      itemCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Error creating collection' },
      { status: 500 }
    );
  }
});
