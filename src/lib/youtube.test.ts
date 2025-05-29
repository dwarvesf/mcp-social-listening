import { describe, expect, it } from 'vitest';

import {
  extractYoutubeHandle,
  isValidYouTubeChannelUrl,
  isYoutubeUrl,
} from './youtube.js';

describe('isValidYouTubeChannelUrl', () => {
  it.each([
    { expected: true, url: 'https://www.youtube.com/@testchannel' },
    { expected: true, url: 'https:/www.youtube.com/@testchannel' },
    { expected: true, url: 'https://youtube.com/@testchannel' },
    { expected: true, url: 'https:/youtube.com/@testchannel' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isValidYouTubeChannelUrl(url)).toBe(expected);
  });

  it.each([
    { expected: false, url: 'https://www.youtube.com/testchannel' },
    { expected: false, url: 'https://www.youtube.com/@testchannel/videos' },
    { expected: false, url: 'invalid url' },
  ])('should return $expected for $url', ({ expected, url }) => {
    expect(isValidYouTubeChannelUrl(url)).toBe(expected);
  });
});

describe('isYoutubeUrl', () => {
  it('should return true for valid YouTube URLs', () => {
    expect(isYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(isYoutubeUrl('http://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYoutubeUrl('https://youtu.be/dQw4w9WgXcQ')).toBe(true);
    expect(isYoutubeUrl('www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYoutubeUrl('youtube.com/watch?v=dQw4w9WgXcQ')).toBe(true);
    expect(isYoutubeUrl('https://www.youtube.com/embed/dQw4w9WgXcQ')).toBe(
      true,
    );
    expect(isYoutubeUrl('https://www.youtube.com/v/dQw4w9WgXcQ')).toBe(true);
    expect(
      isYoutubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=1s'),
    ).toBe(true);
  });

  it('should return false for invalid YouTube URLs', () => {
    expect(isYoutubeUrl('https://www.google.com')).toBe(false);
    expect(isYoutubeUrl('not-a-url')).toBe(false);
    expect(isYoutubeUrl('https://www.youtube.com')).toBe(false); // Base URL without path
    expect(isYoutubeUrl('https://www.youtube.com/playlist?list=PL')).toBe(true); // Playlist URL
    expect(isYoutubeUrl('https://www.facebook.com/video.php?v=12345')).toBe(
      false,
    );
    expect(isYoutubeUrl('')).toBe(false);
    expect(isYoutubeUrl('ftp://youtube.com/watch?v=dQw4w9WgXcQ')).toBe(false);
  });
});

describe('extractYoutubeHandle', () => {
  it('should return the handle when found in the HTML', () => {
    const mockHtml = `
      <head>
        <meta property="og:url" content="https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_D_EZw">
      </head>
      <body>
        <script>
          var ytInitialData = {"ownerProfileUrl":"https://www.youtube.com/@testHandle"};
        </script>
      </body>
    `;
    const handle = extractYoutubeHandle(mockHtml);
    expect(handle).toBe('testHandle');
  });

  it('should return null when the handle is not found in the HTML', () => {
    const mockHtml = `
      <head>
        <meta property="og:url" content="https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_D_EZw">
      </head>
      <body>
        <script>
          var ytInitialData = {};
        </script>
      </body>
    `;
    const handle = extractYoutubeHandle(mockHtml);
    expect(handle).toBeNull();
  });

  it('should return null when the HTML is empty or invalid', () => {
    const mockHtml = '';
    const handle = extractYoutubeHandle(mockHtml);
    expect(handle).toBeNull();
  });

  it('should return the handle when the URL in ownerProfileUrl does not have www.', () => {
    const mockHtml = `
      <head>
        <meta property="og:url" content="https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_D_EZw">
      </head>
      <body>
        <script>
          var ytInitialData = {"ownerProfileUrl":"https://youtube.com/@anotherHandle"};
        </script>
      </body>
    `;
    const handle = extractYoutubeHandle(mockHtml);
    expect(handle).toBe('anotherHandle');
  });

  it('should return the handle when the URL in ownerProfileUrl does not have https://', () => {
    const mockHtml = `
      <head>
        <meta property="og:url" content="https://www.youtube.com/channel/UC-lHJZR3Gqxm24_Vd_D_EZw">
      </head>
      <body>
        <script>
          var ytInitialData = {"ownerProfileUrl":"www.youtube.com/@yetAnotherHandle"};
        </script>
      </body>
    `;
    const handle = extractYoutubeHandle(mockHtml);
    expect(handle).toBe('yetAnotherHandle');
  });
});
