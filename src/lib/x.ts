import * as cheerio from 'cheerio';

import { Platform, SourceType, SubmitSource } from '../type.js';

export function getXAuthorFromUrl(url: string): null | string {
  if (!isXorTwitterUrl(url)) {
    return null;
  }
  try {
    const parsedUrl = new URL(url);
    const pathname = parsedUrl.pathname;

    // Extract the author handle from the URL path
    const match = pathname.match(/^\/([^/]+)/);
    return match ? match[1] : null;
  } catch {
    // Handle invalid URLs
    return null;
  }
}

export async function getXSource(url: string): Promise<null | SubmitSource> {
  const author = getXAuthorFromUrl(url);
  if (!author) {
    return null;
  }

  let name = author;

  try {
    const html = await fetch(`https://www.twitterviewer.com/${author}`).then(
      res => res.text(),
    );
    const $ = cheerio.load(html);
    name = $('h1').text().trim() || author;
  } catch (error) {
    console.error('Error processing X source:', error);
  }

  return {
    name: name,
    platform: Platform.X,
    type: SourceType.Profile,
    url: `https://x.com/${author}`,
  };
}

export function isXorTwitterUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check if the URL is from X (formerly Twitter)
    return hostname === 'x.com' || hostname === 'twitter.com';
  } catch {
    // Handle invalid URLs
    return false;
  }
}
