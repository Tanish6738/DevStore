import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../../lib/connectDB';
import { BlogCategory } from '../../../../../lib/models';



// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// GET /api/blogs/categories - Get all blog categories
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeEmpty = searchParams.get('includeEmpty') === 'true';

    // Build query
    let query = { isActive: true };
    if (!includeEmpty) {
      query.postCount = { $gt: 0 };
    }

    const categories = await BlogCategory.find(query)
      .sort({ order: 1, name: 1 })
      .lean();

    return NextResponse.json(categories);

  } catch (error) {
    console.error('Error fetching blog categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

// POST /api/blogs/categories - Create new category (admin only)
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Note: Add admin check here based on your admin system
    // For now, any authenticated user can create categories

    await connectDB();

    const { name, description, color, icon, order } = await request.json();

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(name);
    let slug = baseSlug;
    let counter = 1;

    while (await BlogCategory.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create category
    const category = new BlogCategory({
      name: name.trim(),
      slug,
      description: description || '',
      color: color || '#3B82F6',
      icon: icon || '',
      order: order || 0
    });

    await category.save();

    return NextResponse.json(category, { status: 201 });

  } catch (error) {
    console.error('Error creating blog category:', error);
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    );
  }
}
