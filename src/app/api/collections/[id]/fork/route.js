import { NextResponse } from 'next/server';
import connectDB from '../../../../../../lib/connectDB';
import { Collection, CollectionItem, CollectionCollaborator, Product, User, Activity, Notification } from '../../../../../../lib/models';
import { currentUser } from '@clerk/nextjs/server';
import mongoose from 'mongoose';
import { forkCollectionItemsBatch, validateCollectionSize } from '../../../../../../lib/forkUtils';

// POST /api/collections/[id]/fork - Fork a public collection
export async function POST(request, { params }) {
  const session = await mongoose.startSession();
  
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    await session.startTransaction();

    const resolvedParams = await params;
    // Get the original collection with lean query for better performance
    const originalCollection = await Collection.findById(resolvedParams.id)
      .populate('userId', 'displayName email')
      .lean()
      .session(session);

    if (!originalCollection) {
      await session.abortTransaction();
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Check if collection is public or user has access
    if (!originalCollection.isPublic) {
      // Check if user is a collaborator
      const hasAccess = originalCollection.userId.toString() === user.id || 
        await CollectionCollaborator.findOne({
          collectionId: resolvedParams.id,
          userId: user.id,
          role: { $in: ['admin', 'edit', 'view'] }
        }).lean().session(session);

      if (!hasAccess) {
        await session.abortTransaction();
        return NextResponse.json({ error: 'Collection is not public' }, { status: 403 });
      }
    }

    // Validate collection size before forking
    const sizeValidation = await validateCollectionSize(resolvedParams.id, session);
    if (!sizeValidation.valid) {
      await session.abortTransaction();
      return NextResponse.json({ 
        error: sizeValidation.message,
        itemCount: sizeValidation.itemCount 
      }, { status: 400 });
    }

    // Get or create user in database with session
    let dbUser = await User.findOne({ clerkId: user.id }).session(session);
    if (!dbUser) {
      dbUser = await User.create([{
        clerkId: user.id,
        displayName: user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Anonymous',
        email: user.emailAddresses[0]?.emailAddress || '',
        avatarUrl: user.imageUrl || '',
      }], { session });
      dbUser = dbUser[0]; // Extract from array when using session
    }

    // Generate a unique name for the forked collection
    let forkedName = `${originalCollection.name} (Copy)`;
    let counter = 1;
    
    while (await Collection.findOne({ name: forkedName, userId: dbUser._id }).lean().session(session)) {
      counter++;
      forkedName = `${originalCollection.name} (Copy ${counter})`;
    }

    // Create the forked collection
    const forkedCollectionData = [{
      name: forkedName,
      description: originalCollection.description,
      isPublic: false, // Start as private
      userId: dbUser._id,
      analytics: {
        viewCount: 0,
        uniqueVisitors: 0,
        lastViewed: new Date(),
        clickCount: 0
      },
      templateData: {
        isTemplate: false,
        templateCategory: originalCollection.templateData?.templateCategory || '',
        templateDescription: originalCollection.templateData?.templateDescription || '',
        templateTags: originalCollection.templateData?.templateTags || [],
        isPublicTemplate: false
      }
    }];

    const forkedCollectionResult = await Collection.create(forkedCollectionData, { session });
    const forkedCollection = forkedCollectionResult[0];

    // Use optimized batch forking for better performance with large collections
    const forkedItemsCount = await forkCollectionItemsBatch(
      originalCollection._id,
      forkedCollection._id,
      dbUser._id,
      session
    );

    // Create activity log and notification in parallel for better performance
    const [activityResult, notificationResult] = await Promise.all([
      Activity.create([{
        userId: dbUser._id,
        action: 'fork_collection',
        targetType: 'Collection',
        targetId: forkedCollection._id,
        metadata: {
          originalCollectionId: originalCollection._id,
          originalCollectionName: originalCollection.name,
          forkedItemsCount: forkedItemsCount
        }
      }], { session }),
      
      // Only create notification if different user
      originalCollection.userId.toString() !== dbUser._id.toString() ? 
        Notification.create([{
          userId: originalCollection.userId,
          type: 'collection_shared',
          title: 'Collection Forked',
          message: `${dbUser.displayName} forked your collection "${originalCollection.name}"`,
          relatedId: originalCollection._id,
          relatedType: 'Collection',
          actionUrl: `/collections/${originalCollection._id}`,
          metadata: {
            forkedCollectionId: forkedCollection._id,
            forkedBy: dbUser.displayName,
            itemsCount: forkedItemsCount
          }
        }], { session }) : Promise.resolve(null)
    ]);

    // Update original collection analytics with atomic operation
    await Collection.findByIdAndUpdate(
      originalCollection._id, 
      { $inc: { 'analytics.clickCount': 1 } },
      { session }
    );

    // Commit the transaction
    await session.commitTransaction();

    return NextResponse.json({
      success: true,
      message: 'Collection forked successfully',
      collectionId: forkedCollection._id,
      collection: {
        id: forkedCollection._id,
        name: forkedCollection.name,
        description: forkedCollection.description,
        itemsCount: forkedItemsCount
      }
    });
  } catch (error) {
    console.error('Error forking collection:', error);
    
    // Rollback transaction on error
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    
    return NextResponse.json(
      { error: 'Failed to fork collection' }, 
      { status: 500 }
    );
  } finally {
    // End session
    await session.endSession();
  }
}
