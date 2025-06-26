#!/usr/bin/env node
import { FastMCP } from 'fastmcp';

import { addNewResourceTool } from './tools/add-new-source.js';
import { addDescribeParquetTool } from './tools/describe-parquet-tool.js';

const server = new FastMCP({
  name: 'social-listening',
  version: '1.0.0',
});

addNewResourceTool(server);
addDescribeParquetTool(server);

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
