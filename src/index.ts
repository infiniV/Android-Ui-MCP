#!/usr/bin/env node

import { AndroidScreenshotServer } from './server';

async function main() {
  try {
    const server = new AndroidScreenshotServer();
    await server.run();
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();