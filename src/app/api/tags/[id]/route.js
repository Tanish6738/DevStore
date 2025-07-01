import { NextResponse } from 'next/server';
import connectDB from '../../../../../lib/connectDB';
import { ProductTag, Tag } from '../../../../../lib/models';
import { withAuth } from '../../../../../lib/auth';

// Get a specific tag
export async function GET(request, { params }) {
  try {
    await connectDB();

    const { id } = params;
    const tag = await Tag.findById(id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Get usage count
    const usageCount = await ProductTag.countDocuments({ tagId: id });

    return NextResponse.json({
      ...tag.toObject(),
      usageCount,
    });
  } catch (error) {
    console.error('Error fetching tag:', error);
    return NextResponse.json(
      { error: 'Error fetching tag' },
      { status: 500 }
    );
  }
}

// Update a tag
export const PUT = withAuth(async (request, { params }) => {
  try {
    const { id } = params;
    const data = await request.json();

    const tag = await Tag.findById(id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    const allowedFields = ['name', 'color', 'category'];
    const updateData = {};

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        if (field === 'name') {
          updateData[field] = data[field].trim().toLowerCase();
        } else {
          updateData[field] = data[field];
        }
      }
    }

    const updatedTag = await Tag.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    // Get usage count
    const usageCount = await ProductTag.countDocuments({ tagId: id });

    return NextResponse.json({
      ...updatedTag.toObject(),
      usageCount,
    });
  } catch (error) {
    console.error('Error updating tag:', error);
    return NextResponse.json(
      { error: 'Error updating tag' },
      { status: 500 }
    );
  }
});

// Delete a tag
export const DELETE = withAuth(async (request, { params }) => {
  try {
    const { id } = params;

    const tag = await Tag.findById(id);

    if (!tag) {
      return NextResponse.json(
        { error: 'Tag not found' },
        { status: 404 }
      );
    }

    // Remove all product-tag associations
    await ProductTag.deleteMany({ tagId: id });

    // Delete the tag
    await Tag.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Tag deleted successfully' });
  } catch (error) {
    console.error('Error deleting tag:', error);
    return NextResponse.json(
      { error: 'Error deleting tag' },
      { status: 500 }
    );
  }
});
