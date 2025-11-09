/**
 * Metro configuration for React Native with Expo
 * Configures path alias resolution (@/) and proper TypeScript support
 * This fixes module resolution issues for the project structure
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Get default Expo Metro configuration
const config = getDefaultConfig(__dirname);

// Configure resolver to support @/ path alias
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': path.resolve(__dirname, './'),
  },
  // Ensure TypeScript files and other extensions are resolved
  sourceExts: [...(config.resolver?.sourceExts || []), 'ts', 'tsx', 'mjs', 'cjs'],
  assetExts: [...(config.resolver?.assetExts || []), 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'],
  // Block only build artifacts and cache directories from being watched
  // Don't block nested node_modules as some packages need them
  blockList: [
    /backend\/dist\/.*/,
    /\.git\/.*/,
  ].map((re) => new RegExp(re)),
};

module.exports = config;
