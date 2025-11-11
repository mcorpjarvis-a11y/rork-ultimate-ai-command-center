/**
 * Metro configuration for React Native with Expo + Expo Router
 * Pure CommonJS for Node 22 compatibility in Termux
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// Detect Termux environment
const isTermux = process.env.PREFIX && process.env.PREFIX.includes('/com.termux/');
if (isTermux) {
  console.log('🔧 Detected Termux environment – using safe Metro CJS mode.');
}

// Get base config from Expo
const baseConfig = getDefaultConfig(__dirname);

// Build config with all necessary extensions
const config = {
  ...baseConfig,
  transformer: {
    ...baseConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
    // Critical for Node 22 + Termux compatibility
    unstable_disableModuleTypeStripping: true,
  },
  resolver: {
    ...baseConfig.resolver,
    extraNodeModules: {
      '@': path.resolve(__dirname, './'),
    },
    sourceExts: [
      ...(baseConfig.resolver?.sourceExts || []),
      'ts', 'tsx', 'js', 'jsx', 'json'
    ],
    assetExts: [
      ...(baseConfig.resolver?.assetExts || []),
      'db', 'mp3', 'ttf', 'png'
    ],
    blockList: [/backend\/dist\/.*/, /\.git\/.*/],
  },
  watchFolders: [path.resolve(__dirname, 'node_modules')],
};

module.exports = config;
