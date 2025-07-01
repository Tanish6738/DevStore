import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { ProductTag, Tag } from '../../../../lib/models';
import { withAuth } from '../../../../lib/auth';


// Get all tags
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }

    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const tags = await Tag.find(query).sort({ name: 1 });

    // Get usage count for each tag
    const tagsWithCounts = await Promise.all(
      tags.map(async (tag) => {
        const usageCount = await ProductTag.countDocuments({
          tagId: tag._id,
        });
        return {
          ...tag.toObject(),
          usageCount,
        };
      })
    );

    return NextResponse.json({ tags: tagsWithCounts });
  } catch (error) {
    console.error('Error fetching tags:', error);
    return NextResponse.json(
      { error: 'Error fetching tags' },
      { status: 500 }
    );
  }
}

// Create a new tag
export const POST = withAuth(async (request) => {
  try {
    const data = await request.json();
    const { name, color, category } = data;

    if (!name || name.trim() === '') {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 }
      );
    }

    // Check if tag already exists
    const existingTag = await Tag.findOne({ 
      name: { $regex: `^${name.trim()}$`, $options: 'i' } 
    });

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag already exists' },
        { status: 409 }
      );
    }

    const tag = new Tag({
      name: name.trim().toLowerCase(),
      color: color || '#3B82F6',
      category: category || 'general',
    });

    await tag.save();

    return NextResponse.json({
      ...tag.toObject(),
      usageCount: 0,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating tag:', error);
    return NextResponse.json(
      { error: 'Error creating tag' },
      { status: 500 }
    );
  }
});
