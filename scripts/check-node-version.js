#!/usr/bin/env node

/**
 * Node.js Version Checker
 * Forward-compatible version check for React Native 0.81.x
 * 
 * Requires Node 18+, tested on Node 18-20.
 * Newer versions are allowed with a warning.
 */

const [major] = process.versions.node.split('.').map(Number);

if (major < 18) {
  console.error(`❌ Node.js ${process.version} is too old. Please upgrade to Node 18 LTS or newer.`);
  process.exit(1);
}

if (major > 20) {
  console.warn(`⚠️ Node.js ${process.version} is newer than our tested range (18–20).`);
  console.warn("Attempting to continue anyway…");
}

console.log(`✅ Node.js ${process.version} detected — continuing startup.`);
