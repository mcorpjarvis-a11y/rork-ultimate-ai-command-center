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
  'expo-modules-core',
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
      // ✅ Target Node 22 for Termux compatibility
      target: 'node22',
      outfile: 'backend/dist/server.express.js',
      // ✅ Alias expo-secure-store to backend shim BEFORE external check
      alias: {
        'expo-secure-store': path.resolve(__dirname, '../backend/shims/expo-secure-store.ts'),
        'react-native': path.resolve(__dirname, '../backend/shims/react-native.ts'),
        '@react-native-async-storage/async-storage': path.resolve(__dirname, '../backend/shims/async-storage.ts'),
        'expo-auth-session': path.resolve(__dirname, '../backend/shims/expo-auth-session.ts'),
        'expo-web-browser': path.resolve(__dirname, '../backend/shims/expo-web-browser.ts'),
        'expo-crypto': path.resolve(__dirname, '../backend/shims/expo-crypto.ts'),
        'expo-modules-core': path.resolve(__dirname, '../backend/shims/expo-modules-core.ts'),
        'expo-audio': path.resolve(__dirname, '../backend/shims/expo-audio.ts'),
        'expo-audio/build/AudioModule': path.resolve(__dirname, '../backend/shims/expo-audio.ts'),
      },
      external: reactNativePackages,
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
