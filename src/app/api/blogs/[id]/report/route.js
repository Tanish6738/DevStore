import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { Blog, BlogReport, User } from '../../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../../lib/mongodb';




// POST /api/blogs/[id]/report - Report a blog post
export async function POST(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const { reason, description } = await request.json();

    // Find user by clerkId
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Validation
    const validReasons = ['spam', 'inappropriate', 'copyright', 'misinformation', 'harassment', 'other'];
    if (!reason || !validReasons.includes(reason)) {
      return NextResponse.json(
        { error: 'Valid reason is required' },
        { status: 400 }
      );
    }

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { error: 'Description is required' },
        { status: 400 }
      );
    }

    // Check if blog exists
    const blog = await Blog.findOne({
      ...buildIdOrSlugQuery(id),
      isPublic: true,
      status: 'published'
    });

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check if user has already reported this blog
    const existingReport = await BlogReport.findOne({
      blogId: blog._id,
      reportedBy: user._id
    });

    if (existingReport) {
      return NextResponse.json(
        { error: 'You have already reported this blog post' },
        { status: 400 }
      );
    }

    // Create report
    const report = new BlogReport({
      blogId: blog._id,
      reportedBy: user._id,
      reason,
      description: description.trim()
    });

    await report.save();

    // Update blog report count
    await Blog.findByIdAndUpdate(blog._id, {
      $inc: { 'moderation.reportCount': 1 }
    });

    return NextResponse.json({
      message: 'Report submitted successfully. Thank you for helping keep our community safe.',
      reportId: report._id
    }, { status: 201 });

  } catch (error) {
    console.error('Error reporting blog:', error);
    return NextResponse.json(
      { error: 'Failed to submit report' },
      { status: 500 }
    );
  }
}
