/**
 * Metro configuration for React Native with Expo + Expo Router
 * Compatible with CommonJS environments (like Termux)
 */

const { getDefaultConfig } = require('expo/metro-config');
const { withExpoRouter } = require('expo-router/metro');
const path = require('path');

// Get base config
const baseConfig = getDefaultConfig(__dirname);

// Extend for router
const config = withExpoRouter({
  ...baseConfig,
  transformer: {
    ...baseConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
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
  },
  watchFolders: [path.resolve(__dirname, 'node_modules')],
  blockList: [/backend\/dist\/.*/, /\.git\/.*/],
});

module.exports = config;
