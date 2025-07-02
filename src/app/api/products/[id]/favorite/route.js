import { NextResponse } from 'next/server';
// import connectDB from '../../../../../../../lib/connectDB';
// import { Product, UserFavorite } from '../../../../../../../lib/models';
// import { withAuth } from '../../../../../../../lib/auth';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { Product, UserFavorite } from '../../../../../../lib/models';
import { withAuth } from '../../../../../../lib/auth';



// GET /api/products/[id]/favorite - Check if product is favorited by user
export async function GET(request, { params }) {
  try {
    await connectDB();
    const user = await currentUser();
    const { id } = await params;

    if (!user) {
      return NextResponse.json({ isFavorite: false });
    }

    const favorite = await UserFavorite.findOne({
      productId: id,
      userId: user.id
    });

    return NextResponse.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

// POST /api/products/[id]/favorite - Toggle favorite status
export const POST = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = await params;
    const { isFavorite } = await request.json();

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    if (isFavorite) {
      // Add to favorites
      await UserFavorite.findOneAndUpdate(
        { productId: id, userId: user.id },
        { 
          productId: id,
          userId: user.id,
          createdAt: new Date()
        },
        { upsert: true }
      );
    } else {
      // Remove from favorites
      await UserFavorite.deleteOne({
        productId: id,
        userId: user.id
      });
    }

    return NextResponse.json({ isFavorite });
  } catch (error) {
    console.error('Error toggling favorite:', error);
    return NextResponse.json(
      { error: 'Failed to toggle favorite' },
      { status: 500 }
    );
  }
});
