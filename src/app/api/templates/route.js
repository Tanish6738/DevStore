import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Collection } from '../../../../lib/models';
import connectDB from '../../../../lib/connectDB';


// GET /api/templates - Get all public templates
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category') || null;
    
    const query = {
      $or: [
        { isTemplate: true },
        { 'templateData.isTemplate': true }
      ],
      $and: [
        {
          $or: [
            { isPublic: true },
            { 'templateData.isPublicTemplate': true }
          ]
        }
      ]
    };

    if (category && category !== 'all') {
      query.$and.push({
        $or: [
          { category: category },
          { 'templateData.templateCategory': category }
        ]
      });
    }

    const templates = await Collection.find(query)
      .populate('createdBy', 'firstName lastName username')
      .sort({ createdAt: -1, usageCount: -1, 'templateData.usageCount': -1 })
      .limit(limit);

    return NextResponse.json({
      templates: templates
    });
  } catch (error) {
    console.error('Error fetching templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' }, 
      { status: 500 }
    );
  }
}

// POST /api/templates - Create collection from template
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, name, description, isPrivate = false } = await request.json();

    await connectDB();

    // Get the template
    const template = await Collection.findById(templateId);
    if (!template || (!template.isTemplate && !template.templateData?.isTemplate)) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    // Create new collection from template
    const newCollection = new Collection({
      name: name || `${template.name} - Copy`,
      description: description || template.description,
      createdBy: user.id,
      isPublic: !isPrivate,
      category: template.category || template.templateData?.templateCategory,
      items: template.items ? template.items.map(item => ({
        ...item,
        addedAt: new Date()
      })) : [],
      itemCount: template.items ? template.items.length : 0,
      fromTemplate: templateId,
      isTemplate: false
    });

    await newCollection.save();

    // Increment template usage count
    await Collection.findByIdAndUpdate(templateId, {
      $inc: { 
        usageCount: 1,
        'templateData.usageCount': 1
      }
    });

    return NextResponse.json({
      collection: newCollection,
      message: 'Collection created from template successfully'
    });
  } catch (error) {
    console.error('Error creating collection from template:', error);
    return NextResponse.json(
      { error: 'Failed to create collection from template' }, 
      { status: 500 }
    );
  }
}
