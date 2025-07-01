import { NextResponse } from 'next/server';
import { fetchMetadata, isValidUrl } from '../../../../../lib/metadata';


export async function POST(request) {
  try {
    const { url } = await request.json();

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

    const metadata = await fetchMetadata(url);

    return NextResponse.json(metadata);
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return NextResponse.json(
      { error: 'Error fetching metadata' },
      { status: 500 }
    );
  }
}
