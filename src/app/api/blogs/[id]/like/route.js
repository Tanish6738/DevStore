import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import connectDB from '../../../../../../lib/connectDB';
// import { Blog, BlogLike, User } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';
import { Blog, BlogLike, User } from '../../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../../lib/mongodb';


// POST /api/blogs/[id]/like - Toggle like on blog
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
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

    // Check if user already liked this blog
    const existingLike = await BlogLike.findOne({
      blogId: blog._id,
      userId: user._id
    });

    if (existingLike) {
      // Unlike - remove the like
      await BlogLike.findByIdAndDelete(existingLike._id);
      await Blog.findByIdAndUpdate(blog._id, {
        $inc: { 'analytics.likeCount': -1 }
      });

      return NextResponse.json({
        message: 'Blog unliked successfully',
        isLiked: false,
        likeCount: blog.analytics.likeCount - 1
      });
    } else {
      // Like - create new like
      await BlogLike.create({
        blogId: blog._id,
        userId: user._id
      });

      await Blog.findByIdAndUpdate(blog._id, {
        $inc: { 'analytics.likeCount': 1 }
      });

      return NextResponse.json({
        message: 'Blog liked successfully',
        isLiked: true,
        likeCount: blog.analytics.likeCount + 1
      });
    }

  } catch (error) {
    console.error('Error toggling blog like:', error);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/like - Get like status
export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    
    await connectDB();

    const { id } = await params;

    // Get blog and like count
    const blog = await Blog.findOne(buildIdOrSlugQuery(id)).select('analytics.likeCount');
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    let isLiked = false;
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        const like = await BlogLike.findOne({
          blogId: blog._id,
          userId: user._id
        });
        isLiked = !!like;
      }
    }

    return NextResponse.json({
      isLiked,
      likeCount: blog.analytics.likeCount
    });

  } catch (error) {
    console.error('Error getting blog like status:', error);
    return NextResponse.json(
      { error: 'Failed to get like status' },
      { status: 500 }
    );
  }
}
