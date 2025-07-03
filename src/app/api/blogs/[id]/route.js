import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import connectDB from '../../../../../lib/connectDB';
import { Blog, BlogBookmark, BlogCategory, BlogComment, BlogCommentLike, BlogLike, BlogRating, User } from '../../../../../lib/models';
import { buildIdOrSlugQuery } from '../../../../../lib/mongodb';




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

// GET /api/blogs/[id] - Get single blog
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = await params;
    const { userId } = await auth();

    // Find blog by ID or slug using helper function
    let blog = await Blog.findOne(buildIdOrSlugQuery(id))
      .populate('author', 'displayName avatarUrl')
      .populate('series', 'title slug description')
      .populate('relatedPosts', 'title slug excerpt coverImage publishedAt analytics.readCount')
      .lean();

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    // Check if user has permission to view this blog
    let currentUser = null;
    if (userId) {
      currentUser = await User.findOne({ clerkId: userId });
    }

    // If blog is not public and user is not the author, deny access
    if (!blog.isPublic && blog.status !== 'published') {
      if (!currentUser || blog.author._id.toString() !== currentUser._id.toString()) {
        return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
      }
    }

    // Increment view count if this is a public view
    if (blog.isPublic && blog.status === 'published') {
      await Blog.findByIdAndUpdate(blog._id, {
        $inc: { 
          'analytics.readCount': 1,
          'analytics.uniqueReaders': currentUser ? 1 : 0
        }
      });
      blog.analytics.readCount += 1;
    }

    // Get user-specific data if authenticated
    let userInteractions = {};
    if (currentUser) {
      const [isLiked, isBookmarked, userRating] = await Promise.all([
        BlogLike.findOne({ blogId: blog._id, userId: currentUser._id }),
        BlogBookmark.findOne({ blogId: blog._id, userId: currentUser._id }),
        BlogRating.findOne({ blogId: blog._id, userId: currentUser._id })
      ]);

      userInteractions = {
        isLiked: !!isLiked,
        isBookmarked: !!isBookmarked,
        userRating: userRating?.rating || null
      };
    }

    return NextResponse.json({
      ...blog,
      userInteractions
    });

  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blog' },
      { status: 500 }
    );
  }
}

// PUT /api/blogs/[id] - Update blog
export async function PUT(request, { params }) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
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

    // Find blog and check ownership
    const blog = await Blog.findOne(buildIdOrSlugQuery(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (blog.author.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Store previous status for analytics
    const previousStatus = blog.status;
    const previousCategory = blog.category;

    // Update slug if title changed
    let slug = blog.slug;
    if (title && title !== blog.title) {
      let baseSlug = generateSlug(title);
      slug = baseSlug;
      let counter = 1;

      while (await Blog.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter}`;
        counter++;
      }
    }

    // Calculate reading time if content changed
    let readTime = blog.readTime;
    if (content && content !== blog.content) {
      readTime = calculateReadingTime(content);
    }

    // Update blog
    const updateData = {
      ...(title && { title }),
      ...(title && { slug }),
      ...(excerpt && { excerpt }),
      ...(content && { content, readTime }),
      ...(coverImage !== undefined && { coverImage }),
      ...(category && { category }),
      ...(tags && { tags }),
      ...(status && { status }),
      ...(isPublic !== undefined && { isPublic }),
      ...(isFeatured !== undefined && { isFeatured }),
      ...(seo && { seo }),
      ...(series !== undefined && { series }),
      ...(seriesOrder !== undefined && { seriesOrder })
    };

    // Set publishedAt if changing to published status
    if (status === 'published' && previousStatus !== 'published') {
      updateData.publishedAt = new Date();
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('author', 'displayName avatarUrl');

    // Update category post counts if category or status changed
    if (status === 'published' && previousStatus !== 'published') {
      await BlogCategory.findOneAndUpdate(
        { slug: category || blog.category },
        { $inc: { postCount: 1 } },
        { upsert: true }
      );
    } else if (status !== 'published' && previousStatus === 'published') {
      await BlogCategory.findOneAndUpdate(
        { slug: previousCategory },
        { $inc: { postCount: -1 } }
      );
    } else if (status === 'published' && category && category !== previousCategory) {
      await Promise.all([
        BlogCategory.findOneAndUpdate(
          { slug: previousCategory },
          { $inc: { postCount: -1 } }
        ),
        BlogCategory.findOneAndUpdate(
          { slug: category },
          { $inc: { postCount: 1 } },
          { upsert: true }
        )
      ]);
    }

    return NextResponse.json(updatedBlog);

  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json(
      { error: 'Failed to update blog' },
      { status: 500 }
    );
  }
}

// DELETE /api/blogs/[id] - Delete blog
export async function DELETE(request, { params }) {
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

    // Find blog and check ownership
    const blog = await Blog.findOne(buildIdOrSlugQuery(id));
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    if (blog.author.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Delete related data
    await Promise.all([
      BlogComment.deleteMany({ blogId: blog._id }),
      BlogLike.deleteMany({ blogId: blog._id }),
      BlogBookmark.deleteMany({ blogId: blog._id }),
      BlogRating.deleteMany({ blogId: blog._id })
    ]);

    // Update category post count if blog was published
    if (blog.status === 'published') {
      await BlogCategory.findOneAndUpdate(
        { slug: blog.category },
        { $inc: { postCount: -1 } }
      );
    }

    // Delete the blog
    await Blog.findByIdAndDelete(blog._id);

    return NextResponse.json({ message: 'Blog deleted successfully' });

  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json(
      { error: 'Failed to delete blog' },
      { status: 500 }
    );
  }
}
