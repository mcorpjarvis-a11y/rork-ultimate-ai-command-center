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

// Mock expo-media-library
jest.mock('expo-media-library', () => ({
  requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
  getAssetsAsync: jest.fn(() => Promise.resolve({ assets: [], endCursor: '', hasNextPage: false, totalCount: 0 })),
  getAssetInfoAsync: jest.fn(() => Promise.resolve({ localUri: null, duration: 0 })),
  createAssetAsync: jest.fn(() => Promise.resolve({ id: 'mock-asset', uri: 'mock://asset' })),
  createAlbumAsync: jest.fn(() => Promise.resolve()),
  getAlbumsAsync: jest.fn(() => Promise.resolve([])),
  saveToLibraryAsync: jest.fn(() => Promise.resolve()),
  MediaType: {
    audio: 'audio',
    photo: 'photo',
    video: 'video',
    unknown: 'unknown',
    all: 'all',
  },
  SortBy: {
    default: 'default',
    creationTime: 'creationTime',
    modificationTime: 'modificationTime',
    mediaType: 'mediaType',
    width: 'width',
    height: 'height',
    duration: 'duration',
  },
}));

// Mock expo-file-system
jest.mock('expo-file-system', () => ({
  readAsStringAsync: jest.fn(),
  EncodingType: {
    UTF8: 'utf8',
    Base64: 'base64',
  },
}));

// Mock expo-speech
jest.mock('expo-speech', () => ({
  speak: jest.fn(),
  stop: jest.fn(),
  isSpeakingAsync: jest.fn(() => Promise.resolve(false)),
  getAvailableVoicesAsync: jest.fn(() => Promise.resolve([])),
  maxSpeechInputLength: 4000,
}));

// Mock expo-audio
jest.mock('expo-audio', () => ({
  setIsAudioActiveAsync: jest.fn(() => Promise.resolve()),
  setAudioModeAsync: jest.fn(() => Promise.resolve()),
  RecordingPresets: {
    HIGH_QUALITY: {
      isMeteringEnabled: true,
      android: {
        extension: '.m4a',
        outputFormat: 2,
        audioEncoder: 3,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
      },
      ios: {
        extension: '.m4a',
        outputFormat: 'MPEG4AAC',
        audioQuality: 127,
        sampleRate: 44100,
        numberOfChannels: 2,
        bitRate: 128000,
        linearPCMBitDepth: 16,
        linearPCMIsBigEndian: false,
        linearPCMIsFloat: false,
      },
    },
  },
}));

// Mock expo-audio AudioModule
jest.mock('expo-audio/build/AudioModule', () => ({
  __esModule: true,
  default: {
    createRecorder: jest.fn(() => Promise.resolve({ id: 'mock-recorder' })),
    prepareRecorder: jest.fn(() => Promise.resolve()),
    startRecording: jest.fn(() => Promise.resolve()),
    stopRecording: jest.fn(() => Promise.resolve({ uri: 'mock://audio.m4a' })),
    getStatus: jest.fn(() => Promise.resolve({ isRecording: false })),
  },
}));

// Mock expo-speech-recognition
jest.mock('expo-speech-recognition', () => ({
  ExpoSpeechRecognitionModule: {
    start: jest.fn(),
    stop: jest.fn(),
    abort: jest.fn(),
    requestPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    getPermissionsAsync: jest.fn(() => Promise.resolve({ granted: true })),
    getSupportedLocales: jest.fn(() => Promise.resolve(['en-US'])),
    getAssistantAvailable: jest.fn(() => Promise.resolve(true)),
    supportsOnDeviceRecognition: jest.fn(() => Promise.resolve(false)),
    supportsRecording: jest.fn(() => Promise.resolve(true)),
    getStateAsync: jest.fn(() => Promise.resolve('inactive')),
  },
  useSpeechRecognitionEvent: jest.fn(),
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
