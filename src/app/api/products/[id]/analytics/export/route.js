import { NextResponse } from 'next/server';
import connectDB from '../../../../../../../lib/connectDB';
import { Product, CollectionItem, Collection } from '../../../../../../../lib/models';

// GET /api/products/[id]/analytics/export - Export analytics data
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'csv';
    const timeRange = searchParams.get('timeRange') || '30d';

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Calculate date range
    let startDate;
    switch (timeRange) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    // Get detailed analytics data
    const analytics = await CollectionItem.aggregate([
      {
        $match: {
          productId: product._id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $lookup: {
          from: 'collections',
          localField: 'collectionId',
          foreignField: '_id',
          as: 'collection'
        }
      },
      { $unwind: '$collection' },
      {
        $project: {
          _id: 1,
          accessCount: 1,
          isFavorite: 1,
          createdAt: 1,
          lastAccessed: 1,
          collectionName: '$collection.name',
          collectionIsPublic: '$collection.isPublic',
          collectionOwner: '$collection.userId'
        }
      },
      { $sort: { createdAt: -1 } }
    ]);

    // Get overall statistics
    const totalStats = await CollectionItem.aggregate([
      { $match: { productId: product._id } },
      {
        $group: {
          _id: null,
          totalUsage: { $sum: 1 },
          totalAccess: { $sum: '$accessCount' },
          favoriteCount: { $sum: { $cond: [{ $eq: ['$isFavorite', true] }, 1, 0] } },
          publicUsage: {
            $sum: {
              $cond: [{ $eq: ['$collection.isPublic', true] }, 1, 0]
            }
          }
        }
      }
    ]);

    const stats = totalStats[0] || {
      totalUsage: 0,
      totalAccess: 0,
      favoriteCount: 0,
      publicUsage: 0
    };

    if (format === 'json') {
      return NextResponse.json({
        product: {
          id: product._id,
          title: product.title,
          url: product.url,
          category: product.category,
          createdAt: product.createdAt
        },
        timeRange,
        summary: stats,
        details: analytics
      });
    }

    // CSV Export
    const csvHeaders = [
      'Date Added',
      'Collection Name',
      'Is Public',
      'Access Count',
      'Is Favorite',
      'Last Accessed'
    ];

    const csvRows = analytics.map(item => [
      new Date(item.createdAt).toISOString().split('T')[0],
      item.collectionName || 'Unknown',
      item.collectionIsPublic ? 'Yes' : 'No',
      item.accessCount || 0,
      item.isFavorite ? 'Yes' : 'No',
      item.lastAccessed ? new Date(item.lastAccessed).toISOString().split('T')[0] : 'Never'
    ]);

    // Add summary row
    csvRows.unshift([
      '--- SUMMARY ---',
      '',
      '',
      '',
      '',
      ''
    ]);
    csvRows.splice(1, 0, [
      'Total Collections',
      stats.totalUsage,
      '',
      '',
      '',
      ''
    ]);
    csvRows.splice(2, 0, [
      'Total Access Count',
      stats.totalAccess,
      '',
      '',
      '',
      ''
    ]);
    csvRows.splice(3, 0, [
      'Total Favorites',
      stats.favoriteCount,
      '',
      '',
      '',
      ''
    ]);
    csvRows.splice(4, 0, [
      'Public Collections',
      stats.publicUsage,
      '',
      '',
      '',
      ''
    ]);
    csvRows.splice(5, 0, [
      '--- DETAILS ---',
      '',
      '',
      '',
      '',
      ''
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map(row => row.map(field => 
        typeof field === 'string' && field.includes(',') 
          ? `"${field.replace(/"/g, '""')}"` 
          : field
      ).join(','))
    ].join('\n');

    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${product.title}-analytics-${timeRange}.csv"`,
      },
    });

  } catch (error) {
    console.error('Error exporting product analytics:', error);
    return NextResponse.json(
      { error: 'Failed to export analytics' },
      { status: 500 }
    );
  }
}
