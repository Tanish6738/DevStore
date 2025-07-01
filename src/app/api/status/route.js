import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { Collection, Product, User } from '../../../../lib/models';


export async function GET() {
  try {
    await connectDB();
    
    // Get database statistics
    const stats = {
      users: await User.countDocuments(),
      products: await Product.countDocuments(),
      predefinedProducts: await Product.countDocuments({ isPredefined: true }),
      userProducts: await Product.countDocuments({ isPredefined: false }),
      collections: await Collection.countDocuments(),
      publicCollections: await Collection.countDocuments({ isPublic: true }),
    };

    return NextResponse.json({
      status: 'connected',
      database: 'MongoDB',
      stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
