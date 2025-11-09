/**
 * React Native Polyfill for Node.js Backend
 * 
 * This is a minimal polyfill that provides React Native APIs for code
 * that runs in both mobile and backend contexts.
 * 
 * The backend tsconfig.json is configured to resolve 'react-native' imports
 * to this file instead of the actual react-native package.
 */

// Platform API - reports as 'web' for backend
export const Platform = {
  OS: 'web' as const,
  Version: undefined,
  isTV: false,
  isTesting: process.env.NODE_ENV === 'test',
  select: <T>(obj: { web?: T; default: T }): T => {
    return obj.web !== undefined ? obj.web : obj.default;
  },
};

// Minimal polyfills for other React Native APIs if needed
export const Dimensions = {
  get: () => ({ width: 1920, height: 1080 }),
};

export const StyleSheet = {
  create: <T>(styles: T): T => styles,
};

// Default export
export default {
  Platform,
  Dimensions,
  StyleSheet,
};
