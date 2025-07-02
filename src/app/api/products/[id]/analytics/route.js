import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { Product, CollectionItem, Collection } from '../../../../../../lib/models';

// GET /api/products/[id]/analytics - Get detailed analytics for a product
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Get usage statistics
    const totalUsage = await CollectionItem.countDocuments({ productId: id });
    
    // Get public usage statistics
    const publicUsage = await CollectionItem.aggregate([
      { $match: { productId: product._id } },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionId',
          foreignField: '_id',
          as: 'collection'
        }
      },
      { $unwind: '$collection' },
      { $match: { 'collection.isPublic': true } },
      { $count: 'publicCount' }
    ]);

    // Get public collections using this product
    const publicCollections = await Collection.find({
      _id: { $in: await CollectionItem.distinct('collectionId', { productId: id }) },
      isPublic: true
    }).select('name description userId analytics.viewCount')
      .populate('userId', 'displayName email avatarUrl')
      .limit(10);

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentUsage = await CollectionItem.countDocuments({
      productId: id,
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Calculate total access count and favorites
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

    // Get weekly usage trend (last 8 weeks)
    const eightWeeksAgo = new Date(Date.now() - 8 * 7 * 24 * 60 * 60 * 1000);
    const weeklyTrend = await CollectionItem.aggregate([
      { 
        $match: { 
          productId: product._id,
          createdAt: { $gte: eightWeeksAgo }
        } 
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            week: { $week: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.week': 1 } }
    ]);

    // Get category ranking
    const categoryRanking = await Product.aggregate([
      { $match: { category: product.category } },
      {
        $lookup: {
          from: 'collectionitems',
          localField: '_id',
          foreignField: 'productId',
          as: 'usage'
        }
      },
      {
        $addFields: {
          usageCount: { $size: '$usage' }
        }
      },
      { $sort: { usageCount: -1 } },
      {
        $group: {
          _id: null,
          products: { $push: { _id: '$_id', usageCount: '$usageCount' } },
          totalProducts: { $sum: 1 }
        }
      }
    ]);

    const stats = accessStats[0] || { totalAccess: 0, favoriteCount: 0 };
    
    // Calculate rank in category
    let categoryRank = null;
    if (categoryRanking.length > 0) {
      const products = categoryRanking[0].products;
      const index = products.findIndex(p => p._id.toString() === id);
      if (index !== -1) {
        categoryRank = {
          rank: index + 1,
          totalInCategory: categoryRanking[0].totalProducts
        };
      }
    }

    return NextResponse.json({
      statistics: {
        totalUsage: totalUsage,
        publicUsage: publicUsage[0]?.publicCount || 0,
        recentUsage: recentUsage,
        totalAccess: stats.totalAccess,
        favoriteCount: stats.favoriteCount,
        categoryRank: categoryRank
      },
      publicCollections: publicCollections.map(collection => ({
        id: collection._id,
        name: collection.name,
        description: collection.description,
        viewCount: collection.analytics?.viewCount || 0,
        creator: {
          displayName: collection.userId?.displayName,
          email: collection.userId?.email,
          avatarUrl: collection.userId?.avatarUrl
        }
      })),
      trends: {
        weekly: weeklyTrend
      }
    });

  } catch (error) {
    console.error('Error fetching product analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product analytics' },
      { status: 500 }
    );
  }
}
