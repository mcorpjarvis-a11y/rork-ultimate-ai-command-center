// Jest setup file
// This runs before all tests

// Mock expo modules that aren't available in test environment
jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    expoConfig: {
      extra: {},
    },
    manifest: {},
    platform: {
      android: undefined,
      ios: undefined,
    },
  },
}));

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

jest.mock('@react-native-async-storage/async-storage', () => {
  const store = new Map();
  const mockImpl = {
    getItem: jest.fn(async (key) => store.get(key) || null),
    setItem: jest.fn(async (key, value) => {
      store.set(key, value);
    }),
    removeItem: jest.fn(async (key) => {
      store.delete(key);
    }),
    clear: jest.fn(async () => {
      store.clear();
    }),
    getAllKeys: jest.fn(async () => Array.from(store.keys())),
    multiRemove: jest.fn(async (keys) => {
      keys.forEach(key => store.delete(key));
    }),
    multiGet: jest.fn(async (keys) => {
      return keys.map(key => [key, store.get(key) || null]);
    }),
    multiSet: jest.fn(async (keyValuePairs) => {
      keyValuePairs.forEach(([key, value]) => store.set(key, value));
    }),
  };
  
  return {
    __esModule: true,
    default: mockImpl,
    ...mockImpl, // Also export as named exports
  };
});

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
jest.mock('expo-audio', () => {
  const permissionResponse = {
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  };

  return {
    setIsAudioActiveAsync: jest.fn(async () => {}),
    setAudioModeAsync: jest.fn(async () => {}),
    requestRecordingPermissionsAsync: jest.fn(async () => permissionResponse),
    getRecordingPermissionsAsync: jest.fn(async () => permissionResponse),
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
  };
});

// Mock expo-audio AudioModule
jest.mock('expo-audio/build/AudioModule', () => {
  const permissionResponse = {
    status: 'granted',
    granted: true,
    canAskAgain: true,
    expires: 'never',
  };

  class MockAudioRecorder {
    constructor() {
      this.uri = 'mock://audio.m4a';
      this._isRecording = false;
    }

    prepareToRecordAsync = jest.fn(async () => {});

    record = jest.fn(() => {
      this._isRecording = true;
    });

    stop = jest.fn(async () => {
      this._isRecording = false;
      return { uri: this.uri };
    });

    getStatus = jest.fn(() => ({
      canRecord: true,
      isRecording: this._isRecording,
      durationMillis: this._isRecording ? 1000 : 0,
      metering: this._isRecording ? 0.5 : 0,
      uri: this.uri,
    }));
  }

  class MockAudioPlayer {
    constructor() {
      this.play = jest.fn();
      this.pause = jest.fn();
      this.stop = jest.fn();
      this.replace = jest.fn();
      this.remove = jest.fn();
    }
  }

  return {
    __esModule: true,
    default: {
      setIsAudioActiveAsync: jest.fn(async () => {}),
      setAudioModeAsync: jest.fn(async () => {}),
      requestRecordingPermissionsAsync: jest.fn(async () => permissionResponse),
      getRecordingPermissionsAsync: jest.fn(async () => permissionResponse),
      AudioRecorder: MockAudioRecorder,
      AudioPlayer: MockAudioPlayer,
    },
  };
});

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

// Suppress console logs in tests (but keep errors visible in CI)
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Known harmless warnings to filter out in CI
const knownHarmlessWarnings = [
  'native module is not exported through NativeModules',
  'ExpoModulesCoreJSLogger',
  'EXNativeModulesProxy',
  'expo-modules-core',
  'Cannot read properties of undefined',
  'verify that expo-modules-core',
];

const shouldSuppressWarning = (message) => {
  const msgStr = String(message);
  return knownHarmlessWarnings.some(pattern => msgStr.includes(pattern));
};

global.console = {
  ...console,
  log: jest.fn((...args) => {
    // In CI or when DEBUG is set, show logs
    if (process.env.CI || process.env.DEBUG) {
      originalConsoleLog(...args);
    }
  }),
  warn: jest.fn((...args) => {
    // Show warnings in CI, but filter known harmless ones
    if (process.env.CI && !shouldSuppressWarning(args[0])) {
      originalConsoleWarn(...args);
    }
  }),
  error: jest.fn((...args) => {
    // Show errors, but filter known harmless Expo module errors in test environment
    if (!shouldSuppressWarning(args[0])) {
      originalConsoleError(...args);
    }
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
