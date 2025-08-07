import { FastMCP } from 'fastmcp';
import { z } from 'zod';

import { getFacebookSource, isFacebookUrl } from '../lib/facebook.js';
import { getGithubSource, isGithubUrl } from '../lib/github.js';
import { getRedditSource, isRedditUrl } from '../lib/reddit.js';
import { getRssSource, isRssUrl } from '../lib/rss.js';
import { getWebsiteSource, isWebsiteUrl } from '../lib/website.js';
import { getXSource, isXorTwitterUrl } from '../lib/x.js';
import { getYoutubeSource, isYoutubeUrl } from '../lib/youtube.js';
import { supabaseUtils } from '../supabase.js';
import { Category, Region, SourceType, SubmitSource } from '../type.js';

export function addSourceTools(server: FastMCP) {
  server.addTool({
    description: 'Add a new resource to the social listening system.',
    execute: async args => {
      const url = args.url.trim();
      const type = args.type?.trim().toLowerCase();
      const category = args.category?.trim().toLowerCase() as
        | Category
        | undefined;
      const region = args.region?.trim().toLowerCase() as Region | undefined;

      let source: null | SubmitSource = null;

      if (type === 'newsletter' && isWebsiteUrl(url)) {
        source = await getWebsiteSource(url, SourceType.Newsletter);
      } else if (type === 'hiring') {
        source = await getWebsiteSource(url, SourceType.Hiring);
      } else if (isRssUrl(url) || type === 'rss') {
        source = await getRssSource(url);
      } else if (isYoutubeUrl(url)) {
        source = await getYoutubeSource(url);
      } else if (isXorTwitterUrl(url)) {
        source = await getXSource(url);
      } else if (isFacebookUrl(url)) {
        source = await getFacebookSource(url);
      } else if (isRedditUrl(url)) {
        source = await getRedditSource(url);
      } else if (isGithubUrl(url)) {
        source = await getGithubSource(url);
      }
      if (source) {
        await supabaseUtils.addSource({ ...source, category, region });
        return `Source added successfully: ${source.url}`;
      }

      return `Failed to add source. Unsupported URL format: ${url}`;
    },
    name: 'add_new_source_to_social_listening',
    parameters: z.object({
      category: z
        .nativeEnum(Category)
        .describe(
          'The category of the source, e.g., ai, blockchain. Only use this if the category is specifically mentioned.',
        )
        .optional(),
      region: z
        .nativeEnum(Region)
        .describe(
          'The region of the source, e.g., us, eu, singapore, vietnam. Only use this if the category is specifically mentioned.',
        )
        .optional(),
      type: z
        .nativeEnum(SourceType)
        .describe(
          'The type of the source, e.g., rss, newsletter, hiring. Only use this if the category is specifically mentioned.',
        )
        .optional(),
      url: z.string().url().min(1).describe('The URL'),
    }),
  });
}
