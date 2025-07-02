import { NextResponse } from 'next/server';
// import connectDB from '../../../../../../../lib/connectDB';
// import { Product, ProductRating } from '../../../../../../../lib/models';
// import { withAuth } from '../../../../../../../lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { Product, ProductRating } from '../../../../../../lib/models';
import { withAuth } from '../../../../../../lib/auth';



// GET /api/products/[id]/rating - Get product rating
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await currentUser();
    const { id } = await params;

    // Get overall rating statistics
    const ratings = await ProductRating.aggregate([
      { $match: { productId: id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 },
          ratingDistribution: {
            $push: '$rating'
          }
        }
      }
    ]);

    const result = {
      averageRating: ratings[0]?.averageRating || 0,
      totalRatings: ratings[0]?.totalRatings || 0,
      userRating: 0
    };

    // Get user's rating if authenticated
    if (user) {
      const userRating = await ProductRating.findOne({
        productId: id,
        userId: user.id
      });
      result.userRating = userRating?.rating || 0;
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching product rating:', error);
    return NextResponse.json(
      { error: 'Failed to fetch rating' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/rating - Rate a product
export const POST = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = await params;
    const { rating } = await request.json();

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Update or create user's rating
    await ProductRating.findOneAndUpdate(
      { productId: id, userId: user.id },
      { 
        productId: id,
        userId: user.id,
        rating: rating,
        updatedAt: new Date()
      },
      { upsert: true }
    );

    // Get updated statistics
    const ratings = await ProductRating.aggregate([
      { $match: { productId: id } },
      {
        $group: {
          _id: null,
          averageRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    return NextResponse.json({
      averageRating: ratings[0]?.averageRating || 0,
      totalRatings: ratings[0]?.totalRatings || 0,
      userRating: rating
    });
  } catch (error) {
    console.error('Error rating product:', error);
    return NextResponse.json(
      { error: 'Failed to rate product' },
      { status: 500 }
    );
  }
});
