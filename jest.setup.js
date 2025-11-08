// Jest setup file
// This runs before all tests

// Mock expo modules that aren't available in test environment
jest.mock('expo-auth-session', () => ({
  makeRedirectUri: jest.fn(() => 'myapp://redirect'),
  AuthRequest: jest.fn(),
  useAuthRequest: jest.fn(),
  ResponseType: {
    Code: 'code',
    Token: 'token',
  },
}));

jest.mock('expo-web-browser', () => ({
  maybeCompleteAuthSession: jest.fn(),
  openBrowserAsync: jest.fn(),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'android',
    select: jest.fn(obj => obj.android || obj.default),
  },
  Dimensions: {
    get: jest.fn(() => ({ width: 375, height: 812 })),
  },
}));

// Suppress console logs in tests (but keep errors)
const originalConsoleError = console.error;

global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn((...args) => {
    // Keep errors visible
    originalConsoleError(...args);
  }),
};

