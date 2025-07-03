import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/connectDB';
import { Blog, BlogSeries, User } from '../../../../lib/models';



// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// GET /api/blog-series - Get user's blog series
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const page = parseInt(searchParams.get('page')) || 1;
    const isPublic = searchParams.get('public') === 'true';

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    let query = { author: user._id };
    if (isPublic !== undefined) {
      query.isPublic = isPublic;
    }

    const skip = (page - 1) * limit;

    // Get series with pagination
    const [series, totalSeries] = await Promise.all([
      BlogSeries.find(query)
        .populate('author', 'displayName avatarUrl')
        .populate({
          path: 'posts.postId',
          select: 'title slug status publishedAt'
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogSeries.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalSeries / limit);

    return NextResponse.json({
      series,
      pagination: {
        currentPage: page,
        totalPages,
        totalSeries,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching blog series:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog series' },
      { status: 500 }
    );
  }
}

// POST /api/blog-series - Create new blog series
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const { title, description, coverImage, isPublic } = data;

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validation
    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await BlogSeries.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Create series
    const series = new BlogSeries({
      title,
      slug,
      description,
      coverImage: coverImage || '',
      author: user._id,
      isPublic: isPublic || false
    });

    await series.save();

    // Populate author data before returning
    await series.populate('author', 'displayName avatarUrl');

    return NextResponse.json(series, { status: 201 });

  } catch (error) {
    console.error('Error creating blog series:', error);
    return NextResponse.json(
      { error: 'Failed to create blog series' },
      { status: 500 }
    );
  }
}
