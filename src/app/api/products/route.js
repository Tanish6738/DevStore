import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { Product } from '../../../../lib/models';
import { withAuth } from '../../../../lib/auth';
import { fetchMetadata, isValidUrl, normalizeUrl } from '../../../../lib/metadata';

// Get all products (with pagination and filters)
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const isPredefined = searchParams.get('predefined') === 'true';

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    if (isPredefined !== undefined) {
      query.isPredefined = isPredefined;
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query
    const products = await Product.find(query)
      .populate('addedBy', 'displayName avatarUrl')
      .sort(search ? { score: { $meta: 'textScore' } } : { createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Product.countDocuments(query);

    return NextResponse.json({
      products,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    );
  }
}

// Create a new product
export const POST = withAuth(async (request) => {
  try {
    const user = request.user;
    const data = await request.json();

    const { url, title, description, category, tags } = data;

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL' },
        { status: 400 }
      );
    }

    const normalizedUrl = normalizeUrl(url);

    // Check if product already exists
    const existingProduct = await Product.findOne({ url: normalizedUrl });
    if (existingProduct) {
      return NextResponse.json(
        { error: 'Product with this URL already exists' },
        { status: 409 }
      );
    }

    // Fetch metadata if title is not provided
    let metadata = {};
    let productTitle = title;
    let productDescription = description;
    let faviconUrl = '';

    if (!title || !description) {
      const fetchedMetadata = await fetchMetadata(normalizedUrl);
      productTitle = title || fetchedMetadata.title;
      productDescription = description || fetchedMetadata.description;
      faviconUrl = fetchedMetadata.faviconUrl;
      metadata = fetchedMetadata.metadata;
    }

    // Add tags if provided
    if (tags && Array.isArray(tags)) {
      metadata.tags = [...(metadata.tags || []), ...tags];
    }

    const product = new Product({
      title: productTitle,
      url: normalizedUrl,
      description: productDescription,
      faviconUrl,
      category: category || 'general',
      isPredefined: false,
      addedBy: user._id,
      metadata,
    });

    await product.save();
    await product.populate('addedBy', 'displayName avatarUrl');

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    );
  }
});
