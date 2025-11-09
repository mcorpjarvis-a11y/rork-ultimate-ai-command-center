#!/usr/bin/env node

/**
 * Node.js Version Checker
 * Enforces Node 18-20 compatibility for React Native 0.81.x
 * 
 * React Native 0.81.x with Metro bundler and esbuild does not support Node 21+
 * This script provides early validation with clear error messages.
 */

const nodeVersion = process.versions.node;
const majorVersion = parseInt(nodeVersion.split('.')[0], 10);

// Check if Node version is too high (> 20)
if (majorVersion > 20) {
  console.error('\n❌ ════════════════════════════════════════════════════════════');
  console.error('❌   INCOMPATIBLE NODE.JS VERSION DETECTED');
  console.error('❌ ════════════════════════════════════════════════════════════\n');
  console.error(`   Current Version: Node.js v${nodeVersion}`);
  console.error('   Required: Node.js 18.x - 20.x LTS\n');
  console.error('⚠️  React Native 0.81.x does not support Node.js 21 or higher.');
  console.error('   Metro bundler and esbuild will fail with TransformError.\n');
  console.error('📋 SOLUTION:\n');
  console.error('   Install Node.js 20 LTS (recommended):\n');
  console.error('   Using nvm (Node Version Manager):');
  console.error('   $ nvm install 20');
  console.error('   $ nvm use 20');
  console.error('   $ nvm alias default 20\n');
  console.error('   Using Termux (Android):');
  console.error('   $ pkg uninstall nodejs');
  console.error('   $ pkg install nodejs-lts\n');
  console.error('   Direct download:');
  console.error('   https://nodejs.org/en/download/\n');
  console.error('════════════════════════════════════════════════════════════\n');
  process.exit(1);
}

// Check if Node version is too low (< 18)
if (majorVersion < 18) {
  console.error('\n❌ ════════════════════════════════════════════════════════════');
  console.error('❌   NODE.JS VERSION TOO OLD');
  console.error('❌ ════════════════════════════════════════════════════════════\n');
  console.error(`   Current Version: Node.js v${nodeVersion}`);
  console.error('   Required: Node.js 18.x - 20.x LTS\n');
  console.error('⚠️  Node.js 17 and below lack required features.');
  console.error('   Please upgrade to Node.js 20 LTS for best compatibility.\n');
  console.error('📋 SOLUTION:\n');
  console.error('   Install Node.js 20 LTS (recommended):\n');
  console.error('   Using nvm (Node Version Manager):');
  console.error('   $ nvm install 20');
  console.error('   $ nvm use 20');
  console.error('   $ nvm alias default 20\n');
  console.error('   Using Termux (Android):');
  console.error('   $ pkg uninstall nodejs');
  console.error('   $ pkg install nodejs-lts\n');
  console.error('   Direct download:');
  console.error('   https://nodejs.org/en/download/\n');
  console.error('════════════════════════════════════════════════════════════\n');
  process.exit(1);
}

// Success - Node version is compatible (18-20)
console.log(`✅ Node.js v${nodeVersion} - Compatible with React Native 0.81.x\n`);
process.exit(0);
