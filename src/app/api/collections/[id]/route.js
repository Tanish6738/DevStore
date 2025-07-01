import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../lib/auth';
import { Collection, CollectionItem } from '../../../../../lib/models';
import connectDB from '../../../../../lib/connectDB';

// Get a specific collection
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
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
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Error fetching collection' },
      { status: 500 }
    );
  }
}

// Update a collection
export const PUT = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = params;
    const data = await request.json();

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Only the owner can update the collection
    if (collection.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedFields = ['name', 'description', 'isPublic'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    const updatedCollection = await Collection.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('userId', 'displayName avatarUrl');

    return NextResponse.json(updatedCollection);
  } catch (error) {
    console.error('Error updating collection:', error);
    return NextResponse.json(
      { error: 'Error updating collection' },
      { status: 500 }
    );
  }
});

// Delete a collection
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = params;

    const collection = await Collection.findById(id);

    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Only the owner can delete the collection
    if (collection.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Delete all items in the collection first
    await CollectionItem.deleteMany({ collectionId: id });

    // Delete the collection
    await Collection.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Collection deleted successfully' });
  } catch (error) {
    console.error('Error deleting collection:', error);
    return NextResponse.json(
      { error: 'Error deleting collection' },
      { status: 500 }
    );
  }
});
