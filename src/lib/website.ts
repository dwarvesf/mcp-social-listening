import { Platform, SourceType, SubmitSource } from '../type';

export async function getWebsiteSource(
  url: string,
): Promise<null | SubmitSource> {
  const websiteTitle = await fetch(url)
    .then(response => response.text())
    .then(html => {
      const titleMatch = html.match(/<title>(.*?)<\/title>/);
      return titleMatch ? titleMatch[1] : null;
    })
    .catch(() => null);

  return {
    name: websiteTitle ?? '',
    platform: Platform.Website,
    type: SourceType.Newsletter,
    url: url,
  };
}

export function isWebsiteUrl(url: string): boolean {
  try {
    const parsedUrl = new URL(url);
    const hostname = parsedUrl.hostname;

    const platformDomains = [
      'facebook.com',
      'x.com',
      'twitter.com',
      'youtube.com',
      'instagram.com',
      'tiktok.com',
      'linkedin.com',
      'reddit.com',
      'pinterest.com',
      'snapchat.com',
      'tumblr.com',
      'twitch.tv',
      'discord.com',
      'medium.com',
      'substack.com',
      'github.com',
      'gitlab.com',
      'bitbucket.org',
      'stackoverflow.com',
    ];

    for (const domain of platformDomains) {
      if (hostname === domain || hostname.endsWith(`.${domain}`)) {
        return false; // It's a platform
      }
    }

    return true; // It's a website
  } catch {
    // Handle invalid URLs
    return false;
  }
}
