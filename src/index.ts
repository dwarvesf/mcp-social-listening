#!/usr/bin/env node
import { FastMCP } from 'fastmcp';
import { z } from 'zod';

import { getRssSource, isRssUrl } from './lib/rss.js';
import { getWebsiteSource, isWebsiteUrl } from './lib/website.js';
import { getYoutubeSource, isYoutubeUrl } from './lib/youtube.js';
import { supabaseUtils } from './supabase.js';
import { SubmitSource } from './type.js';

const server = new FastMCP({
  name: 'social-listening',
  version: '1.0.0',
});

server.addTool({
  description: 'Add new resources to the social listening system.',
  execute: async args => {
    const url = args.url.trim();

    let source: null | SubmitSource = null;

    if (isRssUrl(url)) {
      source = await getRssSource(url);
    } else if (isYoutubeUrl(url)) {
      source = await getYoutubeSource(url);
    } else if (isWebsiteUrl(url)) {
      source = await getWebsiteSource(url);
    }
    if (source) {
      await supabaseUtils.addSource(source);
      return `Resource added successfully: ${source.url}`;
    }

    return `Failed to add resource. Unsupported URL format: ${url}`;
  },
  name: 'add_new_resources_to_social_listening',
  parameters: z.object({
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
