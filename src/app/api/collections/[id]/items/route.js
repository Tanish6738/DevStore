import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../../lib/auth';
import { Collection, CollectionItem, Product } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';

// Get items in a collection
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    const skip = (page - 1) * limit;

    // Check if collection exists
    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    const items = await CollectionItem.find({ collectionId: id })
      .populate('productId')
      .populate('addedBy', 'displayName avatarUrl')
      .sort({ order: 1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await CollectionItem.countDocuments({ collectionId: id });

    return NextResponse.json({
      items,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching collection items:', error);
    return NextResponse.json(
      { error: 'Error fetching collection items' },
      { status: 500 }
    );
  }
}

// Add item to collection
export const POST = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = params;
    const data = await request.json();

    const { productId, notes, order } = data;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user has access
    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    // Only the owner can add items to the collection
    if (collection.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check if item already exists in collection
    const existingItem = await CollectionItem.findOne({
      collectionId: id,
      productId,
    });

    if (existingItem) {
      return NextResponse.json(
        { error: 'Product already exists in this collection' },
        { status: 409 }
      );
    }

    // Get the next order number if not provided
    let itemOrder = order;
    if (itemOrder === undefined) {
      const lastItem = await CollectionItem.findOne({ collectionId: id })
        .sort({ order: -1 });
      itemOrder = lastItem ? lastItem.order + 1 : 0;
    }

    const collectionItem = new CollectionItem({
      collectionId: id,
      productId,
      addedBy: user._id,
      notes: notes || '',
      order: itemOrder,
    });

    await collectionItem.save();
    await collectionItem.populate(['productId', { path: 'addedBy', select: 'displayName avatarUrl' }]);

    return NextResponse.json(collectionItem, { status: 201 });
  } catch (error) {
    console.error('Error adding item to collection:', error);
    return NextResponse.json(
      { error: 'Error adding item to collection' },
      { status: 500 }
    );
  }
});

// Update item order/notes
export const PUT = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = params;
    const data = await request.json();

    const { itemId, notes, order } = data;

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user has access
    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const updateData = {};
    if (notes !== undefined) updateData.notes = notes;
    if (order !== undefined) updateData.order = order;

    const updatedItem = await CollectionItem.findByIdAndUpdate(
      itemId,
      updateData,
      { new: true }
    ).populate(['productId', { path: 'addedBy', select: 'displayName avatarUrl' }]);

    if (!updatedItem) {
      return NextResponse.json(
        { error: 'Collection item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedItem);
  } catch (error) {
    console.error('Error updating collection item:', error);
    return NextResponse.json(
      { error: 'Error updating collection item' },
      { status: 500 }
    );
  }
});

// Remove item from collection
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = params;
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    // Check if collection exists and user has access
    const collection = await Collection.findById(id);
    if (!collection) {
      return NextResponse.json(
        { error: 'Collection not found' },
        { status: 404 }
      );
    }

    if (collection.userId.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    const deletedItem = await CollectionItem.findByIdAndDelete(itemId);

    if (!deletedItem) {
      return NextResponse.json(
        { error: 'Collection item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Item removed from collection successfully' });
  } catch (error) {
    console.error('Error removing item from collection:', error);
    return NextResponse.json(
      { error: 'Error removing item from collection' },
      { status: 500 }
    );
  }
});
