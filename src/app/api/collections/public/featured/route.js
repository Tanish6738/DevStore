import { NextResponse } from 'next/server';
import { Collection, CollectionItem } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';

// GET /api/collections/public/featured - Get featured/trending collections
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'trending'; // trending, popular, recent
    const limit = parseInt(searchParams.get('limit')) || 6;

    let sortObj = {};
    let timeFilter = {};

    switch (type) {
      case 'trending':
        // Collections with most activity in the last 7 days
        timeFilter = {
          'analytics.lastViewed': {
            $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        };
        sortObj = { 'analytics.viewCount': -1, createdAt: -1 };
        break;
      case 'popular':
        // Most viewed collections of all time
        sortObj = { 'analytics.viewCount': -1 };
        break;
      case 'recent':
        // Recently created collections
        sortObj = { createdAt: -1 };
        break;
      default:
        sortObj = { 'analytics.viewCount': -1 };
        break;
    }

    const query = { 
      isPublic: true,
      ...timeFilter
    };

    // Get featured collections
    const collections = await Collection.find(query)
      .populate('userId', 'displayName email avatarUrl')
      .sort(sortObj)
      .limit(limit)
      .lean();

    // Get item counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const itemCount = await CollectionItem.countDocuments({
          collectionId: collection._id
        });

        return {
          ...collection,
          owner: collection.userId,
          itemCount,
        };
      })
    );

    return NextResponse.json({
      collections: collectionsWithCounts,
      type
    });
  } catch (error) {
    console.error('Error fetching featured collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured collections' }, 
      { status: 500 }
    );
  }
}
