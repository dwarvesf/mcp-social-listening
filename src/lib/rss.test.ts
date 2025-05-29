import { describe, expect, it } from 'vitest';

import { isRssUrl } from './rss';

describe('isRssUrl', () => {
  it('should return true for valid RSS URLs', () => {
    expect(isRssUrl('http://example.com/feed.xml')).toBe(true);
    expect(isRssUrl('https://www.example.org/rss/news.xml')).toBe(true);
    expect(isRssUrl('https://example.com/path/to/feed.xml?query=string')).toBe(
      true,
    );
    expect(isRssUrl('https://martinfowler.com/feed.atom')).toBe(true);
    expect(isRssUrl('http://example.com/feed.rss')).toBe(true);
    expect(isRssUrl('https://www.example.org/blog/atom.xml')).toBe(true);
  });

  it('should return false for invalid RSS URLs', () => {
    expect(isRssUrl('feed.xml')).toBe(false);
    expect(isRssUrl('http://example.com/index.html')).toBe(false);
    expect(isRssUrl('https://www.example.org/blog')).toBe(false);
    expect(isRssUrl('not-a-url')).toBe(false);
    expect(isRssUrl('http://example.com/feed')).toBe(false);
    expect(isRssUrl('http://example.com/feed.txt')).toBe(false);
    expect(isRssUrl('http://example.com/feed.json')).toBe(false);
  });
});
