import { describe, expect, it } from 'vitest';

import { getXAuthorFromUrl, isXorTwitterUrl } from './x';

describe('getXAuthorFromUrl', () => {
  it.each([
    { expected: 'username', url: 'https://x.com/username' },
    { expected: 'anotheruser', url: 'https://twitter.com/anotheruser' },
    { expected: 'username', url: 'https://x.com/username/status/123' },
  ])('should extract author from $url', ({ expected, url }) => {
    expect(getXAuthorFromUrl(url)).toBe(expected);
  });

  it.each([
    { expected: null, url: 'invalid-url' },
    { expected: null, url: 'https://x.com/' },
    { expected: null, url: 'https://example.com/username' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(getXAuthorFromUrl(url)).toBe(expected);
  });
});

describe('isXorTwitterUrl', () => {
  it.each([
    { expected: true, url: 'https://x.com/username' },
    { expected: true, url: 'https://twitter.com/anotheruser' },
    { expected: true, url: 'https://x.com/username/status/123' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isXorTwitterUrl(url)).toBe(expected);
  });

  it.each([
    { expected: false, url: 'https://example.com' },
    { expected: false, url: 'invalid-url' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isXorTwitterUrl(url)).toBe(expected);
  });
});
