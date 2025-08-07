import { describe, expect, it } from 'vitest';
import { Platform, SourceType } from '../type.js';
import { getGithubSource, isGithubUrl } from './github.js';

describe('github', () => {
  describe('isGithubUrl', () => {
    it('should return true for valid GitHub issues URLs', () => {
      expect(isGithubUrl('https://github.com/ruanyf/weekly/issues')).toBe(true);
      expect(isGithubUrl('https://github.com/ruanyf/weekly/issues/')).toBe(
        true,
      );
      expect(isGithubUrl('https://github.com/facebook/react/issues')).toBe(
        true,
      );
      expect(isGithubUrl('https://github.com/microsoft/vscode/issues/')).toBe(
        true,
      );
    });

    it('should return false for invalid GitHub URLs', () => {
      expect(isGithubUrl('https://github.com/ruanyf/weekly')).toBe(false);
      expect(isGithubUrl('https://github.com/ruanyf/weekly/pull/123')).toBe(
        false,
      );
      expect(isGithubUrl('https://github.com/ruanyf/weekly/issues/123')).toBe(
        false,
      );
      expect(isGithubUrl('https://github.com/ruanyf')).toBe(false);
      expect(isGithubUrl('https://github.com')).toBe(false);
      expect(isGithubUrl('https://gitlab.com/user/repo/issues')).toBe(false);
      expect(isGithubUrl('not-a-url')).toBe(false);
    });
  });

  describe('getGithubSource', () => {
    it('should return correct source object for valid GitHub issues URL', async () => {
      const url = 'https://github.com/ruanyf/weekly/issues';
      const source = await getGithubSource(url);

      expect(source).toEqual({
        name: 'GitHub Issues: ruanyf/weekly',
        platform: Platform.Github,
        type: SourceType.Repository,
        url: url,
      });
    });

    it('should handle URL with trailing slash', async () => {
      const url = 'https://github.com/facebook/react/issues/';
      const source = await getGithubSource(url);

      expect(source).toEqual({
        name: 'GitHub Issues: facebook/react',
        platform: Platform.Github,
        type: SourceType.Repository,
        url: url,
      });
    });

    it('should throw error for invalid GitHub URL', async () => {
      await expect(
        getGithubSource('https://github.com/ruanyf/weekly'),
      ).rejects.toThrow('Invalid GitHub issues URL');
    });
  });
});
