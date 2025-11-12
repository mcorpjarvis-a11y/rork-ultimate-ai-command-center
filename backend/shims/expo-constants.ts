/**
 * Backend-safe shim for expo-constants
 * 
 * Provides a minimal Node.js compatible stub for expo-constants.
 */

const Constants = {
  expoConfig: {
    extra: {},
  },
  manifest: {},
  platform: {
    os: 'node',
  },
  isDevice: false,
  appOwnership: null,
  deviceName: 'Node.js Server',
  deviceYearClass: null,
  easConfig: null,
  executionEnvironment: 'bare',
  getWebViewUserAgentAsync: async () => 'Node.js Server',
  installationId: 'backend-server',
  intentUri: null,
  isHeadless: true,
  linkingUri: null,
  nativeAppVersion: null,
  nativeBuildVersion: null,
  sessionId: 'backend-session',
  statusBarHeight: 0,
  systemFonts: [],
};

export default Constants;
