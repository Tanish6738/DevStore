import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Product, CollectionItem } from '../../../../../lib/models';
import { withAuth } from '../../../../../lib/auth';

// Get a specific product
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const includeAnalytics = searchParams.get('analytics') === 'true';

    const product = await Product.findById(id)
      .populate('addedBy', 'displayName avatarUrl');

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // If analytics are requested, include basic usage statistics
    if (includeAnalytics) {
      const totalUsage = await CollectionItem.countDocuments({ productId: id });
      const accessStats = await CollectionItem.aggregate([
        { $match: { productId: product._id } },
        {
          $group: {
            _id: null,
            totalAccess: { $sum: '$accessCount' },
            favoriteCount: {
              $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] }
            }
          }
        }
      ]);

      const stats = accessStats[0] || { totalAccess: 0, favoriteCount: 0 };

      return NextResponse.json({
        ...product.toObject(),
        analytics: {
          totalUsage,
          totalAccess: stats.totalAccess,
          favoriteCount: stats.favoriteCount
        }
      });
    }

    return NextResponse.json(product);
  } catch (error) {
    console.error('Error fetching product:', error);
    return NextResponse.json(
      { error: 'Error fetching product' },
      { status: 500 }
    );
  }
}

// Update a product
export const PUT = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = await params;
    const data = await request.json();

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Only the creator can update their product (or if it's predefined, any user can suggest updates)
    if (!product.isPredefined && product.addedBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    // Update allowed fields
    const allowedFields = ['title', 'description', 'category'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    }

    // Update metadata tags if provided
    if (data.tags && Array.isArray(data.tags)) {
      updateData['metadata.tags'] = data.tags;
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('addedBy', 'displayName avatarUrl');

    return NextResponse.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Error updating product' },
      { status: 500 }
    );
  }
});

// Delete a product
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = await params;

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Only the creator can delete their product (predefined products cannot be deleted)
    if (product.isPredefined || product.addedBy.toString() !== user._id.toString()) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      );
    }

    await Product.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Error deleting product' },
      { status: 500 }
    );
  }
});
