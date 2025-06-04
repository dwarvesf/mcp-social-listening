import Parser from 'rss-parser';

import { Platform, SourceType, SubmitSource } from '../type.js';

export async function getRssSource(url: string): Promise<null | SubmitSource> {
  const parser = new Parser();

  return parser.parseURL(url).then(feed => {
    if (!feed.title || !feed.link) {
      throw new Error('Invalid RSS feed structure');
    }

    return {
      name: feed.title,
      platform: Platform.Website,
      type: SourceType.Rss,
      url,
    };
  });
}

export function isRssUrl(url: string): boolean {
  const rssRegex =
    /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?\.(xml|rss|atom)(\?[\w-./?%&=]*)?$/i;
  return rssRegex.test(url);
}
