import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import { Collection, User } from '../../../../../lib/models';
import connectDB from '../../../../../lib/connectDB';



// GET /api/templates/user - Get user's custom templates
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const userTemplates = await Collection.find({
      createdBy: user.id,
      $or: [
        { isTemplate: true },
        { 'templateData.isTemplate': true }
      ]
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      templates: userTemplates
    });
  } catch (error) {
    console.error('Error fetching user templates:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' }, 
      { status: 500 }
    );
  }
}

// POST /api/templates/user - Save collection as template
export async function POST(request) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { collectionId, name, description, isPublic = false } = await request.json();

    await connectDB();

    // Get the original collection
    const originalCollection = await Collection.findById(collectionId);
    if (!originalCollection || originalCollection.createdBy !== user.id) {
      return NextResponse.json({ error: 'Collection not found' }, { status: 404 });
    }

    // Create template
    const template = new Collection({
      name: name || `${originalCollection.name} Template`,
      description: description || originalCollection.description,
      createdBy: user.id,
      isPublic: isPublic,
      isTemplate: true,
      category: originalCollection.category,
      items: originalCollection.items || [],
      itemCount: originalCollection.items ? originalCollection.items.length : 0,
      templateData: {
        isTemplate: true,
        isPublicTemplate: isPublic,
        templateCategory: originalCollection.category,
        templateDescription: description || originalCollection.description,
        templateSource: originalCollection._id
      }
    });

    await template.save();

    return NextResponse.json({ template });
  } catch (error) {
    console.error('Error saving template:', error);
    return NextResponse.json(
      { error: 'Failed to save template' }, 
      { status: 500 }
    );
  }
}
