import axios from 'axios';
import * as cheerio from 'cheerio';

import { Platform, SourceType, SubmitSource } from '../type';

export async function getFacebookSource(
  url: string,
): Promise<null | SubmitSource> {
  let name = '';

  try {
    const { data: html } = await axios.get(url);
    const $ = cheerio.load(html);

    name = $('head title').text().trim();
  } catch (error) {
    console.error('Error processing Facebook source:', error);
  }

  return {
    name: name,
    platform: Platform.Facebook,
    type: SourceType.Profile,
    url,
  };
}

export function isFacebookUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    // Check if the URL is from Facebook
    return hostname === 'www.facebook.com' || hostname === 'facebook.com';
  } catch {
    // Handle invalid URLs
    return false;
  }
}
