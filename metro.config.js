// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Detect Termux environment
const isTermux = process.env.PREFIX && process.env.PREFIX.includes('/com.termux/');
if (isTermux) {
  console.log('🔧 Detected Termux environment – using safe Metro CJS mode.');
}

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Customize the config for Termux + Node 22 compatibility
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
  // Critical for Node 22 + Termux compatibility
  unstable_disableModuleTypeStripping: true,
};

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': path.resolve(__dirname, './'),
  },
  sourceExts: [
    ...(config.resolver?.sourceExts || []),
  ],
  assetExts: [
    ...(config.resolver?.assetExts || []),
    'db', 'mp3', 'ttf', 'png'
  ],
  blockList: [/backend\/dist\/.*/, /\.git\/.*/],
};

config.watchFolders = [path.resolve(__dirname, 'node_modules')];

module.exports = config;
