import axios from 'axios';
import { describe, expect, it, type Mock, vi } from 'vitest';

import { Platform, SourceType } from '../type.js';
import { getFacebookSource, isFacebookUrl } from './facebook.js';

// Mock axios and cheerio
vi.mock('axios');

describe('isFacebookUrl', () => {
  it.each([
    { expected: true, url: 'https://www.facebook.com/profile' },
    { expected: true, url: 'https://facebook.com/page' },
    { expected: true, url: 'https://www.facebook.com/groups/123' },
    { expected: true, url: 'https://facebook.com/events/456' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isFacebookUrl(url)).toBe(expected);
  });

  it.each([
    { expected: false, url: 'https://example.com' },
    { expected: false, url: 'invalid-url' },
    { expected: false, url: 'https://www.google.com' },
    { expected: false, url: 'https://twitter.com/user' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isFacebookUrl(url)).toBe(expected);
  });
});

describe('getFacebookSource', () => {
  it('should extract name and return SubmitSource for a valid Facebook URL', async () => {
    const mockHtml = `<html><head><title>Mocked Facebook Page Title</title></head><body></body></html>`;
    (axios.get as Mock).mockResolvedValueOnce({ data: mockHtml });

    const url = 'https://www.facebook.com/somepage';
    const result = await getFacebookSource(url);

    expect(axios.get).toHaveBeenCalledWith(url);
    // cheerio.load is not mocked, so we don't assert on it directly
    expect(result).toEqual({
      name: 'Mocked Facebook Page Title',
      platform: Platform.Facebook,
      type: SourceType.Profile,
      url,
    });
  });

  it('should handle errors during fetching and return null name', async () => {
    (axios.get as Mock).mockRejectedValueOnce(new Error('Network error'));

    // Mock console.error to prevent it from polluting test output
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const url = 'https://www.facebook.com/errorpage';
    const result = await getFacebookSource(url);

    expect(axios.get).toHaveBeenCalledWith(url);
    expect(result).toEqual({
      name: '',
      platform: Platform.Facebook,
      type: SourceType.Profile,
      url,
    });
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Error processing Facebook source:',
      expect.any(Error),
    );
    consoleErrorSpy.mockRestore(); // Restore original console.error
  });

  it('should return empty name if title is not found', async () => {
    const mockHtml = `<html><head></head><body></body></html>`;
    (axios.get as Mock).mockResolvedValueOnce({ data: mockHtml });

    const url = 'https://www.facebook.com/notitle';
    const result = await getFacebookSource(url);

    expect(axios.get).toHaveBeenCalledWith(url);
    expect(result).toEqual({
      name: '',
      platform: Platform.Facebook,
      type: SourceType.Profile,
      url,
    });
  });
});
