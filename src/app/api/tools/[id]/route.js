import { NextResponse } from 'next/server';

// This endpoint is deprecated and redirects to the new products API
// Kept for backward compatibility

export async function GET(request, { params }) {
  const { id } = await params;
  const url = new URL(request.url);
  
  // Redirect to products API with analytics enabled
  const productUrl = url.origin + `/api/products/${id}?analytics=true`;
  
  try {
    const response = await fetch(productUrl, {
      headers: {
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      }
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    // Transform the response to match the old tools API format
    const transformedResponse = {
      tool: {
        id: data._id,
        title: data.title,
        url: data.url,
        description: data.description,
        faviconUrl: data.faviconUrl,
        category: data.category,
        isPredefined: data.isPredefined,
        metadata: data.metadata,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      },
      statistics: data.analytics || {
        totalUsage: 0,
        publicUsage: 0,
        recentUsage: 0,
        totalAccess: 0,
        favoriteCount: 0
      },
      publicCollections: []
    };

    // Fetch detailed analytics if available
    try {
      const analyticsResponse = await fetch(url.origin + `/api/products/${id}/analytics`, {
        headers: {
          'Authorization': request.headers.get('Authorization') || '',
          'Cookie': request.headers.get('Cookie') || '',
        }
      });
      
      if (analyticsResponse.ok) {
        const analyticsData = await analyticsResponse.json();
        transformedResponse.statistics = analyticsData.statistics;
        transformedResponse.publicCollections = analyticsData.publicCollections || [];
      }
    } catch (err) {
      console.warn('Failed to fetch detailed analytics:', err);
    }

    return NextResponse.json(transformedResponse);
    
  } catch (error) {
    console.error('Error in tools API compatibility layer:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tool details' },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
  const { id } = await params;
  const url = new URL(request.url);
  
  // Redirect to products tracking API
  const trackUrl = url.origin + `/api/products/${id}/track`;
  
  try {
    const body = await request.json();
    
    const response = await fetch(trackUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': request.headers.get('Authorization') || '',
        'Cookie': request.headers.get('Cookie') || '',
      },
      body: JSON.stringify(body)
    });
    
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
    
  } catch (error) {
    console.error('Error in tools tracking API compatibility layer:', error);
    return NextResponse.json(
      { error: 'Failed to track access' },
      { status: 500 }
    );
  }
}
