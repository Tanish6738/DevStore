import { NextResponse } from 'next/server';
import { Collection, CollectionAnalytics } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/collections/[id]/analytics - Get collection analytics
export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const range = searchParams.get('range') || '30d';

    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection || collection.createdBy !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Calculate date range
    const now = new Date();
    let startDate;
    switch (range) {
      case '7d':
        startDate = new Date(now - 7 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(now - 90 * 24 * 60 * 60 * 1000);
        break;
      case '1y':
        startDate = new Date(now - 365 * 24 * 60 * 60 * 1000);
        break;
      default: // 30d
        startDate = new Date(now - 30 * 24 * 60 * 60 * 1000);
    }

    // Get analytics data (this would be real data in production)
    const analytics = {
      overview: {
        totalViews: Math.floor(Math.random() * 1000) + 100,
        viewsGrowth: (Math.random() * 50 - 25).toFixed(1),
        uniqueVisitors: Math.floor(Math.random() * 500) + 50,
        visitorsGrowth: (Math.random() * 40 - 20).toFixed(1),
        itemClicks: Math.floor(Math.random() * 200) + 20,
        clicksGrowth: (Math.random() * 60 - 30).toFixed(1),
        avgTimeSpent: (Math.random() * 10 + 2).toFixed(1)
      },
      viewsOverTime: generateTimeSeriesData(range, 'views'),
      popularItems: collection.items?.slice(0, 5).map((item, index) => ({
        label: item.productId?.name || `Item ${index + 1}`,
        value: Math.floor(Math.random() * 50) + 10
      })) || [],
      trafficSources: [
        { label: 'Direct', value: Math.floor(Math.random() * 40) + 30 },
        { label: 'Social', value: Math.floor(Math.random() * 30) + 20 },
        { label: 'Search', value: Math.floor(Math.random() * 20) + 15 },
        { label: 'Referral', value: Math.floor(Math.random() * 15) + 10 }
      ],
      categoryPerformance: getCategoryPerformance(collection),
      recommendations: generateRecommendations(collection)
    };

    return NextResponse.json(analytics);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' }, 
      { status: 500 }
    );
  }
}

function generateTimeSeriesData(range, type) {
  const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
  const data = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    data.push({
      label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      value: Math.floor(Math.random() * 50) + 10
    });
  }
  
  return data;
}

function getCategoryPerformance(collection) {
  const categories = {};
  collection.items?.forEach(item => {
    const category = item.productId?.category || 'Other';
    categories[category] = (categories[category] || 0) + Math.floor(Math.random() * 20) + 5;
  });

  const total = Object.values(categories).reduce((sum, value) => sum + value, 0);
  
  return Object.entries(categories).map(([name, clicks]) => ({
    name,
    clicks,
    percentage: ((clicks / total) * 100).toFixed(1)
  }));
}

function generateRecommendations(collection) {
  const recommendations = [
    "Your collection is getting good engagement! Consider adding more items to keep visitors interested.",
    "Most clicks happen on weekends. Try scheduling updates for Friday evenings.",
    "Items with descriptions get 40% more clicks. Consider adding descriptions to more items.",
    "Social media is your top traffic source. Keep sharing your collection!"
  ];
  
  return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
}
