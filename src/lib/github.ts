import { Platform, SourceType, SubmitSource } from '../type.js';

export async function getGithubSource(url: string): Promise<SubmitSource> {
  const match = url.match(
    /^https:\/\/github\.com\/([^/]+)\/([^/]+)\/issues\/?$/,
  );
  if (!match) {
    throw new Error('Invalid GitHub issues URL');
  }

  const owner = match[1];
  const repo = match[2];

  return {
    name: `GitHub Issues: ${owner}/${repo}`,
    platform: Platform.Github,
    type: SourceType.Repository,
    url: url,
  };
}

export function isGithubUrl(url: string): boolean {
  const regex = /^https:\/\/github\.com\/[^/]+\/[^/]+\/issues\/?$/;
  return regex.test(url);
}
