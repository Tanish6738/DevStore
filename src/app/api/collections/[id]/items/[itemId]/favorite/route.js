import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../../../../../lib/connectDB';
import { Collection, CollectionCollaborator, CollectionItem } from '../../../../../../../../lib/models';

// POST /api/collections/[id]/items/[itemId]/favorite - Toggle favorite status of an item
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: collectionId, itemId } = await params;

    // Check if collection exists and user has access
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check permissions: owner or collaborator
    const hasAccess = collection.userId.toString() === user.id ||
      await CollectionCollaborator.findOne({
        collectionId: collectionId,
        userId: user.id,
        role: { $in: ['edit', 'admin'] }
      });

    if (!hasAccess && !collection.isPublic) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the collection item
    const collectionItem = await CollectionItem.findById(itemId);
    if (!collectionItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify the item belongs to this collection
    if (collectionItem.collectionId.toString() !== collectionId) {
      return NextResponse.json({ error: 'Item does not belong to this collection' }, { status: 400 });
    }

    // Only allow the user who added the item or collection owner/admin to favorite
    const canFavorite = collectionItem.addedBy.toString() === user.id ||
      collection.userId.toString() === user.id ||
      await CollectionCollaborator.findOne({
        collectionId: collectionId,
        userId: user.id,
        role: { $in: ['edit', 'admin'] }
      });

    if (!canFavorite) {
      return NextResponse.json({ error: 'You can only favorite items you added or have admin access to' }, { status: 403 });
    }

    // Toggle favorite status
    const updatedItem = await CollectionItem.findByIdAndUpdate(
      itemId,
      { isFavorite: !collectionItem.isFavorite },
      { new: true }
    ).populate('productId');

    return NextResponse.json({
      success: true,
      item: {
        id: updatedItem._id,
        isFavorite: updatedItem.isFavorite,
        product: updatedItem.productId
      },
      message: updatedItem.isFavorite ? 'Item favorited' : 'Item unfavorited'
    });

  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
}

// GET /api/collections/[id]/items/[itemId]/favorite - Get favorite status
export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id: collectionId, itemId } = await params;

    // Check if collection exists and user has access
    const collection = await Collection.findById(collectionId);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check permissions
    const hasAccess = collection.userId.toString() === user.id ||
      collection.isPublic ||
      await CollectionCollaborator.findOne({
        collectionId: collectionId,
        userId: user.id
      });

    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Find the collection item
    const collectionItem = await CollectionItem.findById(itemId)
      .populate('productId');

    if (!collectionItem) {
      return NextResponse.json({ error: 'Item not found' }, { status: 404 });
    }

    // Verify the item belongs to this collection
    if (collectionItem.collectionId.toString() !== collectionId) {
      return NextResponse.json({ error: 'Item does not belong to this collection' }, { status: 400 });
    }

    return NextResponse.json({
      item: {
        id: collectionItem._id,
        isFavorite: collectionItem.isFavorite,
        product: collectionItem.productId,
        notes: collectionItem.notes,
        lastAccessed: collectionItem.lastAccessed,
        accessCount: collectionItem.accessCount
      }
    });

  } catch (error) {
    console.error('Error getting favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to get favorite status' },
      { status: 500 }
    );
  }
}
