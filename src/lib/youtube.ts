import { Platform, SourceType, SubmitSource } from '../type.js';

export function isYoutubeUrl(url: string): boolean {
  const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.?be)\/.+$/;
  return youtubeRegex.test(url);
}

export const youtubeChannelUrlPattern =
  /^https?:\/{1,2}(?:www\.)?youtube\.com\/@[\w\-.]{3,}$/;

export function extractYoutubeHandle(html: string): null | string {
  const handleRegex =
    /"ownerProfileUrl":"(?:https?:\/\/)?(?:www\.)?youtube\.com\/@([\w-]+)"/;
  const match = html.match(handleRegex);
  const handle = match ? match[1] : null;
  return handle;
}

export async function getYoutubeHandleFromUrl(
  url: string,
): Promise<null | string> {
  const res = await fetch(url);
  const html = await res.text();
  return extractYoutubeHandle(html);
}

export async function getYoutubeSource(
  url: string,
): Promise<null | SubmitSource> {
  if (!isValidYouTubeChannelUrl(url)) {
    const handle = await getYoutubeHandleFromUrl(url);
    if (handle) {
      url = `https://www.youtube.com/@${handle}`;
    } else {
      return null;
    }
  }
  const res = await fetch(url);
  const html = await res.text();
  const channelIdRegex =
    /<link rel="canonical" href="https:\/\/www\.youtube\.com\/channel\/(.*?)"/;
  const match = html.match(channelIdRegex);
  const channelId = match ? match[1] : null;

  if (channelId === null) {
    return null;
  }

  // Extract title
  const titleRegex = /<title>(.*?)<\/title>/;
  const titleMatch = html.match(titleRegex);
  const title = titleMatch ? titleMatch[1] : null;

  return {
    name: title ?? '',
    platform: Platform.Youtube,
    type: SourceType.Rss,
    url: `https://www.youtube.com/feeds/videos.xml?channel_id=${channelId}`,
  };
}

export function isValidYouTubeChannelUrl(url: string): boolean {
  return youtubeChannelUrlPattern.test(url);
}
