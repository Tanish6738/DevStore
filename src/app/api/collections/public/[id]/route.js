import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { Collection, CollectionItem } from '../../../../../../lib/models';

// Get public collection
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeItems = searchParams.get('includeItems') === 'true';

    const collection = await Collection.findById(id)
      .populate('userId', 'displayName avatarUrl');

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Check if collection is public
    if (!collection.isPublic) {
      return NextResponse.json(
        { error: 'Collection is private' },
        { status: 403 }
      );
    }

    let collectionData = collection.toObject();

    if (includeItems) {
      const items = await CollectionItem.find({ collectionId: id })
        .populate('productId')
        .populate('addedBy', 'displayName avatarUrl')
        .sort({ order: 1, createdAt: -1 });

      collectionData.items = items;
    }

    // Get item count
    const itemCount = await CollectionItem.countDocuments({ collectionId: id });
    collectionData.itemCount = itemCount;

    return NextResponse.json(collectionData);
  } catch (error) {
    console.error('Error fetching public collection:', error);
    return NextResponse.json(
      { error: 'Error fetching collection' },
      { status: 500 }
    );
  }
}
