/**
 * Backend-safe shim for expo-modules-core
 * 
 * Provides a minimal Node.js compatible stub for expo-modules-core.
 * Most expo module functionality is not available in Node.js.
 */

// Export empty objects/functions for common expo-modules-core exports
export const requireNativeModule = () => {
  throw new Error('Native modules not available in Node.js backend');
};

export const NativeModulesProxy = {};

export default {
  requireNativeModule,
  NativeModulesProxy,
};
