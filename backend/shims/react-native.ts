/**
 * Backend-safe shim for react-native
 * 
 * Provides minimal Platform API that backend code needs.
 * Always reports as 'web' platform to trigger fallback behaviors.
 */

export const Platform = {
  OS: 'web' as const,
  Version: 0,
  select: <T>(obj: { [key: string]: T }) => obj.web || obj.default,
};

export const Dimensions = {
  get: () => ({ width: 1024, height: 768 }),
};
