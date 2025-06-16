import { Platform, SourceType, SubmitSource } from '../type';

export async function getRedditSource(url: string): Promise<SubmitSource> {
  return {
    name: `Reddit Subreddit: ${url.split('/')[4]}`,
    platform: Platform.Reddit,
    type: SourceType.Reddit,
    url: url,
  };
}

export function isRedditUrl(url: string): boolean {
  const regex = /^https:\/\/www\.reddit\.com\/r\/[a-zA-Z0-9_-]+\/?$/;
  return regex.test(url);
}
