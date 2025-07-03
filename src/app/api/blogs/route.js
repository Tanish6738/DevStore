import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/connectDB';
import { Blog, BlogCategory, User } from '../../../../lib/models';


// Helper function to generate slug from title
function generateSlug(title) {
  return title
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim('-');
}

// Helper function to calculate reading time
function calculateReadingTime(content) {
  const wordsPerMinute = 200;
  const wordCount = content.split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
}

// GET /api/blogs - Get user's blogs
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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build query
    let query = { author: user._id };

    if (status) {
      query.status = status;
    }

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { 'analytics.readCount': -1, createdAt: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1, ratingCount: -1 };
        break;
      case 'title':
        sortObj = { title: 1 };
        break;
      case 'oldest':
        sortObj = { createdAt: 1 };
        break;
      case 'newest':
      default:
        sortObj = { createdAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    // Get blogs with pagination
    const [blogs, totalBlogs] = await Promise.all([
      Blog.find(query)
        .populate('author', 'displayName avatarUrl')
        .populate('series', 'title slug')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query)
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);

    return NextResponse.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}

// POST /api/blogs - Create new blog
export async function POST(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const data = await request.json();
    const {
      title,
      excerpt,
      content,
      coverImage,
      category,
      tags,
      status,
      isPublic,
      isFeatured,
      seo,
      series,
      seriesOrder
    } = data;

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validation
    if (!title || !excerpt || !content) {
      return NextResponse.json(
        { error: 'Title, excerpt, and content are required' },
        { status: 400 }
      );
    }

    // Generate unique slug
    let baseSlug = generateSlug(title);
    let slug = baseSlug;
    let counter = 1;

    while (await Blog.findOne({ slug })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    // Calculate reading time
    const readTime = calculateReadingTime(content);

    // Create blog
    const blog = new Blog({
      title,
      slug,
      excerpt,
      content,
      coverImage: coverImage || '',
      author: user._id,
      category: category || 'general',
      tags: tags || [],
      status: status || 'draft',
      isPublic: isPublic || false,
      isFeatured: isFeatured || false,
      readTime,
      seo: seo || {},
      series,
      seriesOrder: seriesOrder || 0,
      publishedAt: status === 'published' ? new Date() : null
    });

    await blog.save();

    // Update category post count if published
    if (status === 'published') {
      await BlogCategory.findOneAndUpdate(
        { slug: category || 'general' },
        { $inc: { postCount: 1 } },
        { upsert: true }
      );
    }

    // Populate author data before returning
    await blog.populate('author', 'displayName avatarUrl');

    return NextResponse.json(blog, { status: 201 });

  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json(
      { error: 'Failed to create blog' },
      { status: 500 }
    );
  }
}
