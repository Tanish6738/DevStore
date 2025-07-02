import { NextResponse } from 'next/server';
import { withAuth } from '../../../../../../lib/auth';
import connectDB from '../../../../../../lib/connectDB';
import { Product } from '../../../../../../lib/models';


// POST /api/products/[id]/toggle-public - Toggle product public/private status
export const POST = withAuth(async (request, { params }) => {
  try {
    const user = request.user;
    const { id } = await params;
    const { isPublic, submissionNotes } = await request.json();

    await connectDB();

    // Find the product
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Only the creator can toggle visibility (predefined products cannot be modified)
    if (product.isPredefined || product.addedBy.toString() !== user._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Update product visibility
    const updateData = {
      isPublic: isPublic,
    };

    // If making public, add submission notes and auto-approve immediately
    if (isPublic) {
      updateData['communityData.submissionNotes'] = submissionNotes || '';
      updateData['communityData.isApproved'] = true; // Auto-approve products immediately
      updateData['communityData.approvedAt'] = new Date();
      updateData['communityData.isHidden'] = false;
      updateData['communityData.reportCount'] = 0;
    } else {
      // When making private, reset community data
      updateData['communityData.isApproved'] = false;
      updateData['communityData.approvedAt'] = null;
      updateData['communityData.submissionNotes'] = '';
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('addedBy', 'displayName avatarUrl');

    return NextResponse.json({
      success: true,
      product: updatedProduct,
      message: isPublic ? 'Product published successfully' : 'Product made private'
    });

  } catch (error) {
    console.error('Error toggling product visibility:', error);
    return NextResponse.json(
      { error: 'Error updating product visibility' },
      { status: 500 }
    );
  }
});
