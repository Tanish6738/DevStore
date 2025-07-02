import { NextResponse } from 'next/server';
// import connectDB from '../../../../../../lib/connectDB';
// import { Product, CollectionItem } from '../../../../../../lib/models';
import { currentUser } from '@clerk/nextjs/server';
import connectDB from '../../../../../../lib/connectDB';
import { CollectionItem, Product } from '../../../../../../lib/models';


// POST /api/products/[id]/track - Track product access (when user clicks on product)
export async function POST(request, { params }) {
  try {
    const user = await currentUser();
    await connectDB();

    const { id } = await params;
    const body = await request.json();
    const { collectionItemId, source = 'direct' } = body;

    // Verify product exists
    const product = await Product.findById(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // If collectionItemId is provided, update its access count
    if (collectionItemId) {
      await CollectionItem.findByIdAndUpdate(
        collectionItemId,
        {
          $inc: { accessCount: 1 },
          lastAccessed: new Date()
        }
      );
    }

    // Log access for analytics (optional: store in separate analytics collection)
    // This could be expanded to track more detailed analytics like:
    // - User agent, referrer, geographic location, etc.
    
    return NextResponse.json({
      success: true,
      message: 'Access tracked',
      productUrl: product.url
    });

  } catch (error) {
    console.error('Error tracking product access:', error);
    return NextResponse.json(
      { error: 'Failed to track access' },
      { status: 500 }
    );
  }
}
