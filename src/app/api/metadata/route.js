import { NextResponse } from 'next/server';
import { fetchMetadata } from '../../../../lib/metadata';

// POST /api/metadata - Fetch metadata for a URL
export async function POST(request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      );
    }

    const metadata = await fetchMetadata(url);

    return NextResponse.json({
      title: metadata.title,
      description: metadata.description,
      faviconUrl: metadata.faviconUrl,
      ogImage: metadata.metadata?.ogImage,
      ogDescription: metadata.metadata?.ogDescription
    });

  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metadata' },
      { status: 500 }
    );
  }
}
