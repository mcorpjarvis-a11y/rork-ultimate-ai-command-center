/**
 * Backend Module Alias Hook
 * 
 * This module sets up aliases to redirect expo and react-native imports
 * to backend-safe shims when running in Node.js environment.
 */

const Module = require('module');
const path = require('path');

const originalResolveFilename = Module._resolveFilename;

// Map of package names to their shim paths
const shimMap = {
  'expo-secure-store': path.resolve(__dirname, '../backend/dist/backend/shims/expo-secure-store.js'),
  'react-native': path.resolve(__dirname, '../backend/dist/backend/shims/react-native.js'),
  '@react-native-async-storage/async-storage': path.resolve(__dirname, '../backend/dist/backend/shims/async-storage.js'),
  'expo-auth-session': path.resolve(__dirname, '../backend/dist/backend/shims/expo-auth-session.js'),
  'expo-web-browser': path.resolve(__dirname, '../backend/dist/backend/shims/expo-web-browser.js'),
  'expo-crypto': path.resolve(__dirname, '../backend/dist/backend/shims/expo-crypto.js'),
  'expo-modules-core': path.resolve(__dirname, '../backend/dist/backend/shims/expo-modules-core.js'),
};

Module._resolveFilename = function (request, parent, isMain) {
  // Check if this is a package we want to shim
  if (shimMap[request]) {
    return shimMap[request];
  }
  
  // Also check if the request starts with any of our shimmed packages
  // This catches internal imports like 'expo-secure-store/build/...'
  for (const [packageName, shimPath] of Object.entries(shimMap)) {
    if (request.startsWith(packageName + '/')) {
      // Return the shim for any subpath import
      return shimPath;
    }
  }
  
  // Otherwise use the original resolver
  return originalResolveFilename.call(this, request, parent, isMain);
};

console.log('[module-alias] Backend shims registered for expo and react-native packages');
