import { NextResponse } from 'next/server';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { Product, ProductReport } from '../../../../../../lib/models';
// import connectDB from '../../../../../../../lib/connectDB';
// import { Product, ProductReport } from '../../../../../../../lib/models';



// POST /api/products/[id]/report - Report a product
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { reason, description } = await request.json();

    if (!reason || !description) {
      return NextResponse.json({ 
        error: 'Reason and description are required' 
      }, { status: 400 });
    }

    await connectDB();

    // Check if product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Check if user already reported this product
    const existingReport = await ProductReport.findOne({
      productId: id,
      reportedBy: user.id
    });

    if (existingReport) {
      return NextResponse.json({ 
        error: 'You have already reported this product' 
      }, { status: 400 });
    }

    // Create report
    const report = await ProductReport.create({
      productId: id,
      reportedBy: user.id,
      reason,
      description,
    });

    // Increment report count on product
    await Product.findByIdAndUpdate(id, {
      $inc: { 'communityData.reportCount': 1 }
    });

    return NextResponse.json({
      success: true,
      message: 'Product reported successfully',
      reportId: report._id
    });

  } catch (error) {
    console.error('Error reporting product:', error);
    return NextResponse.json(
      { error: 'Error reporting product' },
      { status: 500 }
    );
  }
}
