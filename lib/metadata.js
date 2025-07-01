import * as cheerio from 'cheerio';

/**
 * Fetches metadata from a URL including title, description, favicon, and Open Graph data
 * @param {string} url - The URL to fetch metadata from
 * @returns {Promise<Object>} - Object containing metadata
 */
export async function fetchMetadata(url) {
  try {
    // Ensure URL has protocol
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      },
      timeout: 10000, // 10 second timeout
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Extract metadata
    const title = $('title').text().trim() || 
                  $('meta[property="og:title"]').attr('content') || 
                  $('meta[name="twitter:title"]').attr('content') || 
                  url;

    const description = $('meta[name="description"]').attr('content') || 
                       $('meta[property="og:description"]').attr('content') || 
                       $('meta[name="twitter:description"]').attr('content') || 
                       '';

    const ogImage = $('meta[property="og:image"]').attr('content') || 
                   $('meta[name="twitter:image"]').attr('content') || 
                   '';

    // Extract favicon
    let faviconUrl = '';
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    for (const selector of faviconSelectors) {
      const favicon = $(selector).attr('href');
      if (favicon) {
        faviconUrl = favicon.startsWith('http') ? favicon : new URL(favicon, url).href;
        break;
      }
    }

    // If no favicon found, try default location
    if (!faviconUrl) {
      const urlObj = new URL(url);
      faviconUrl = `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`;
    }

    // Extract keywords as tags
    const keywords = $('meta[name="keywords"]').attr('content');
    const tags = keywords ? keywords.split(',').map(tag => tag.trim()).filter(Boolean) : [];

    return {
      title: title.substring(0, 200), // Limit title length
      description: description.substring(0, 500), // Limit description length
      faviconUrl,
      metadata: {
        ogImage,
        ogDescription: description,
        tags,
      },
    };
  } catch (error) {
    console.error('Error fetching metadata:', error);
    
    // Return basic metadata if fetch fails
    const urlObj = new URL(url);
    return {
      title: urlObj.hostname,
      description: '',
      faviconUrl: `${urlObj.protocol}//${urlObj.hostname}/favicon.ico`,
      metadata: {
        ogImage: '',
        ogDescription: '',
        tags: [],
      },
    };
  }
}

/**
 * Validates if a URL is valid
 * @param {string} url - The URL to validate
 * @returns {boolean} - True if valid, false otherwise
 */
export function isValidUrl(url) {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalizes a URL by adding protocol if missing
 * @param {string} url - The URL to normalize
 * @returns {string} - Normalized URL
 */
export function normalizeUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    return 'https://' + url;
  }
  return url;
}
