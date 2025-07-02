import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Collection, User, CollectionItem } from '../../../../../lib/models';

// GET /api/collections/public - Get all public collections
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 50;
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

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
      query.$text = { $search: search };
    }

    // Build sort object
    const sortObj = {};
    switch (sortBy) {
      case 'name':
        sortObj.name = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'updatedAt':
        sortObj.updatedAt = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'viewCount':
        sortObj['analytics.viewCount'] = sortOrder === 'desc' ? -1 : 1;
        break;
      case 'createdAt':
      default:
        sortObj.createdAt = sortOrder === 'desc' ? -1 : 1;
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
          owner: collection.userId,
          itemCount,
        };
      })
    );

    // Get total count for pagination
    const totalCount = await Collection.countDocuments(query);

    return NextResponse.json({
      collections: collectionsWithCounts,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
        hasNextPage: page < Math.ceil(totalCount / limit),
        hasPrevPage: page > 1
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
