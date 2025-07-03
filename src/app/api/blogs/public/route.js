import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { Blog, BlogCategory, User } from '../../../../../lib/models';

// GET /api/blogs/public - Get all public blog posts
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;
    const page = parseInt(searchParams.get('page')) || 1;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';
    const featured = searchParams.get('featured') === 'true';

    // Build query for public blog posts
    let query = { 
      isPublic: true,
      status: 'published',
      'moderation.isApproved': true,
      'moderation.isHidden': false
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Add featured filter
    if (featured) {
      query.isFeatured = true;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { 'analytics.readCount': -1, publishedAt: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1, ratingCount: -1, publishedAt: -1 };
        break;
      case 'trending':
        // Sort by recent reads and likes (simplified trending algorithm)
        sortObj = { 
          'analytics.likeCount': -1,
          'analytics.readCount': -1,
          publishedAt: -1 
        };
        break;
      case 'oldest':
        sortObj = { publishedAt: 1 };
        break;
      case 'newest':
      default:
        sortObj = { publishedAt: -1 };
        break;
    }

    const skip = (page - 1) * limit;

    // Get blogs and categories in parallel
    const [blogs, totalBlogs, categories] = await Promise.all([
      Blog.find(query)
        .populate('author', 'displayName avatarUrl')
        .populate('series', 'title slug')
        .select('title slug excerpt coverImage category tags publishedAt readTime analytics averageRating ratingCount author series isFeatured')
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      Blog.countDocuments(query),
      BlogCategory.find({ isActive: true, postCount: { $gt: 0 } })
        .select('name slug color postCount')
        .sort({ order: 1, name: 1 })
        .lean()
    ]);

    const totalPages = Math.ceil(totalBlogs / limit);

    return NextResponse.json({
      blogs: blogs.map(blog => ({
        _id: blog._id,
        title: blog.title,
        slug: blog.slug,
        excerpt: blog.excerpt,
        coverImage: blog.coverImage,
        category: blog.category,
        tags: blog.tags,
        publishedAt: blog.publishedAt,
        readTime: blog.readTime,
        analytics: blog.analytics,
        averageRating: blog.averageRating,
        ratingCount: blog.ratingCount,
        isFeatured: blog.isFeatured,
        author: blog.author,
        series: blog.series
      })),
      categories,
      pagination: {
        currentPage: page,
        totalPages,
        totalBlogs,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}
