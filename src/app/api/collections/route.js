import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { Collection, CollectionItem, User } from '../../../../lib/models';
import { withAuth } from '../../../../lib/auth';

// Get user's collections
export const GET = withAuth(async (request) => {
  try {
    await connectDB();
    const user = request.user;
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;

    console.log('Fetching collections for user:', user._id);

    const skip = (page - 1) * limit;

    const collections = await Collection.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log('Found collections:', collections.length);

    // Get item counts for each collection
    const collectionsWithCounts = await Promise.all(
      collections.map(async (collection) => {
        const itemCount = await CollectionItem.countDocuments({
          collectionId: collection._id,
        });
        return {
          ...collection.toObject(),
          itemCount,
        };
      })
    );

    const total = await Collection.countDocuments({ userId: user._id });

    return NextResponse.json({
      collections: collectionsWithCounts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching collections:', error);
    return NextResponse.json(
      { error: 'Error fetching collections: ' + error.message },
      { status: 500 }
    );
  }
});

// Create a new collection
export const POST = withAuth(async (request) => {
  try {
    const user = request.user;
    const data = await request.json();

    const { 
      name, 
      description, 
      isPublic, 
      isTemplate, 
      templateData, 
      category 
    } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Collection name is required' },
        { status: 400 }
      );
    }

    // Validate template-specific fields if creating a template
    if (isTemplate && (!templateData?.templateCategory || templateData.templateCategory === '')) {
      return NextResponse.json(
        { error: 'Template category is required for templates' },
        { status: 400 }
      );
    }

    const collectionDoc = {
      name: name.trim(),
      description: description || '',
      isPublic: isPublic || false,
      userId: user._id,
      createdBy: user.clerkId || user._id.toString(),
      category: category || 'general',
    };

    // Add template-specific fields if this is a template
    if (isTemplate) {
      collectionDoc.isTemplate = true;
      collectionDoc.templateData = {
        isTemplate: true,
        templateCategory: templateData.templateCategory,
        templateDescription: templateData.templateDescription || description || '',
        templateTags: templateData.templateTags || [],
        isPublicTemplate: templateData.isPublicTemplate || false,
        usageCount: 0,
      };
      collectionDoc.usageCount = 0;
    }

    const collection = new Collection(collectionDoc);
    await collection.save();

    return NextResponse.json({
      ...collection.toObject(),
      itemCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating collection:', error);
    return NextResponse.json(
      { error: 'Error creating collection' },
      { status: 500 }
    );
  }
});
