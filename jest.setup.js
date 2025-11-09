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

// Create in-memory storage for tests
// Use mock prefix to allow in jest.mock factory
const mockSecureStore = new Map();
const mockAsyncStore = new Map();

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(async (key) => mockSecureStore.get(key) || null),
  setItemAsync: jest.fn(async (key, value) => {
    mockSecureStore.set(key, value);
  }),
  deleteItemAsync: jest.fn(async (key) => {
    mockSecureStore.delete(key);
  }),
}));

jest.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: jest.fn(async (key) => mockAsyncStore.get(key) || null),
    setItem: jest.fn(async (key, value) => {
      mockAsyncStore.set(key, value);
    }),
    removeItem: jest.fn(async (key) => {
      mockAsyncStore.delete(key);
    }),
    clear: jest.fn(async () => {
      mockAsyncStore.clear();
    }),
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

// Mock expo-image-picker
jest.mock('expo-image-picker', () => ({
  requestMediaLibraryPermissionsAsync: jest.fn(),
  requestCameraPermissionsAsync: jest.fn(),
  launchImageLibraryAsync: jest.fn(),
  launchCameraAsync: jest.fn(),
  MediaTypeOptions: {
    Images: 'Images',
    Videos: 'Videos',
    All: 'All',
  },
}));

// Mock expo-document-picker
jest.mock('expo-document-picker', () => ({
  getDocumentAsync: jest.fn(),
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
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

// Provide a global way to clear storage between tests
global.clearTestStorage = () => {
  mockSecureStore.clear();
  mockAsyncStore.clear();
};

// Clear storage before each test
beforeEach(() => {
  mockSecureStore.clear();
  mockAsyncStore.clear();
});
