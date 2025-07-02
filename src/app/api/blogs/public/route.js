import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';

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

    const db = await connectDB();
    
    // For now, we'll create a mock response since blogs collection might not exist yet
    // In a real implementation, you would have a Blog model and collection
    
    // Build query for public blog posts
    let query = { 
      isPublic: true,
      status: 'published'
    };

    // Add search filter
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    // Add category filter
    if (category) {
      query.category = category;
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { readCount: -1, publishedAt: -1 };
        break;
      case 'rating':
        sortObj = { averageRating: -1, publishedAt: -1 };
        break;
      case 'newest':
      default:
        sortObj = { publishedAt: -1, createdAt: -1 };
        break;
    }

    // Mock blog posts for demonstration
    // In a real app, replace this with actual database queries
    const mockBlogs = [
      {
        _id: '1',
        title: 'Getting Started with React Hooks',
        excerpt: 'Learn the fundamentals of React Hooks and how to use them effectively in your applications.',
        content: 'React Hooks provide a powerful way to use state and lifecycle methods in functional components...',
        author: { displayName: 'Jane Doe', avatarUrl: null },
        category: 'React',
        tags: ['react', 'hooks', 'frontend'],
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        readCount: 1250,
        averageRating: 4.5,
        isPublic: true,
        status: 'published',
        url: '/blog/getting-started-with-react-hooks'
      },
      {
        _id: '2',
        title: 'Building RESTful APIs with Node.js',
        excerpt: 'A comprehensive guide to creating robust RESTful APIs using Node.js and Express.',
        content: 'REST APIs are the backbone of modern web applications...',
        author: { displayName: 'John Smith', avatarUrl: null },
        category: 'Backend',
        tags: ['nodejs', 'api', 'backend'],
        publishedAt: new Date('2024-01-12'),
        createdAt: new Date('2024-01-08'),
        readCount: 980,
        averageRating: 4.2,
        isPublic: true,
        status: 'published',
        url: '/blog/building-restful-apis-with-nodejs'
      },
      {
        _id: '3',
        title: 'CSS Grid vs Flexbox: When to Use Each',
        excerpt: 'Understanding the differences between CSS Grid and Flexbox and when to use each layout method.',
        content: 'CSS Grid and Flexbox are both powerful layout systems...',
        author: { displayName: 'Sarah Wilson', avatarUrl: null },
        category: 'CSS',
        tags: ['css', 'grid', 'flexbox', 'layout'],
        publishedAt: new Date('2024-01-10'),
        createdAt: new Date('2024-01-05'),
        readCount: 1850,
        averageRating: 4.8,
        isPublic: true,
        status: 'published',
        url: '/blog/css-grid-vs-flexbox'
      }
    ];

    // Filter mock data based on search and category
    let filteredBlogs = mockBlogs;
    
    if (search) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.title.toLowerCase().includes(search.toLowerCase()) ||
        blog.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        blog.content.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filteredBlogs = filteredBlogs.filter(blog => 
        blog.category.toLowerCase() === category.toLowerCase()
      );
    }

    // Sort blogs
    filteredBlogs.sort((a, b) => {
      switch (sort) {
        case 'popular':
          return b.readCount - a.readCount;
        case 'rating':
          return b.averageRating - a.averageRating;
        case 'newest':
        default:
          return new Date(b.publishedAt) - new Date(a.publishedAt);
      }
    });

    // Apply pagination
    const totalCount = filteredBlogs.length;
    const startIndex = (page - 1) * limit;
    const paginatedBlogs = filteredBlogs.slice(startIndex, startIndex + limit);

    // Get unique categories
    const categories = [...new Set(mockBlogs.map(blog => blog.category))];

    return NextResponse.json({
      blogs: paginatedBlogs,
      categories,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit),
        hasNext: page < Math.ceil(totalCount / limit),
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching public blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog posts' },
      { status: 500 }
    );
  }
}
