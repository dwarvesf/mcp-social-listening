#!/usr/bin/env node
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

import { getRssSource, isRssUrl } from './lib/rss.js';
import { getWebsiteSource, isWebsiteUrl } from './lib/website.js';
import { getYoutubeSource, isYoutubeUrl } from './lib/youtube.js';
import { supabaseUtils } from './supabase.js';
import { SourceType, SubmitSource } from './type.js';

const server = new FastMCP({
  name: 'social-listening',
  version: '1.0.0',
});

server.addTool({
  description: 'Add a new resource to the social listening system.',
  execute: async args => {
    const url = args.url.trim();
    const type = args.type.trim().toLowerCase();
    let source: null | SubmitSource = null;

    if (type === 'newsletter' && isWebsiteUrl(url)) {
      source = await getWebsiteSource(url, SourceType.Newsletter);
    } else if (type === 'hiring') {
      source = await getWebsiteSource(url, SourceType.Hiring);
    } else if (isRssUrl(url)) {
      source = await getRssSource(url);
    } else if (isYoutubeUrl(url)) {
      source = await getYoutubeSource(url);
    }
    if (source) {
      await supabaseUtils.addSource(source);
      return `Source added successfully: ${source.url}`;
    }

    return `Failed to add source. Unsupported URL format: ${url}`;
  },
  name: 'add_new_source_to_social_listening',
  parameters: z.object({
    type: z
      .nativeEnum(SourceType)
      .describe('The type of the source, e.g., rss, newsletter, hiring'),
    url: z.string().url().min(1).describe('The URL'),
  }),
});

server.addResource({
  async load() {
    return {
      text: 'Example log content',
    };
  },
  mimeType: 'text/plain',
  name: 'Application Logs',
  uri: 'file:///logs/app.log',
});

// Start the server
async function main() {
  try {
    await server.start({
      transportType: 'stdio',
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
