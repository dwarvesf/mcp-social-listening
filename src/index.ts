#!/usr/bin/env node
import { FastMCP } from 'fastmcp';

import { addSourceTools } from './tools/source.js';
import { addProfileTools } from './tools/profile.js';

const server = new FastMCP({
  name: 'social-listening',
  version: '1.0.0',
});

[addSourceTools, addProfileTools].forEach(tool => {
  if (typeof tool === 'function') {
    tool(server);
  } else {
    console.warn('Tool is not a function:', tool);
  }
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
