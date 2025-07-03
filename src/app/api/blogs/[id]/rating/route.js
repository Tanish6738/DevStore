import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { Blog, BlogRating, User } from '../../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../../lib/mongodb';



// POST /api/blogs/[id]/rating - Rate a blog
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { rating, review } = await request.json();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    if (review && review.length > 500) {
      return NextResponse.json(
        { error: 'Review must be 500 characters or less' },
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

    // Check if user has already rated this blog
    const existingRating = await BlogRating.findOne({
      blogId: blog._id,
      userId: user._id
    });

    let newRating;
    let oldRatingValue = 0;
    let isUpdate = false;

    if (existingRating) {
      // Update existing rating
      oldRatingValue = existingRating.rating;
      existingRating.rating = rating;
      existingRating.review = review || '';
      await existingRating.save();
      newRating = existingRating;
      isUpdate = true;
    } else {
      // Create new rating
      newRating = await BlogRating.create({
        blogId: blog._id,
        userId: user._id,
        rating,
        review: review || ''
      });
    }

    // Recalculate blog's average rating
    const allRatings = await BlogRating.find({ blogId: blog._id });
    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update blog with new average rating
    await Blog.findByIdAndUpdate(blog._id, {
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal
      ratingCount: totalRatings
    });

    // Populate user data before returning
    await newRating.populate('userId', 'displayName avatarUrl');

    return NextResponse.json({
      rating: newRating,
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount: totalRatings,
      isUpdate
    }, { status: isUpdate ? 200 : 201 });

  } catch (error) {
    console.error('Error rating blog:', error);
    return NextResponse.json(
      { error: 'Failed to rate blog' },
      { status: 500 }
    );
  }
}

// GET /api/blogs/[id]/rating - Get user's rating for blog
export async function GET(request, { params }) {
  try {
    const { userId } = auth();
    
    await connectDB();

    const { id } = await params;

    // Get blog rating info
    const blog = await Blog.findOne(buildIdOrSlugQuery(id)).select('averageRating ratingCount');
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    let userRating = null;
    if (userId) {
      const user = await User.findOne({ clerkId: userId });
      if (user) {
        userRating = await BlogRating.findOne({
          blogId: blog._id,
          userId: user._id
        }).populate('userId', 'displayName avatarUrl');
      }
    }

    return NextResponse.json({
      averageRating: blog.averageRating,
      ratingCount: blog.ratingCount,
      userRating
    });

  } catch (error) {
    console.error('Error getting blog rating:', error);
    return NextResponse.json(
      { error: 'Failed to get rating' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id]/rating - Delete user's rating
export async function DELETE(request, { params }) {
  try {
    const { userId } = auth();
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

    // First find the blog to get its actual _id
    const blog = await Blog.findOne(buildIdOrSlugQuery(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Find and delete user's rating
    const deletedRating = await BlogRating.findOneAndDelete({
      blogId: blog._id,
      userId: user._id
    });

    if (!deletedRating) {
      return NextResponse.json({ error: 'Rating not found' }, { status: 404 });
    }

    // Recalculate blog's average rating
    const allRatings = await BlogRating.find({ blogId: blog._id });
    const totalRatings = allRatings.length;
    const sumRatings = allRatings.reduce((sum, r) => sum + r.rating, 0);
    const averageRating = totalRatings > 0 ? sumRatings / totalRatings : 0;

    // Update blog with new average rating
    await Blog.findByIdAndUpdate(blog._id, {
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount: totalRatings
    });

    return NextResponse.json({
      message: 'Rating deleted successfully',
      averageRating: Math.round(averageRating * 10) / 10,
      ratingCount: totalRatings
    });

  } catch (error) {
    console.error('Error deleting blog rating:', error);
    return NextResponse.json(
      { error: 'Failed to delete rating' },
      { status: 500 }
    );
  }
}
