import { NextResponse } from 'next/server';
import { Collection, Activity } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';
import { currentUser } from '@clerk/nextjs/server';

// GET /api/collections/[id]/activity - Get collection activity
export async function GET(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const skip = (page - 1) * limit;

    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if user has access to view activity
    const hasAccess = collection.createdBy === user.id || collection.isPublic;
    if (!hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get activity records for this collection
    const activities = await Activity.find({
      targetType: 'Collection',
      targetId: resolvedParams.id
    })
    .populate('userId', 'firstName lastName imageUrl')
    .sort({ createdAt: -1 })
    .limit(limit)
    .skip(skip);

    const totalActivities = await Activity.countDocuments({
      targetType: 'Collection',
      targetId: resolvedParams.id
    });

    return NextResponse.json({
      activities,
      pagination: {
        page,
        limit,
        total: totalActivities,
        pages: Math.ceil(totalActivities / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching collection activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' }, 
      { status: 500 }
    );
  }
}
