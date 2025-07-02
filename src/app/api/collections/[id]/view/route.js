import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { Collection, CollectionCollaborator, CollectionAnalytics } from '../../../../../../lib/models';
import { currentUser } from '@clerk/nextjs/server';

// POST /api/collections/[id]/view - Track collection view
export async function POST(request, { params }) {
  try {
    await connectDB();

    const resolvedParams = await params;
    const collection = await Collection.findById(resolvedParams.id);
    if (!collection) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Only track views for public collections or if user has access
    if (!collection.isPublic) {
      const user = await currentUser();
      if (!user) {
        return NextResponse.json({ error: 'Collection is private' }, { status: 403 });
      }

      // Check if user has access (owner or collaborator)
      const hasAccess = collection.userId.toString() === user.id || 
        await CollectionCollaborator.findOne({
          collectionId: resolvedParams.id,
          userId: user.id,
          role: { $in: ['admin', 'edit', 'view'] }
        });

      if (!hasAccess) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Update collection analytics
    await Collection.findByIdAndUpdate(resolvedParams.id, {
      $inc: { 
        'analytics.viewCount': 1,
        'analytics.uniqueVisitors': 1 // This is simplified - in reality you'd track unique sessions
      },
      'analytics.lastViewed': new Date()
    });

    // Create detailed analytics record for today
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    await CollectionAnalytics.findOneAndUpdate(
      {
        collectionId: resolvedParams.id,
        date: today
      },
      {
        $inc: { 
          views: 1,
          uniqueVisitors: 1
        },
        $setOnInsert: {
          collectionId: resolvedParams.id,
          date: today,
          clicks: 0,
          itemInteractions: [],
          visitorData: []
        }
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error tracking view:', error);
    return NextResponse.json(
      { error: 'Failed to track view' }, 
      { status: 500 }
    );
  }
}
