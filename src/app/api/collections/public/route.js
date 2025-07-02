import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Collection, User, CollectionItem } from '../../../../../lib/models';

// GET /api/collections/public - Get all public collections
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    // Build query
    const query = { isPublic: true };

    // Add category filter if specified
    if (category && category !== 'all') {
      query.$or = [
        { 'templateData.templateCategory': category },
        { category: category }
      ];
    }

    // Add search filter if specified
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { 'analytics.viewCount': -1, createdAt: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1, createdAt: -1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    // Get collections with pagination
    const collections = await Collection.find(query)
      .populate('userId', 'displayName email avatarUrl')
      .sort(sortObj)
      .limit(limit)
      .skip((page - 1) * limit)
      .lean();

    // Get item counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const itemCount = await CollectionItem.countDocuments({
          collectionId: collection._id
        });

        return {
          ...collection,
          title: collection.name, // Map name to title for consistency
          createdBy: collection.userId,
          products: itemCount, // For the UI display
          viewCount: collection.analytics?.viewCount || 0,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await Collection.countDocuments(query);
    
    // Get unique categories for filtering
    const allCollections = await Collection.find({ isPublic: true }, { category: 1, 'templateData.templateCategory': 1 });
    const categories = [...new Set(allCollections.flatMap(c => [c.category, c.templateData?.templateCategory]).filter(Boolean))];

    return NextResponse.json({
      collections: collectionsWithCounts,
      categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching public collections:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collections' }, 
      { status: 500 }
    );
  }
}
