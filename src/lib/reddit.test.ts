import { describe, expect, it } from 'vitest';

import { Platform, SourceType } from '../type.js';
import { getRedditSource, isRedditUrl } from './reddit.js';

describe('isRedditUrl', () => {
  it('should return true for a valid subreddit URL', () => {
    const validUrl = 'https://www.reddit.com/r/crypto/';
    expect(isRedditUrl(validUrl)).toBe(true);
  });

  it('should return true for a valid subreddit URL with trailing slash', () => {
    const validUrl = 'https://www.reddit.com/r/programming/';
    expect(isRedditUrl(validUrl)).toBe(true);
  });

  it('should return false for an invalid Reddit URL (not a subreddit)', () => {
    const invalidUrl = 'https://www.reddit.com/user/test/';
    expect(isRedditUrl(invalidUrl)).toBe(false);
  });

  it('should return false for a non-Reddit URL', () => {
    const invalidUrl = 'https://www.google.com/';
    expect(isRedditUrl(invalidUrl)).toBe(false);
  });

  it('should return false for a malformed URL', () => {
    const invalidUrl = 'reddit.com/r/test';
    expect(isRedditUrl(invalidUrl)).toBe(false);
  });

  it('should return false for a subreddit URL with invalid characters', () => {
    const invalidUrl = 'https://www.reddit.com/r/invalid-sub!';
    expect(isRedditUrl(invalidUrl)).toBe(false);
  });
});

describe('getRedditSource', () => {
  it('should return a SubmitSource object with correct properties', async () => {
    const url = 'https://www.reddit.com/r/testsubreddit/';
    const source = await getRedditSource(url);
    expect(source).toEqual({
      name: 'Reddit Subreddit: testsubreddit',
      platform: Platform.Reddit,
      type: SourceType.Reddit,
      url: url,
    });
  });
});
