#!/usr/bin/env node

/**
 * Backend Build Script
 * 
 * Uses esbuild to compile the backend TypeScript code to JavaScript.
 * Marks React Native and Expo packages as external to prevent bundling
 * and avoid esbuild transform errors.
 */

const esbuild = require('esbuild');
const path = require('path');

const reactNativePackages = [
  'react-native',
  'react-native-web',
  '@react-native-async-storage/async-storage',
  '@react-native/virtualized-lists',
  'react-native-gesture-handler',
  'react-native-safe-area-context',
  'react-native-screens',
  'react-native-svg',
  'expo',
  'expo-router',
  'expo-asset',
  'expo-audio',
  'expo-auth-session',
  'expo-blur',
  'expo-clipboard',
  'expo-constants',
  'expo-crypto',
  'expo-document-picker',
  'expo-file-system',
  'expo-font',
  'expo-haptics',
  'expo-image',
  'expo-image-picker',
  'expo-linear-gradient',
  'expo-linking',
  'expo-location',
  'expo-media-library',
  'expo-secure-store',
  'expo-speech',
  'expo-speech-recognition',
  'expo-splash-screen',
  'expo-status-bar',
  'expo-symbols',
  'expo-system-ui',
  'expo-web-browser',
  'react',
  'react-dom'
];

async function build() {
  try {
    console.log('🔨 Building backend...');
    
    await esbuild.build({
      entryPoints: ['backend/server.express.ts'],
      bundle: true,
      platform: 'node',
      target: 'node20',
      outfile: 'backend/dist/server.express.js',
      external: reactNativePackages,
      packages: 'external', // Don't bundle node_modules
      sourcemap: true,
      logLevel: 'info',
      format: 'cjs',
    });
    
    console.log('✅ Backend build completed successfully!');
    console.log('📁 Output: backend/dist/server.express.js');
  } catch (error) {
    console.error('❌ Backend build failed:', error);
    process.exit(1);
  }
}

build();
