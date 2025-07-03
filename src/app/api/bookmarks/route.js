import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../lib/connectDB';
import { Blog, BlogBookmark, User } from '../../../../lib/models';



// GET /api/bookmarks - Get user's bookmarked blogs
export async function GET(request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 12;
    const page = parseInt(searchParams.get('page')) || 1;

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const skip = (page - 1) * limit;

    // Get bookmarked blogs
    const [bookmarks, totalBookmarks] = await Promise.all([
      BlogBookmark.find({ userId: user._id })
        .populate({
          path: 'blogId',
          populate: {
            path: 'author',
            select: 'displayName avatarUrl'
          },
          match: { 
            isPublic: true, 
            status: 'published' 
          }
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      BlogBookmark.countDocuments({ userId: user._id })
    ]);

    // Filter out bookmarks where blog was deleted or made private
    const validBookmarks = bookmarks.filter(bookmark => bookmark.blogId);
    const blogs = validBookmarks.map(bookmark => bookmark.blogId);

    const totalPages = Math.ceil(totalBookmarks / limit);

    return NextResponse.json({
      blogs,
      pagination: {
        currentPage: page,
        totalPages,
        totalBookmarks,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching bookmarks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch bookmarks' },
      { status: 500 }
    );
  }
}
