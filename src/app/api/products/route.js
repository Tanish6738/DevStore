import { NextResponse } from 'next/server';
import connectDB from '../../../../lib/connectDB';
import { withAuth } from '../../../../lib/auth';
import { Product } from '../../../../lib/models';
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
    const predefinedParam = searchParams.get('predefined');
    const isPredefined = predefinedParam === 'true' ? true : predefinedParam === 'false' ? false : null;
    const publicOnly = searchParams.get('public') === 'true';
    const userProducts = searchParams.get('userProducts') === 'true';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') === 'asc' ? 1 : -1;

    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (category) {
      query.category = category;
    }
    
    // Only add isPredefined filter if explicitly specified
    if (isPredefined !== null) {
      query.isPredefined = isPredefined;
    }

    // Handle user-specific products
    if (userProducts) {
      // Get user from auth if requesting user products
      try {
        const { userId } = await import('@clerk/nextjs/server').then(m => m.auth());
        if (userId) {
          const user = await import('../../../../lib/models').then(m => m.User.findOne({ clerkId: userId }));
          if (user) {
            query.addedBy = user._id;
          } else {
            // If no user found, return empty results
            return NextResponse.json({
              products: [],
              pagination: { page, limit, total: 0, pages: 0 },
            });
          }
        }
      } catch (authError) {
        console.warn('Auth error in GET products:', authError);
        // Continue without user filter
      }
    } else if (publicOnly) {
      // Show only public community products (non-predefined)
      query.isPublic = true;
      query.isPredefined = false;
      query['communityData.isHidden'] = false;
    } else if (isPredefined === true) {
      // Show only predefined products
      query.isPredefined = true;
    } else if (isPredefined === false) {
      // Show only user-created products (both public and private for the user)
      query.isPredefined = false;
    } else if (isPredefined === null) {
      // Default: show both predefined AND public user-created products
      query.$or = [
        { isPredefined: true },
        { 
          isPredefined: false,
          isPublic: true, 
          'communityData.isHidden': false
        }
      ];
    }

    console.log('Debug - userProducts:', userProducts);
    console.log('Debug - publicOnly:', publicOnly);
    console.log('Debug - isPredefined:', isPredefined);
    console.log('Debug - predefinedParam:', predefinedParam);

    // Handle search with existing query structure
    if (search) {
      // Use case-insensitive regex search for better matching
      const searchRegex = new RegExp(search, 'i');
      const searchConditions = [
        { title: searchRegex },
        { description: searchRegex },
        { url: searchRegex },
        { category: searchRegex },
        { 'metadata.tags': { $in: [searchRegex] } }
      ];
      
      // If there's already an $or condition (for predefined/public logic), combine them
      if (query.$or) {
        // Combine existing $or with search conditions using $and
        const existingOr = query.$or;
        delete query.$or;
        query.$and = [
          { $or: existingOr },
          { $or: searchConditions }
        ];
      } else {
        query.$or = searchConditions;
      }
    }

    // Build sort object
    const sortObj = {};
    if (search) {
      // When searching, prioritize title matches first
      sortObj.title = 1;
    } else {
      sortObj[sortBy] = sortOrder;
    }

    console.log('Products query:', JSON.stringify(query, null, 2));
    console.log('Sort:', sortObj);

    // Execute query
    const products = await Product.find(query)
      .populate('addedBy', 'displayName avatarUrl')
      .sort(sortObj)
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
      { error: 'Error fetching products: ' + error.message },
      { status: 500 }
    );
  }
}

// Create a new product
export const POST = withAuth(async (request) => {
  try {
    await connectDB();
    const user = request.user;
    const data = await request.json();

    console.log('Creating product for user:', user._id, 'with data:', data);

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
      try {
        const fetchedMetadata = await fetchMetadata(normalizedUrl);
        productTitle = title || fetchedMetadata.title;
        productDescription = description || fetchedMetadata.description;
        faviconUrl = fetchedMetadata.faviconUrl;
        metadata = fetchedMetadata.metadata;
      } catch (metadataError) {
        console.warn('Failed to fetch metadata:', metadataError);
        // Continue without metadata
      }
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
      // isPublic defaults to false - users can choose to make public later
      addedBy: user._id,
      metadata,
      // Auto-approve community products (no approval queue)
      communityData: {
        isApproved: true,
        approvedAt: new Date(),
        isHidden: false,
        reportCount: 0
      }
    });

    await product.save();
    await product.populate('addedBy', 'displayName avatarUrl');

    console.log('Product created successfully:', product._id);

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Error creating product: ' + error.message },
      { status: 500 }
    );
  }
});
