import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { Blog, BlogComment, BlogCommentLike, User } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';
import { Blog, BlogComment, BlogCommentLike, User } from '../../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../../lib/mongodb';



// GET /api/blogs/[id]/comments - Get blog comments
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 20;
    const page = parseInt(searchParams.get('page')) || 1;
    const sort = searchParams.get('sort') || 'newest';

    // Check if blog exists and is public
    const blog = await Blog.findOne({
      ...buildIdOrSlugQuery(id),
      isPublic: true,
      status: 'published'
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Build sort object
    let sortObj = {};
    switch (sort) {
      case 'popular':
        sortObj = { likeCount: -1, createdAt: -1 };
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

    // Get top-level comments (no parent)
    const [comments, totalComments] = await Promise.all([
      BlogComment.find({
        blogId: blog._id,
        parentComment: null,
        isHidden: false
      })
        .populate('author', 'displayName avatarUrl')
        .populate({
          path: 'replies',
          populate: {
            path: 'author',
            select: 'displayName avatarUrl'
          },
          match: { isHidden: false },
          options: { sort: { createdAt: 1 } }
        })
        .sort(sortObj)
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogComment.countDocuments({
        blogId: blog._id,
        parentComment: null,
        isHidden: false
      })
    ]);

    const totalPages = Math.ceil(totalComments / limit);

    return NextResponse.json({
      comments,
      pagination: {
        currentPage: page,
        totalPages,
        totalComments,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching blog comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/blogs/[id]/comments - Create new comment
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { content, parentComment } = await request.json();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validation
    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    if (content.length > 1000) {
      return NextResponse.json(
        { error: 'Comment must be 1000 characters or less' },
        { status: 400 }
      );
    }

    // Check if blog exists and is public
    const blog = await Blog.findOne({
      ...buildIdOrSlugQuery(id),
      isPublic: true,
      status: 'published'
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // If replying to a comment, check if parent exists
    if (parentComment) {
      const parentCommentDoc = await BlogComment.findOne({
        _id: parentComment,
        blogId: blog._id,
        isHidden: false
      });

      if (!parentCommentDoc) {
        return NextResponse.json(
          { error: 'Parent comment not found' },
          { status: 404 }
        );
      }
    }

    // Create comment
    const comment = new BlogComment({
      blogId: blog._id,
      author: user._id,
      content: content.trim(),
      parentComment: parentComment || null
    });

    await comment.save();

    // Update blog comment count
    await Blog.findByIdAndUpdate(blog._id, {
      $inc: { 'analytics.commentCount': 1 }
    });

    // If this is a reply, add it to parent's replies array
    if (parentComment) {
      await BlogComment.findByIdAndUpdate(parentComment, {
        $push: { replies: comment._id }
      });
    }

    // Populate author data before returning
    await comment.populate('author', 'displayName avatarUrl');

    return NextResponse.json(comment, { status: 201 });

  } catch (error) {
    console.error('Error creating blog comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
