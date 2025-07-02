import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { UserFavorite } from '../../../../../../lib/models';
import { withAuth } from '../../../../../../lib/auth';

// GET /api/users/me/favorites - Get user's favorite products
export const GET = withAuth(async (request) => {
  try {
    const user = request.user;
    await connectDB();

    const favorites = await UserFavorite.find({ userId: user.id })
      .populate({
        path: 'productId',
        select: 'title description url faviconUrl category createdAt addedBy',
        populate: {
          path: 'addedBy',
          select: 'displayName avatarUrl'
        }
      })
      .sort({ createdAt: -1 });

    // Filter out any favorites where the product was deleted
    const validFavorites = favorites.filter(fav => fav.productId);

    return NextResponse.json({
      favorites: validFavorites
    });

  } catch (error) {
    console.error('Error fetching user favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
});
