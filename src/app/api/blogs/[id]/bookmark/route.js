import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
// import { Blog, BlogBookmark, User } from '../../../../../../lib/models';
import connectDB from '../../../../../../lib/connectDB';
import { Blog, BlogBookmark, User } from '../../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../../lib/mongodb';



// POST /api/blogs/[id]/bookmark - Toggle bookmark on blog
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

    // Check if user already bookmarked this blog
    const existingBookmark = await BlogBookmark.findOne({
      blogId: blog._id,
      userId: user._id
    });

    if (existingBookmark) {
      // Remove bookmark
      await BlogBookmark.findByIdAndDelete(existingBookmark._id);

      return NextResponse.json({
        message: 'Bookmark removed successfully',
        isBookmarked: false
      });
    } else {
      // Add bookmark
      await BlogBookmark.create({
        blogId: blog._id,
        userId: user._id
      });

      return NextResponse.json({
        message: 'Blog bookmarked successfully',
        isBookmarked: true
      });
    }

  } catch (error) {
    console.error('Error toggling blog bookmark:', error);
    return NextResponse.json(
      { error: 'Failed to toggle bookmark' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/bookmark - Get bookmark status
export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    
    await connectDB();

    const { id } = await params;

    // Check if blog exists
    const blog = await Blog.findOne(buildIdOrSlugQuery(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    let isBookmarked = false;
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        const bookmark = await BlogBookmark.findOne({
          blogId: blog._id,
          userId: user._id
        });
        isBookmarked = !!bookmark;
      }
    }

    return NextResponse.json({
      isBookmarked
    });

  } catch (error) {
    console.error('Error getting blog bookmark status:', error);
    return NextResponse.json(
      { error: 'Failed to get bookmark status' },
      { status: 500 }
    );
  }
}
