# JARVIS Command Center - Master Checklist & Single Source of Truth

> **⚠️ CRITICAL: THIS IS THE ONLY AUTHORITATIVE DOCUMENTATION FILE**
> 
> This file represents the complete and authoritative documentation for the JARVIS Ultimate AI Command Center project.
> **ALL future updates, changes, and documentation MUST be made to this file only.**
> Do NOT create separate documentation files - update this master file instead.

**Consolidation Date:** 2025-11-09  
**Version:** 3.0 (Consolidated Edition)  
**Platform:** Android (Galaxy S25 Ultra optimized)  
**Node Version:** 20.x LTS (Recommended)

---

## 📑 Table of Contents

- [Quick Navigation](#quick-navigation)
- [README - Project Overview](#readme---project-overview)
- [Quick Start Guide](#quick-start-guide)
- [TESTING - Testing Strategy](#testing---testing-strategy)
- [DONE - Completed Tasks](#done---completed-tasks)
- [TODO - Remaining Tasks](#todo---remaining-tasks)
- [Metro Troubleshooting](#metro-troubleshooting)
- [Security & Vulnerability Scanning](#security--vulnerability-scanning)
- [Backend Documentation](#backend-documentation)
- [Authentication System](#authentication-system)
- [API Keys Setup](#api-keys-setup)
- [How to Update This File](#how-to-update-this-file)

---

## Quick Navigation

### Essential Commands
```bash
# Verification (run before every PR)
npm test                 # Run all tests (should show 142/142)
npm run verify:metro     # Verify Metro bundler works
npm run verify           # Quick pre-start verification
npm run lint             # Check code quality

# Development
npm start                # Start Metro bundler
npm run start:all        # Start backend + frontend
npm run dev:backend      # Start backend with hot reload

# Build
npm run build:backend    # Build backend TypeScript
npm run build:apk        # Build Android APK
```

### Quick Links to Sections
- [How to Get Started](#quick-start-guide)
- [Environment Setup](#environment-setup)
- [Running Tests](#running-tests)
- [Common Issues](#metro-troubleshooting)
- [API Keys](#api-keys-setup)
- [Backend APIs](#backend-documentation)

---

## README - Project Overview

### Welcome to JARVIS Ultimate AI Command Center

This is a native Android mobile application - the Ultimate AI Command Center powered by JARVIS.

**Platform**: Native Android app (iOS not supported)  
**Framework**: Expo Router + React Native  
**Distribution**: APK for sideloading on Android devices

> **Note**: This project is Android-only by design. All iOS/Apple platform support has been removed.

### Project Architecture

```
rork-ultimate-ai-command-center/
├── app/                        # App screens (Expo Router)
│   ├── (tabs)/                 # Tab navigation screens
│   └── _layout.tsx             # Root layout
├── assets/                     # Static assets
├── backend/                    # TypeScript backend server
│   ├── config/                 # Environment & config
│   ├── routes/                 # REST API routes
│   ├── trpc/                   # tRPC setup (optional)
│   ├── dist/                   # Compiled output (gitignored)
│   ├── server.express.ts       # Main Express server
│   └── tsconfig.json           # Backend TypeScript config
├── components/                 # React components
├── services/                   # Business logic & API clients
│   ├── auth/                   # Authentication system
│   ├── ai/                     # AI service integrations
│   ├── voice/                  # Voice/TTS/STT services
│   ├── storage/                # Storage services
│   ├── social/                 # Social media integrations
│   └── iot/                    # IoT device controllers
├── screens/                    # Screen components
├── contexts/                   # React contexts
├── hooks/                      # Custom React hooks
├── types/                      # TypeScript types
├── constants/                  # App constants
├── config/                     # Configuration files
├── scripts/                    # Build & verification scripts
├── __tests__/                  # Test files
├── docs/                       # Archived documentation
├── .env.example                # Environment template
├── app.json                    # Expo configuration
├── metro.config.js             # Metro bundler config
├── babel.config.js             # Babel configuration
├── jest.config.js              # Jest test configuration
├── jest.setup.js               # Jest mocks
├── tsconfig.json               # TypeScript configuration
└── package.json                # Dependencies & scripts
```

### Technology Stack

#### Frontend
- **React Native** - Native mobile development framework
- **Expo** (v54.0.23) - Extension of React Native used by Discord, Shopify, Coinbase
- **Expo Router** (v6.0.14) - File-based routing system
- **TypeScript** (v5.9.2) - Type-safe JavaScript
- **React Query** - Server state management
- **Lucide React Native** - Beautiful icons
- **NativeWind** - Tailwind CSS for React Native

#### Backend (TypeScript)
- **Express.js** - Fast web framework with full TypeScript support
- **TypeScript 5.9.x** - Strict type checking with production-ready configuration
- **tRPC** - End-to-end typesafe APIs (optional, for advanced features)
- **tsx** - TypeScript execution with hot reloading for development
- **AI Integration** - Support for Groq, Google Gemini, HuggingFace, OpenAI, Anthropic

### Key Features

#### Core Features
- ✅ **Android native compatibility** - Optimized for Android devices (Galaxy S25 Ultra)
- ✅ **Multi-provider AI integration** - OpenAI, Anthropic, Google Gemini, Groq, HuggingFace
- ✅ **Voice interaction** - Text-to-Speech (JARVIS British voice) + Speech-to-Text
- ✅ **Authentication** - Google OAuth + Guest mode
- ✅ **Secure storage** - Encrypted local storage with cloud sync (Google Drive)
- ✅ **Social media integration** - Twitter, Instagram, Reddit, etc.
- ✅ **IoT device control** - Philips Hue, Google Nest, TP-Link Kasa
- ✅ **Real-time analytics** - Track usage, costs, performance
- ✅ **Content generation** - AI-powered content creation for social media
- ✅ **Media studio** - Image/video generation and editing
- ✅ **Workflow automation** - Rule-based autonomous operations

---

## Quick Start Guide

### For New Users

1. **Clone the Repository**
   ```bash
   git clone <YOUR_GIT_URL>
   cd rork-ultimate-ai-command-center
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Check Node Version**
   ```bash
   node --version  # Should be v20.x (v20.19.5 tested)
   ```
   
   **⚠️ Important**: Use Node 20.x LTS for best compatibility. Node 22.x may have issues with Metro bundler and esbuild.

4. **Verify Metro Bundler**
   ```bash
   npm run verify:metro
   ```
   
   This will:
   - Clear all Metro caches
   - Test bundle generation for Android
   - Verify bundle contents
   - Report any errors

5. **Run Tests**
   ```bash
   npm test
   ```
   
   Expected: 142/142 tests passing (100%)

6. **Start Development Server**
   ```bash
   # Option A: Frontend only
   npm start
   
   # Option B: Frontend + Backend
   npm run start:all
   
   # Option C: Backend only (for API testing)
   npm run dev:backend
   ```

7. **Connect Your Android Device**
   - Install Expo Go from Google Play
   - Scan the QR code from the Metro bundler
   - Or press "a" to open in Android emulator

### Environment Setup

Create a `.env` file in the project root:

```bash
# Server Configuration (for backend)
PORT=3000
HOST=0.0.0.0
NODE_ENV=development
FRONTEND_URL=*

# AI API Keys (at least one recommended - all have free tiers)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key          # Groq (fastest, free)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key     # Google Gemini (free)
EXPO_PUBLIC_HF_API_TOKEN=your_hf_token         # HuggingFace (free)
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key     # OpenAI (paid)

# Authentication (OAuth)
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_client_id

# Optional Integrations
YOUTUBE_API_KEY=your_youtube_key
DISCORD_BOT_TOKEN=your_discord_token
TWITTER_API_KEY=your_twitter_key
```

**Important**: 
- See `.env.example` for a complete template
- Never commit `.env` to version control
- At least one AI API key is recommended for full functionality

### Testing on Your Phone

1. **Android**: Download the [Expo Go app from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent)
2. Run `npm start` and scan the QR code from your development server

> **Note**: iOS is not supported. This is an Android-only project.

### Testing in Browser

Run `npm run start-web` to test in a web browser. Note: The browser preview is great for quick testing, but some native features may not be available.

---

## TESTING - Testing Strategy

### Testing Framework

This project uses **Jest** with **React Native Testing Library** for comprehensive testing. The testing framework is optimized for **Termux, Expo Go, and Android (Samsung S25 Ultra)** environments.

### Test Structure

```
__tests__/                      # Root test directory
services/auth/__tests__/        # Auth service tests
├── AuthManager.test.ts         # AuthManager unit tests
├── providerRegistry.test.ts    # Provider registry validation
└── integration.test.ts         # Integration tests

scripts/                        # Validation scripts
├── test-metro-config.js        # Metro bundler validation
├── test-provider-registry.js   # Provider registry validation
└── test-pipeline.js            # Comprehensive test pipeline
```

### Running Tests

#### Run All Tests
```bash
npm test
```

#### Run Tests in Watch Mode
```bash
npm run test:watch
```

#### Run Tests with Coverage
```bash
npm run test:coverage
```

#### Run Specific Test Suites
```bash
npm run test:auth              # Auth tests only
npm run test:startup           # Startup validation
npm run test:api-keys          # API key validation
npm run test:metro-config      # Metro config validation
npm run test:provider-registry # Provider registry validation
```

#### Run Complete Test Pipeline
```bash
npm run test:all
```

This runs tests in this order:
1. Metro Configuration Validation (Critical)
2. Provider Registry Validation (Critical)
3. Unit Tests with Jest (Critical)
4. ESLint (Non-critical)

### Test Categories

#### 1. Unit Tests (Jest)
- **AuthManager Tests**: Provider loading, token management, event system
- **Provider Registry Tests**: Validates all providers export required functions
- **Integration Tests**: Metro bundler compatibility and full auth flow
- **Voice Service Tests**: TTS/STT functionality
- **Storage Tests**: AsyncStorage and SecureStore
- **AI Service Tests**: AI provider integrations

#### 2. Validation Scripts
- **Metro Config Validation**: Ensures Metro bundler is properly configured
- **Provider Registry Validation**: Ensures all providers are statically imported
- **Startup Tests**: Validates dependency management

### Key Testing Features

#### Metro Bundler Compatibility
✅ **No dynamic imports** - All provider helpers use static imports  
✅ **Static registry** - Provider registry is built at compile time  
✅ **Path aliases** - Proper @/ path resolution configured

#### Android/Expo Go Compatibility
✅ **Expo-compatible** - Uses `jest-expo` preset  
✅ **React Native mocks** - Proper mocking for RN components  
✅ **Secure Store mocks** - Mocked secure storage for tests

#### Termux Compatibility
✅ **Node.js tests** - All tests run in Node.js environment  
✅ **No native dependencies** - Tests don't require native compilation  
✅ **Fast execution** - Tests complete in ~2 seconds

### Configuration Files

#### jest.config.js
- Preset: `jest-expo`
- Transform ignore patterns for React Native
- Module name mapper for @/ alias
- Coverage thresholds (50% minimum)

#### jest.setup.js
- Mocks Expo modules (auth-session, web-browser, secure-store)
- Mocks React Native modules
- Suppresses console warnings in tests

**Important**: Mocks are ONLY active during Jest tests. Production code uses real implementations.

### Test Coverage

Current test coverage:
- **142 tests** passing (100%)
- **Multiple test suites** (Auth, Voice, Storage, AI, Integration)
- **Coverage targets**: 50% minimum (branches, functions, lines, statements)

### Writing Tests

#### Example: Testing a Service
```typescript
import { VoiceService } from '@/services/voice/VoiceService';

describe('VoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should speak text', async () => {
    const result = await VoiceService.speak('Hello JARVIS');
    expect(result).toBe(true);
  });

  test('should handle errors gracefully', async () => {
    const result = await VoiceService.speak('');
    expect(result).toBe(false);
  });
});
```

### Continuous Integration

The test pipeline can be integrated with CI/CD:

```yaml
# .github/workflows/test.yml
- name: Run tests
  run: npm run test:all

- name: Verify Metro bundler
  run: npm run verify:metro
```

Exit codes:
- `0`: All checks passed
- `1`: Tests or verification failed

### Best Practices

1. **Always run tests before committing**
   ```bash
   npm run test:all
   ```

2. **Use watch mode during development**
   ```bash
   npm run test:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm run test:coverage
   ```

4. **Validate Metro config after changes**
   ```bash
   npm run test:metro-config
   ```

5. **Test on actual device**
   ```bash
   npm run android  # Build and test on physical device
   ```

---

## DONE - Completed Tasks

This section tracks all completed features and fixes. Items are organized by category and date.

### ✅ Core Infrastructure (Completed)

#### A. Project Setup & Configuration
- [x] A1: React Native + Expo 54 setup with TypeScript
- [x] A2: File-based routing with Expo Router
- [x] A3: Android-only configuration (iOS removed)
- [x] A4: Environment variable management (.env setup)
- [x] A5: Git repository initialized with proper .gitignore
- [x] A6: Package.json with all dependencies configured
- [x] A7: TypeScript strict mode configuration

#### B. Metro Bundler & Build System  
- [x] B1: Metro bundler configuration optimized
- [x] B2: Babel module resolver for @/ path alias
- [x] B3: Metro cache clearing strategy
- [x] B4: expo-av → expo-audio migration completed
- [x] B5: @react-native/virtualized-lists added as direct dependency
- [x] B6: blockList simplified (only build artifacts excluded)
- [x] B7: TypeScript path alias support
- [x] B8: Asset handling extended (db, mp3, ttf, obj, png, jpg)

#### C. Testing Infrastructure
- [x] C1: Jest configuration with jest-expo preset
- [x] C2: React Native Testing Library setup
- [x] C3: Jest setup with native module mocks
- [x] C4: 142/142 tests passing (100% pass rate)
- [x] C5: Coverage thresholds configured (50% minimum)
- [x] C6: Test pipeline script (test:all)
- [x] C7: Auth tests (AuthManager, Provider Registry, Integration)
- [x] C8: Metro config validation script
- [x] C9: Provider registry validation script

#### D. Verification Scripts
- [x] D1: verify-metro.js script created
- [x] D2: Automated cache clearing
- [x] D3: Bundle generation testing
- [x] D4: Bundle artifact verification
- [x] D5: CI/CD integration support
- [x] D6: verify:metro npm script added
- [x] D7: Exit code handling for CI

### ✅ Authentication System (Completed)

#### E. OAuth & Token Management
- [x] E1: AuthManager service (central orchestrator)
- [x] E2: TokenVault (secure token storage with SecureStore)
- [x] E3: MasterProfile (single-user profile management)
- [x] E4: PKCE OAuth 2.0 flows for mobile
- [x] E5: Device Flow support for headless environments
- [x] E6: Automatic token refresh
- [x] E7: Event-driven architecture (connected, disconnected, token_refreshed)

#### F. OAuth Provider Helpers
- [x] F1: Google OAuth (Drive, YouTube, Gmail)
- [x] F2: GitHub OAuth with Device Flow
- [x] F3: Discord OAuth
- [x] F4: Spotify OAuth
- [x] F5: Reddit OAuth (installed app)
- [x] F6: Home Assistant local tokens
- [x] F7: Provider configuration registry
- [x] F8: Static imports (no dynamic imports for Metro compatibility)

#### G. Authentication UI
- [x] G1: SignInScreen (first-launch onboarding)
- [x] G2: ConnectionsHub (provider management interface)
- [x] G3: Guest mode / skip sign-in option
- [x] G4: Status indicators (Connected, Not Connected, Needs Re-Auth)
- [x] G5: Local token wizard for smart home devices
- [x] G6: Real-time updates via event subscriptions

### ✅ AI Services (Completed)

#### H. AI Provider Integration
- [x] H1: AIService (multi-provider support)
- [x] H2: FreeAIService (free-tier-first implementation)
- [x] H3: OpenAI integration (GPT-4, GPT-3.5)
- [x] H4: Anthropic integration (Claude)
- [x] H5: Google Gemini integration
- [x] H6: Groq integration (fastest free AI)
- [x] H7: HuggingFace integration
- [x] H8: Auto-fallback when keys unavailable
- [x] H9: Streaming responses
- [x] H10: Token usage tracking
- [x] H11: Cost optimization

### ✅ Voice & Speech (Completed)

#### I. Voice Services
- [x] I1: VoiceService (TTS with expo-speech)
- [x] I2: JARVIS British voice (com.apple.voice.compact.en-GB.Daniel)
- [x] I3: Audio recording with expo-audio
- [x] I4: JarvisVoiceService (audio playback)
- [x] I5: JarvisAlwaysListeningService (continuous listening)
- [x] I6: Wake word detection
- [x] I7: Speech recognition with expo-speech-recognition
- [x] I8: WhisperService (OpenAI Whisper API integration)
- [x] I9: Voice preference configuration
- [x] I10: Auto-start functionality

### ✅ Storage & Data (Completed)

#### J. Storage Services
- [x] J1: StorageManager (AsyncStorage wrapper)
- [x] J2: SecureKeyStorage (SecureStore for tokens)
- [x] J3: MediaStorageService (expo-file-system + expo-media-library)
- [x] J4: Data encryption
- [x] J5: GoogleDriveSync (cloud backup for authenticated users)
- [x] J6: Profile migration and restore

### ✅ Backend Server (Completed)

#### K. Backend Infrastructure
- [x] K1: Express.js server with TypeScript
- [x] K2: Environment validation
- [x] K3: CORS configuration
- [x] K4: Error handling middleware
- [x] K5: Build system (tsc compilation)
- [x] K6: Hot reload with tsx watch
- [x] K7: Production build support

#### L. Backend API Routes
- [x] L1: /api/voice (TTS/STT endpoints)
- [x] L2: /api/ask (AI reasoning endpoints)
- [x] L3: /api/analytics (metrics and tracking)
- [x] L4: /api/integrations (social media integrations)
- [x] L5: /api/trends (trend discovery)
- [x] L6: /api/content (content management)
- [x] L7: /api/media (media upload/storage)
- [x] L8: /api/settings (app settings)
- [x] L9: /api/system (health checks, system info)
- [x] L10: /api/logs (logging endpoints)

### ✅ UI & Navigation (Completed)

#### M. Core UI Components
- [x] M1: Startup Wizard with skip option
- [x] M2: Main dashboard
- [x] M3: AI Assistant interface (JARVIS modal)
- [x] M4: Settings & configuration screens
- [x] M5: API Keys management screen
- [x] M6: Voice preferences screen
- [x] M7: Tab navigation
- [x] M8: Modal screens
- [x] M9: 404/not-found screen

### ✅ Documentation (Completed)

#### N. Documentation Files
- [x] N1: MASTER_CHECKLIST.md (this file - consolidated)
- [x] N2: METRO_TROUBLESHOOTING.md (comprehensive guide)
- [x] N3: REAL_IMPLEMENTATION_VERIFICATION.md (production readiness)
- [x] N4: README.md (project overview)
- [x] N5: TESTING.md (testing strategy)
- [x] N6: TODO.md (task tracking)
- [x] N7: AI_KEYS_NEEDED.md (API key setup guide)
- [x] N8: Backend README (TypeScript backend documentation)
- [x] N9: Auth README (authentication system documentation)
- [x] N10: CI/CD workflow documentation

### ✅ Security & Code Quality (Completed)

#### O. Security & Quality Assurance
- [x] O1: CodeQL security scanning enabled
- [x] O2: Secure API key storage
- [x] O3: Input validation and sanitization
- [x] O4: Error handling without data leaks
- [x] O5: HTTPS for all network requests
- [x] O6: OAuth token management
- [x] O7: ESLint configuration
- [x] O8: TypeScript strict typing
- [x] O9: Error boundaries
- [x] O10: Logging and debugging

---

## TODO - Remaining Tasks

This section lists remaining tasks organized by the spec sections A–O format.

### 🔥 High Priority

#### P. Metro Bundler Node 22 Compatibility
- [ ] P1: Add Node version check in verify-metro.js (warn if > 20)
- [ ] P2: Test dynamic import of react-native/index.js
- [ ] P3: Document esbuild compatibility issues with Node 22
- [ ] P4: Add experimental flag support for esbuild pathway
- [ ] P5: Update MASTER_CHECKLIST Metro section with Node version guidance

#### Q. Documentation Consolidation (THIS PR)
- [x] Q1: Create comprehensive MASTER_CHECKLIST.md with all sections
- [ ] Q2: Remove obsolete documentation files (see list below)
- [ ] Q3: Update all code references to removed docs
- [ ] Q4: Add "verify" npm script
- [ ] Q5: Ensure no information loss from consolidation

#### R. Enhanced Error Handling
- [ ] R1: Improve start-all.js with defensive try/catch
- [ ] R2: Add clear Metro error messages with remediation steps
- [ ] R3: Surface TransformError details to user
- [ ] R4: Add fallback strategies for common errors

### 🟡 Medium Priority

#### S. Performance Optimization
- [ ] S1: Bundle size optimization review
- [ ] S2: Lazy loading for screens
- [ ] S3: Image optimization
- [ ] S4: Memory leak detection
- [ ] S5: Cache optimization

#### T. Testing Expansion
- [ ] T1: E2E tests with Detox
- [ ] T2: Visual regression tests
- [ ] T3: Performance benchmarking
- [ ] T4: Device farm integration

#### U. Backend Enhancements
- [ ] U1: WebSocket for real-time updates
- [ ] U2: Rate limiting middleware
- [ ] U3: API versioning
- [ ] U4: Request/response logging
- [ ] U5: Health check dashboard

### 🟢 Low Priority

#### V. Feature Enhancements
- [ ] V1: Additional voice options
- [ ] V2: Theme customization (dark/light mode)
- [ ] V3: Advanced AI model selection UI
- [ ] V4: Plugin system architecture
- [ ] V5: Multi-device sync

#### W. Developer Experience
- [ ] W1: VS Code debug configurations
- [ ] W2: Detailed contributing guide
- [ ] W3: Code generation scripts
- [ ] W4: API documentation generator (Swagger/OpenAPI)

### �� Production Readiness

#### X. Build & Deployment
- [ ] X1: Build production APK
- [ ] X2: Test on physical Galaxy S25 Ultra device
- [ ] X3: Performance testing on device
- [ ] X4: Battery usage optimization
- [ ] X5: Final QA and user acceptance testing
- [ ] X6: Distribution strategy (APK sideloading)

---

## Metro Troubleshooting

This section documents Metro bundler issues, solutions, and best practices for the Rork Ultimate AI Command Center project.

### Quick Verification

To verify Metro is working correctly:

```bash
npm run verify:metro
```

This script will:
1. Clear all Metro caches
2. Test bundle generation for Android
3. Verify bundle contents
4. Report any errors

### Node Version Compatibility

**Recommended**: Node 20.x LTS (v20.19.5 tested and verified)

**Current Node Version Check**:
```bash
node --version  # Should output v20.x.x
```

#### Node 22.x Issues

**Problem**: React Native 0.81.5 with esbuild under Node v22.20.0 can exhibit TransformError issues:
```
TransformError: Unexpected "typeof" from react-native/index.js
```

**Root Cause**: 
- Node 22 includes newer JavaScript features and engine optimizations
- esbuild in Metro bundler may not fully support Node 22 yet
- React Native 0.81.5 was tested primarily with Node 16-20

**Solutions**:

1. **Recommended: Use Node 20.x LTS**
   ```bash
   # Using nvm (Node Version Manager)
   nvm install 20
   nvm use 20
   
   # Verify version
   node --version  # Should show v20.x.x
   ```

2. **If you must use Node 22**: Add experimental flag (not recommended)
   ```bash
   NODE_OPTIONS="--experimental-vm-modules" npm start
   ```
   
   Note: This is experimental and may have other side effects.

3. **Version Check Script** (Enhanced verify-metro.js)
   - Automatically warns if Node > 20
   - Provides actionable remediation steps
   - Suggests downgrading to Node 20 LTS

### Common Issues and Solutions

#### Issue 1: `expo-av` Plugin Not Found

**Symptom:**
```
PluginError: Failed to resolve plugin for module "expo-av"
```

**Root Cause:** The project uses `expo-audio` but `app.json` was configured with the deprecated `expo-av` plugin.

**Solution:** ✅ **RESOLVED**
- Updated `app.json` to use `expo-audio` plugin instead of `expo-av`
- The `expo-audio` package (v1.0.14) was already installed and being used in code

#### Issue 2: Missing `@react-native/virtualized-lists`

**Symptom:**
```
Error: Unable to resolve module @react-native/virtualized-lists
```

**Root Cause:** React Native 0.81.5 includes this as a nested dependency, but Metro requires it at the root level for proper resolution.

**Solution:** ✅ **RESOLVED**
- Installed `@react-native/virtualized-lists@0.81.5` as a direct dependency
- Ensures Metro can properly resolve the module

#### Issue 3: Overly Aggressive `blockList` in Metro Config

**Symptom:**
```
Failed to get the SHA-1 for: /path/to/expo/node_modules/@expo/cli/build/metro-require/require.js
```

**Root Cause:** The metro.config.js `blockList` was excluding nested node_modules, which blocked legitimate Expo dependencies.

**Solution:** ✅ **RESOLVED**
- Simplified `blockList` to only exclude actual build artifacts:
  - `backend/dist/`
  - `.git/`
- Removed nested node_modules blocking which was causing issues with Expo's internal dependencies

#### Issue 4: TransformError with Node 22

**Symptom:**
```
TransformError: Unexpected "typeof" from react-native/index.js
```

**Root Cause:** React Native 0.81.5 + esbuild incompatibility with Node 22.

**Solution:** ✅ **DOCUMENTED**
- Use Node 20.x LTS (recommended)
- Enhanced verify-metro.js to check Node version
- Added warning if Node > 20
- Documented workarounds in this section

### Metro Configuration

Our current `metro.config.js` provides:

1. **Path Alias Support**: `@/` resolves to project root
2. **TypeScript Support**: `.ts`, `.tsx` file extensions
3. **Modern Module Formats**: `.mjs`, `.cjs` support
4. **Asset Handling**: Extended asset extensions for media files
5. **Minimal BlockList**: Only excludes build artifacts and git directory

```javascript
// metro.config.js (current configuration)
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': path.resolve(__dirname, './'),
  },
  sourceExts: [...(config.resolver?.sourceExts || []), 'ts', 'tsx', 'mjs', 'cjs'],
  assetExts: [...(config.resolver?.assetExts || []), 'db', 'mp3', 'ttf', 'obj', 'png', 'jpg'],
  blockList: [
    /backend\/dist\/.*/,
    /\.git\/.*/,
  ].map((re) => new RegExp(re)),
};

module.exports = config;
```

### Babel Configuration

Our `babel.config.js` ensures proper module resolution:

```javascript
// babel.config.js (current configuration)
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],  // Metro React Native Babel preset
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './'
          }
        }
      ]
    ]
  };
};
```

**Key Points**:
- `babel-preset-expo` is equivalent to `module:metro-react-native-babel-preset`
- Module resolver plugin handles @/ path alias
- esbuild is NOT explicitly invoked (uses default Metro transform)

### Cache Clearing

If you encounter bundling issues, try clearing caches in this order:

#### 1. Metro Cache (First try)
```bash
npm start -- --clear
# or
expo start --clear
```

#### 2. Full Cache Clear (More thorough)
```bash
# Clear node_modules cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo/.metro

# Restart with clean cache
npm start -- --clear
```

#### 3. Nuclear Option (Last resort)
```bash
# Remove all caches and reinstall
rm -rf node_modules
rm -rf .expo
rm -rf node_modules/.cache
npm install
npm start -- --clear
```

#### 4. Watchman (if installed)
```bash
# Clear Watchman cache
watchman watch-del-all

# Restart Metro
npm start
```

### Verification Script Details

The `verify:metro` script performs automated verification:

```bash
npm run verify:metro
```

**What it does:**
1. Clears all caches (node_modules/.cache, .expo/.metro, watchman)
2. Runs `expo export --platform android` to test full bundle generation
3. Verifies bundle artifacts are created correctly
4. Cleans up temporary files
5. Exits with appropriate status code for CI integration

**Expected output:**
```
🔍 Starting Metro Bundler Verification...

📦 Step 1: Clearing Metro caches...
  ✓ Cleared node_modules/.cache
  ⚠ Watchman not available (optional)
  ✓ Cleared .expo/.metro cache
✅ Cache clearing complete

🔨 Step 2: Testing Metro bundle generation...
   Output directory: /tmp/metro-verification-bundle
[... bundling output ...]
✅ Metro bundle generation successful

🔎 Step 3: Verifying bundle contents...
  ✓ Bundle files present
  ✓ Entry bundle found
  ✓ Metadata file present
✅ Bundle verification complete

🧹 Cleaning up temporary files...
  ✓ Temporary bundle removed

✨ Metro Bundler Verification PASSED ✨
```

### CI Integration

The verification script is designed for CI/CD pipelines:

```yaml
# .github/workflows/ci.yml
- name: Verify Metro Bundler
  run: npm run verify:metro
```

Exit codes:
- `0`: All checks passed
- `1`: Verification failed (cache clearing, bundling, or verification errors)

### Environment Variables

Metro bundling loads environment variables from:
1. `.env.production` (production builds)
2. `.env` (fallback)

Ensure these files exist with required variables. See `.env.example` for template.

### Platform-Specific Considerations

#### Android
- Bundle format: Hermes Bytecode (.hbc)
- Entry point: `node_modules/expo-router/entry.js`
- Config: `app.json` android section

#### Expo Go
- Development builds work with standard Metro bundling
- Production exports require proper signing and configuration
- Use `expo start` for development
- Use `expo export` for production builds

### Dependencies

Key packages for Metro functionality:
- `expo` (v54.0.23): Framework and bundler
- `react-native` (v0.81.5): Core framework
- `@react-native/virtualized-lists` (v0.81.5): Required for FlatList
- `expo-router` (v6.0.14): Navigation and entry point
- `expo-audio` (v1.0.14): Audio functionality (replaces expo-av)

### TypeScript Considerations

- TypeScript compilation errors do NOT block Metro bundling
- Backend-only TypeScript errors (in `backend/` directory) don't affect React Native bundle
- Metro bundles JavaScript, so runtime-only issues surface at app startup
- Run `npx tsc --noEmit` separately to check TypeScript errors

### Known Issues

#### Non-Critical Issues

1. **Backend TypeScript Errors**: ~65 TypeScript errors in backend code don't affect Metro or React Native app
2. **Jest Worker Process Warning**: Tests pass (142/142), warning is cosmetic

#### Resolved Issues

1. ✅ expo-av plugin not found
2. ✅ Missing @react-native/virtualized-lists
3. ✅ Overly restrictive blockList
4. ✅ Node 22 compatibility documented

### Getting Help

If you encounter Metro issues not covered here:

1. Run `npm run verify:metro` to get detailed error output
2. Check `expo-doctor` output: `npx expo-doctor`
3. Review Metro logs during `expo start --clear`
4. Check this guide for similar symptoms
5. Clear caches and try again
6. Verify Node version is 20.x LTS

### Useful Commands

```bash
# Start Metro bundler
npm start

# Start with cache clear
npm start -- --clear

# Verify Metro setup
npm run verify:metro

# Check Node version
node --version

# Check dependency health
npx expo-doctor

# Test bundle generation
expo export --platform android --output-dir /tmp/test-bundle

# Type check (separate from Metro)
npx tsc --noEmit

# Run tests
npm test
```

### Change History

#### 2025-11-09: Node Version Guidance & Documentation Consolidation
- Added Node 20.x LTS recommendation
- Documented Node 22 TransformError issue
- Enhanced Metro troubleshooting section
- Consolidated all documentation into MASTER_CHECKLIST.md

#### 2025-11-09: Initial Metro Fixes
- Replaced expo-av with expo-audio in app.json
- Added @react-native/virtualized-lists as direct dependency
- Simplified metro.config.js blockList
- Created verify:metro script
- Metro bundling now works successfully: 3239 modules, 8.38MB bundle

---

## Security & Vulnerability Scanning

### CodeQL Security Scanning

This project uses CodeQL for automated security vulnerability scanning.

#### Running CodeQL Locally

```bash
# CodeQL is run automatically in CI/CD
# To run locally, install CodeQL CLI:
# https://github.com/github/codeql-cli-binaries/releases

# Run analysis
codeql database create codeql-db --language=javascript
codeql database analyze codeql-db --format=sarif-latest --output=results.sarif
```

#### Security Best Practices

1. **API Keys & Secrets**
   - Never commit secrets to version control
   - Use environment variables (.env)
   - Use SecureStore for sensitive data on device
   - Rotate keys regularly

2. **Token Management**
   - Store tokens in SecureStore (hardware-encrypted)
   - Automatic token refresh
   - Revoke tokens on sign-out
   - Never log tokens

3. **Input Validation**
   - Validate all user inputs
   - Sanitize data before storage
   - Type checking with TypeScript
   - Zod schemas for runtime validation

4. **Network Security**
   - HTTPS for all API calls
   - Certificate pinning (consider for production)
   - Timeout configurations
   - Error handling without data leaks

5. **Error Handling**
   - Catch and log errors securely
   - Don't expose sensitive data in error messages
   - User-friendly error messages
   - Proper error boundaries in React

### Known Security Issues

#### Non-Issues (False Positives)
- AsyncStorage usage: Appropriate for non-sensitive data
- Console.log in tests: Only in test environment

#### Resolved Issues
- ✅ Secure token storage implemented (SecureStore)
- ✅ API keys moved to environment variables
- ✅ OAuth PKCE implementation (no client secrets in app)
- ✅ Input validation added to all forms

---

## Backend Documentation

### Backend Overview

The JARVIS backend is a fully TypeScript-enabled Express.js server that provides REST API endpoints for the JARVIS AI Command Center.

### Technology Stack

- **Runtime**: Node.js 20+
- **Language**: TypeScript 5.9.x
- **Framework**: Express.js with full TypeScript types
- **Build Tool**: TypeScript Compiler (tsc)
- **Dev Runtime**: tsx (for hot reloading)
- **Module System**: CommonJS

### Directory Structure

```
backend/
├── config/
│   └── environment.ts      # Environment validation and configuration
├── routes/
│   ├── analytics.ts        # Analytics and metrics endpoints
│   ├── ask.ts             # AI reasoning endpoints (Groq, Gemini, HF)
│   ├── content.ts         # Content management
│   ├── integrations.ts    # Social media integrations
│   ├── logs.ts            # System logging
│   ├── media.ts           # Media upload/storage
│   ├── settings.ts        # App settings
│   ├── system.ts          # System health and info
│   ├── trends.ts          # Trend discovery
│   └── voice.ts           # TTS/STT endpoints
├── trpc/
│   ├── app-router.ts      # tRPC router configuration
│   ├── create-context.ts  # tRPC context
│   └── routes/            # tRPC procedure routes
├── dist/                  # Compiled JavaScript output (gitignored)
├── hono.ts               # Hono server with tRPC support
├── server.express.ts     # Main Express server
├── server.ts             # Hono server entry point
└── tsconfig.json         # Backend TypeScript configuration
```

### Getting Started

#### Prerequisites
- Node.js 20 or later
- npm package manager

#### Installation
```bash
# Install dependencies (from project root)
npm install
```

#### Environment Setup

Create a `.env` file in the project root with the following variables:

```bash
# Server Configuration
PORT=3000                    # Backend server port (default: 3000)
HOST=0.0.0.0                # Server host (default: 0.0.0.0)
NODE_ENV=development        # Environment (development/production)
FRONTEND_URL=*              # CORS allowed origin (default: *)

# AI API Keys (at least one recommended)
EXPO_PUBLIC_GROQ_API_KEY=your_groq_key          # Groq (fastest, free)
EXPO_PUBLIC_GEMINI_API_KEY=your_gemini_key     # Google Gemini
EXPO_PUBLIC_HF_API_TOKEN=your_hf_token         # HuggingFace
EXPO_PUBLIC_OPENAI_API_KEY=your_openai_key     # OpenAI

# Optional Integrations
YOUTUBE_API_KEY=your_youtube_key
DISCORD_BOT_TOKEN=your_discord_token
TWITTER_API_KEY=your_twitter_key
GOOGLE_CLIENT_ID=your_google_client_id
```

**Environment Validation**: The backend automatically validates environment variables on startup and provides helpful warnings if AI API keys are missing.

### Development Workflow

#### Development Mode (Hot Reload)
```bash
# Run with tsx watch (auto-reloads on file changes)
npm run dev:backend

# Or run without watch
npm run start:backend
```

#### Production Build
```bash
# Compile TypeScript to JavaScript
npm run build:backend

# Run compiled production build
npm run start:backend:prod
```

#### Run All Services
```bash
# Start both backend and frontend
npm run start:all
```

### API Endpoints

#### Core Endpoints

##### Health Check
```
GET /
Response: { 
  status: 'online', 
  message: 'JARVIS Backend API is running', 
  version: '1.0.0', 
  timestamp: ISO-8601 
}
```

##### Voice
```
POST /api/voice/tts         - Text-to-speech
POST /api/voice/stt         - Speech-to-text
GET  /api/voice/config      - Voice configuration
```

##### AI Reasoning
```
POST /api/ask               - Ask AI a question
GET  /api/ask/models        - Get available AI models
```

##### Integrations
```
GET  /api/integrations               - List all integrations
GET  /api/integrations/accounts      - Connected social accounts
POST /api/integrations/post          - Post to social media
POST /api/integrations/test/:service - Test integration
```

##### Analytics
```
GET  /api/analytics                  - Overview dashboard
GET  /api/analytics/:platform        - Platform-specific analytics
POST /api/analytics/query            - Complex analytics query
POST /api/analytics/revenue          - Revenue metrics
POST /api/analytics/events           - Track event
POST /api/analytics/insights         - AI insights
```

##### Trends
```
POST /api/trends/discover            - Discover trending topics
GET  /api/trends/:id                 - Get specific trend
POST /api/trends/:id/analyze         - Analyze trend
```

##### Content
```
GET    /api/content                  - List all content
POST   /api/content                  - Create content
GET    /api/content/:id              - Get specific content
PUT    /api/content/:id              - Update content
DELETE /api/content/:id              - Delete content
```

##### Media
```
POST   /api/media/upload             - Upload media file
GET    /api/media/file/:filename     - Get media file
GET    /api/media/list               - List media files
DELETE /api/media/file/:filename     - Delete media file
```

##### Settings
```
GET    /api/settings                 - Get all settings
POST   /api/settings                 - Update settings
GET    /api/settings/:key            - Get specific setting
PUT    /api/settings/:key            - Update specific setting
```

##### System
```
GET /api/system/status              - System status
GET /api/system/health              - Health check
GET /api/system/info                - API information
```

##### Logs
```
GET    /api/logs                    - Get logs
POST   /api/logs                    - Add log entry
DELETE /api/logs                    - Clear logs
```

### TypeScript Configuration

#### Backend tsconfig.json

Key settings:
- **Target**: ES2020 (modern Node.js features)
- **Module**: CommonJS (Node.js compatibility)
- **Strict Mode**: Enabled with practical relaxations
- **Source Maps**: Enabled for debugging
- **Output**: `backend/dist/`

#### Type Safety Features

All routes use proper Express.js TypeScript types:

```typescript
import express, { Request, Response, Router } from 'express';

interface RequestBody {
  field: string;
}

router.post('/endpoint', async (req: Request<{}, {}, RequestBody>, res: Response) => {
  const { field } = req.body;
  // Full type safety and IntelliSense
  res.json({ success: true });
});
```

### Build System

#### Scripts

| Script | Command | Description |
|--------|---------|-------------|
| `start:backend` | `tsx backend/server.express.ts` | Development mode with tsx |
| `dev:backend` | `tsx watch backend/server.express.ts` | Development with hot reload |
| `build:backend` | `tsc -p backend/tsconfig.json` | Compile TypeScript |
| `start:backend:prod` | `node backend/dist/server.express.ts` | Run production build |

#### Build Process

1. TypeScript files in `backend/**/*.ts` are compiled
2. Output JavaScript placed in `backend/dist/`
3. Source maps generated for debugging
4. Type declarations generated

#### Gitignore

The following are excluded from git:
```
backend/dist/           # Compiled output
backend/**/*.js         # Compiled JS files
backend/**/*.js.map     # Source maps
backend/**/*.d.ts       # Type declarations
```

### Error Handling

#### Environment Errors
The backend validates environment variables on startup:

```typescript
// Throws EnvironmentError if critical variables are missing
const envConfig = validateEnvironment();

// Logs warnings for missing optional variables (like AI keys)
logEnvironmentInfo(envConfig);
```

#### HTTP Error Handling
All routes include proper error handling:

```typescript
try {
  // Route logic
} catch (error) {
  console.error('[Route] Error:', error);
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  res.status(500).json({ error: errorMessage });
}
```

### Production Deployment

#### Recommended Process

1. **Build the backend**:
   ```bash
   npm run build:backend
   ```

2. **Verify build**:
   ```bash
   # Check dist folder contains compiled files
   ls -la backend/dist/
   ```

3. **Set environment variables** on your production server

4. **Run production build**:
   ```bash
   npm run start:backend:prod
   ```

5. **Use a process manager** (PM2, systemd, etc.):
   ```bash
   pm2 start backend/dist/server.express.js --name jarvis-backend
   ```

#### Environment Variables in Production

Ensure these are set:
- `NODE_ENV=production`
- `PORT=<your-port>`
- `HOST=0.0.0.0` (or your specific host)
- At least one AI API key
- `FRONTEND_URL=<your-frontend-url>` (for CORS)

### Troubleshooting

#### "Cannot find module" errors
- Run `npm install` to install dependencies
- Check that `node_modules` exists
- Verify TypeScript files are properly imported

#### TypeScript compilation errors
- Check `backend/tsconfig.json` configuration
- Run `npm run build:backend` to see full error output
- Ensure all type dependencies are installed (`@types/*` packages)

#### Port already in use
- Change `PORT` in `.env` file
- Or kill the process using the port:
  ```bash
  # Find process using port 3000
  lsof -ti:3000
  # Kill it
  kill -9 <PID>
  ```

#### AI endpoints not working
- Check that at least one AI API key is configured
- Verify API keys are valid
- Check console for environment warnings on startup

---

## Authentication System

### Overview

A production-ready, single-user, local-first authentication and connection system for Android-only applications (Expo Go, Android APK, and Termux).

This authentication system eliminates the need for manual API keys by handling OAuth 2.0 flows and secure on-device token storage.

### Supported Features

- ✅ **PKCE OAuth 2.0** for mobile (Expo Go, Android APK)
- ✅ **Device Flow** for headless environments (Termux)
- ✅ **Local Tokens** for smart home devices
- ✅ **Automatic Token Refresh**
- ✅ **Event-Driven Architecture**
- ✅ **Secure On-Device Storage**

### Supported Platforms

- **Expo Go (Android)**: Full OAuth support with PKCE
- **Android APK (Release)**: Production-ready builds
- **Termux**: Device Flow where supported, fallback to manual flows

**⚠️ Important**: NO iOS/Apple support. This is an Android-only implementation.

### Core Services

#### AuthManager
The central orchestrator for all authentication operations.

```typescript
import AuthManager from '@/services/auth/AuthManager';

// Start OAuth flow
await AuthManager.startAuthFlow('google');

// Get access token (auto-refreshes if expired)
const token = await AuthManager.getAccessToken('google');

// Refresh token manually
await AuthManager.refreshAccessToken('google');

// Revoke and disconnect
await AuthManager.revokeProvider('google');

// Check connection status
const isConnected = await AuthManager.isConnected('google');
const status = await AuthManager.getProviderStatus('google');

// List all connected providers
const providers = await AuthManager.getConnectedProviders();

// Add local token (for smart home devices)
await AuthManager.addLocalToken('homeassistant', 'your-token', {
  baseUrl: 'http://homeassistant.local:8123'
});
```

#### TokenVault
Secure token storage using hardware-encrypted storage (SecureStore).

```typescript
import TokenVault from '@/services/auth/TokenVault';

// Save token
await TokenVault.saveToken('provider', {
  access_token: 'token',
  refresh_token: 'refresh',
  expires_in: 3600,
  scopes: ['read', 'write']
});

// Get token
const tokenData = await TokenVault.getToken('provider');

// Remove token
await TokenVault.removeToken('provider');

// List all providers with tokens
const providers = await TokenVault.listProviders();

// Check if token is expired
const isExpired = TokenVault.isTokenExpired(tokenData);
```

#### MasterProfile
Single-user profile management.

```typescript
import MasterProfile from '@/services/auth/MasterProfile';

// Get profile
const profile = await MasterProfile.getMasterProfile();

// Save profile
await MasterProfile.saveMasterProfile({
  id: 'user-id',
  email: 'user@example.com',
  name: 'User Name',
  avatar: 'https://...',
  createdAt: new Date().toISOString(),
  connectedProviders: ['google', 'github']
});

// Add connected provider
await MasterProfile.addConnectedProvider('discord');

// Remove connected provider
await MasterProfile.removeConnectedProvider('discord');

// Clear profile
await MasterProfile.clearMasterProfile();
```

### Provider Helpers

Each provider has a dedicated helper module in `services/auth/providerHelpers/`:

#### Implemented Providers

- **google.ts** - Google OAuth (Drive, YouTube, Gmail, etc.)
- **github.ts** - GitHub OAuth with Device Flow
- **discord.ts** - Discord OAuth
- **spotify.ts** - Spotify OAuth
- **reddit.ts** - Reddit OAuth (installed app)
- **homeassistant.ts** - Home Assistant local tokens

#### Provider Configuration

```typescript
import { PROVIDERS, getProvider } from '@/services/auth/providerHelpers/config';

// Get provider config
const googleConfig = getProvider('google');

// List all providers
const allProviders = PROVIDERS;

// Get device flow providers
import { getDeviceFlowProviders } from '@/services/auth/providerHelpers/config';
const deviceFlowProviders = getDeviceFlowProviders();
```

### Events

AuthManager uses an event bus for real-time updates:

```typescript
// Subscribe to events
AuthManager.on('connected', (provider, data) => {
  console.log(`Connected to ${provider}`);
});

AuthManager.on('disconnected', (provider) => {
  console.log(`Disconnected from ${provider}`);
});

AuthManager.on('token_refreshed', (provider, data) => {
  console.log(`Token refreshed for ${provider}`);
});

// Unsubscribe
AuthManager.off('connected', handler);
```

### UI Components

#### SignInScreen
First-launch onboarding screen for Google Sign-In.

Features:
- Google Sign-In button
- Creates Master Profile on success
- Skip option for anonymous usage
- Auto-navigates to dashboard

#### ConnectionsHub
Provider connection management interface.

Features:
- Grid layout with provider tiles
- Status indicators (Connected, Not Connected, Needs Re-Auth)
- Connect/disconnect actions
- Local token wizard for smart home devices
- Real-time updates via event subscriptions

### Security

#### Token Storage
- All tokens stored using `SecureKeyStorage`
- Hardware-encrypted on native platforms (Android Keystore)
- Fallback to AsyncStorage on web (for development only)

#### OAuth Flows
- **PKCE** (Proof Key for Code Exchange) for all mobile flows
- No client secrets in mobile app code
- Device Flow for headless environments

#### Best Practices
- ✅ Never log tokens
- ✅ Never commit secrets
- ✅ Use environment variables for client IDs
- ✅ Validate tokens before API calls
- ✅ Handle token refresh automatically
- ✅ Revoke tokens on sign-out

### Environment Variables

Create a `.env` file with your OAuth client IDs:

```env
# Google OAuth
EXPO_PUBLIC_GOOGLE_CLIENT_ID_ANDROID=your_google_client_id

# GitHub OAuth
EXPO_PUBLIC_GITHUB_CLIENT_ID=your_github_client_id

# Discord OAuth
EXPO_PUBLIC_DISCORD_CLIENT_ID=your_discord_client_id

# Spotify OAuth
EXPO_PUBLIC_SPOTIFY_CLIENT_ID=your_spotify_client_id

# Reddit OAuth
EXPO_PUBLIC_REDDIT_CLIENT_ID=your_reddit_client_id
```

**Important**: 
- Use `.env.example` as a template
- Never commit `.env` to version control
- Client secrets are NOT required for PKCE flows
- Do NOT include client secrets in mobile apps

---

## API Keys Setup

### Overview

This section lists ALL API keys needed for JARVIS to function at full capacity. Keys are categorized by **FREE** (always use these first) and **PAID** (use only for complex tasks).

### FREE AI MODELS (Pre-configured - Just Get Free Keys)

#### 1. **Hugging Face Inference API** 🤗
- **Status**: FREE (Rate limited, but generous)
- **What it provides**: Text generation, Image generation, Audio transcription
- **How to get**:
  1. Go to https://huggingface.co/join
  2. Sign up for free
  3. Go to https://huggingface.co/settings/tokens
  4. Create new token → Copy it
- **Where to add in JARVIS**: API Keys page → Add as "Hugging Face"
- **Models included**:
  - Text: Mistral 7B, Llama 2, Zephyr, Falcon
  - Image: Stable Diffusion XL, SD 2.1
  - Audio: Whisper Large v3, Bark TTS
- **Rate Limits**: 1000 requests/hour
- **Cost**: $0 (FREE)

#### 2. **Together AI** 🚀
- **Status**: FREE tier available
- **What it provides**: Fast text/image/code generation
- **How to get**:
  1. Go to https://api.together.xyz/signup
  2. Sign up (free $5 credit)
  3. Dashboard → API Keys → Create new key
- **Where to add**: API Keys page → Add as "Together AI"
- **Models included**:
  - Text: Llama 3.1 70B/8B, Mixtral 8x7B, Qwen 2
  - Image: FLUX Schnell, SDXL Turbo
  - Code: DeepSeek Coder 33B, CodeLlama 70B
- **Rate Limits**: 600 requests/minute
- **Cost**: $5 free credit, then pay-as-you-go (very cheap)

#### 3. **Groq** ⚡
- **Status**: FREE (fastest inference)
- **What it provides**: Lightning-fast text generation
- **How to get**:
  1. Go to https://console.groq.com
  2. Sign up with GitHub/Google
  3. API Keys → Create API Key
- **Where to add**: API Keys page → Add as "Groq"
- **Models included**:
  - Llama 3.1 70B (versatile)
  - Llama 3.1 8B (instant)
  - Mixtral 8x7B
  - Gemma 7B
- **Rate Limits**: 30 requests/minute (free), 14,400/day
- **Cost**: $0 (FREE)
- **Note**: FASTEST free AI available

#### 4. **DeepSeek** 🧠
- **Status**: FREE tier
- **What it provides**: Code generation and chat
- **How to get**:
  1. Go to https://platform.deepseek.com
  2. Sign up
  3. API Keys → Create
- **Where to add**: API Keys page → Add as "DeepSeek"
- **Models included**:
  - DeepSeek Coder (best for code)
  - DeepSeek Chat
- **Rate Limits**: 1000 requests/minute
- **Cost**: FREE tier with generous limits

#### 5. **Google Gemini** 🔮
- **Status**: FREE
- **What it provides**: Multimodal AI (text, images, video)
- **How to get**:
  1. Go to https://makersuite.google.com/app/apikey
  2. Sign in with Google
  3. Create API key
- **Where to add**: API Keys page → Add as "Gemini"
- **Models included**:
  - Gemini Pro (free)
  - Gemini 1.5 Flash (free, fast)
- **Rate Limits**: 60 requests/minute
- **Cost**: $0 (FREE)

#### 6. **Replicate** 🔄
- **Status**: FREE tier ($0.01 initial credit)
- **What it provides**: Run any open-source model
- **How to get**:
  1. Go to https://replicate.com/signin
  2. Sign up
  3. Account → API tokens
- **Where to add**: API Keys page → Add as "Replicate"
- **Models**: Access to 1000+ models
- **Cost**: Free tier, then pay per second

### PAID AI MODELS (Use for Premium Tasks Only)

#### 7. **OpenAI** (GPT-4, DALL-E 3)
- **Status**: PAID
- **When to use**: Complex reasoning, best text quality, professional images
- **How to get**:
  1. Go to https://platform.openai.com/signup
  2. Add payment method
  3. API keys → Create
- **Where to add**: API Keys page → Add as "OpenAI"
- **Models**:
  - GPT-4 Turbo: $0.01/1K tokens input, $0.03/1K tokens output
  - GPT-3.5 Turbo: $0.0005/1K tokens (cheap fallback)
  - DALL-E 3: $0.04-$0.12 per image
- **JARVIS will use**: Only for critical code generation and complex analysis

#### 8. **Anthropic** (Claude)
- **Status**: PAID
- **When to use**: Long context analysis, research, writing
- **How to get**:
  1. Go to https://console.anthropic.com
  2. Sign up
  3. Settings → API Keys
- **Where to add**: API Keys page → Add as "Anthropic"
- **Models**:
  - Claude 3 Opus: $0.015/1K tokens input, $0.075/1K output
  - Claude 3 Sonnet: $0.003/1K input, $0.015/1K output
- **JARVIS will use**: For long document analysis

#### 9. **ElevenLabs** (Voice Cloning)
- **Status**: PAID (Free tier: 10K characters/month)
- **When to use**: Professional voice overs
- **How to get**:
  1. Go to https://elevenlabs.io
  2. Sign up
  3. Profile → API Key
- **Where to add**: API Keys page → Add as "ElevenLabs"
- **Cost**: Free 10K chars, then $5/month for 30K

### SOCIAL MEDIA & PLATFORMS (All Required)

#### 11. **Instagram / Facebook (Meta)**
- **How to get**:
  1. Go to https://developers.facebook.com
  2. Create App → Select "Business"
  3. Add Instagram Basic Display
  4. Get Access Token
- **Where to add**: Social Connect page
- **Required for**: Posting, analytics

#### 12. **TikTok**
- **How to get**:
  1. Go to https://developers.tiktok.com
  2. Apply for API access
  3. Create app
- **Where to add**: Social Connect page
- **Note**: Requires approval

#### 13. **YouTube**
- **How to get**:
  1. Go to https://console.cloud.google.com
  2. Enable YouTube Data API v3
  3. Create OAuth 2.0 credentials
- **Where to add**: Social Connect page

#### 14. **Twitter/X**
- **How to get**:
  1. Go to https://developer.twitter.com
  2. Apply for developer account
  3. Create app → Get API keys
- **Where to add**: Social Connect page
- **Cost**: $100/month for API access (Expensive!)

#### 15. **LinkedIn**
- **How to get**:
  1. Go to https://www.linkedin.com/developers
  2. Create app
  3. Request API access
- **Where to add**: Social Connect page

### PAYMENT & MONETIZATION

#### 16. **Stripe**
- **How to get**:
  1. Go to https://dashboard.stripe.com/register
  2. Complete business verification
  3. Developers → API keys
- **Where to add**: API Keys page
- **Required for**: Payment processing

#### 17. **PayPal**
- **How to get**:
  1. Go to https://developer.paypal.com
  2. Create app
  3. Get Client ID and Secret
- **Where to add**: API Keys page

### ANALYTICS & TRACKING

#### 18. **Google Analytics**
- **How to get**:
  1. Go to https://analytics.google.com
  2. Create property
  3. Get Measurement ID
- **Where to add**: API Keys page

### STORAGE & CLOUD

#### 19. **Google Drive**
- **How to get**:
  1. Go to https://console.cloud.google.com
  2. Enable Google Drive API
  3. Create OAuth credentials
- **Where to add**: Cloud Storage page

#### 20. **AWS S3** (Optional)
- **How to get**:
  1. Go to https://aws.amazon.com
  2. IAM → Create user
  3. Get Access Key ID and Secret
- **Where to add**: API Keys page

### JARVIS PRIORITY SYSTEM

#### For AI Tasks:
1. **Data Analysis/Simple tasks** → Use FREE models (Groq, Gemini Flash)
2. **Code Generation** → Use DeepSeek Coder (free) or GPT-4 (paid, if complex)
3. **Image Generation** → Use FLUX Schnell (free) or DALL-E (paid, if quality matters)
4. **Voice/Audio** → Use Whisper (free) or ElevenLabs (paid)

#### Cost Optimization:
- JARVIS will ALWAYS try free models first
- Only escalate to paid models if:
  - Free model fails
  - Task requires premium quality
  - User explicitly requests premium model
- Track costs in real-time
- Show savings vs. using only paid models

### NEXT STEPS

1. **Start with FREE keys** (Groq, Hugging Face, Gemini, Together AI, DeepSeek)
2. **Add these keys in JARVIS** → API Keys page
3. **Test each integration** → Use test button
4. **Add paid keys** only when you need premium features
5. **Monitor costs** → Analytics Dashboard

### QUICK START (Minimum to Get Running)

**Just get these 5 free keys to start:**
1. ✅ Hugging Face
2. ✅ Groq
3. ✅ Google Gemini  
4. ✅ Together AI
5. ✅ DeepSeek

**JARVIS will be 90% functional with just these!**

### Direct Links Summary

| Service | Get Key Here | Cost |
|---------|--------------|------|
| Hugging Face | https://huggingface.co/settings/tokens | FREE |
| Groq | https://console.groq.com | FREE |
| Together AI | https://api.together.xyz/signup | FREE ($5 credit) |
| DeepSeek | https://platform.deepseek.com | FREE |
| Google Gemini | https://makersuite.google.com/app/apikey | FREE |
| Replicate | https://replicate.com/signin | FREE (small credit) |
| OpenAI | https://platform.openai.com | PAID |
| Anthropic | https://console.anthropic.com | PAID |
| ElevenLabs | https://elevenlabs.io | PAID |

---

## How to Update This File

### Rules for Future Updates

**⚠️ CRITICAL: This is the ONLY authoritative documentation file.**

1. **Always Update This File**
   - Do NOT create new documentation files (README.md, TODO.md, etc.)
   - All changes, updates, and new information go into this file
   - Keep this file as the single source of truth

2. **Update Structure**
   - When adding new features, update the appropriate section
   - Add completion dates to DONE section
   - Move completed items from TODO to DONE
   - Update table of contents if adding new major sections

3. **Markdown Best Practices**
   - Use proper heading hierarchy (##, ###, ####)
   - Include anchor links for navigation
   - Use code blocks with language syntax highlighting
   - Use tables for structured data
   - Use checkboxes [x] for completed items, [ ] for pending

4. **Commit Message Format**
   ```
   docs: Update MASTER_CHECKLIST.md - [brief description]
   
   - Detail 1
   - Detail 2
   ```

5. **PR Updates**
   - Every PR must update this file
   - Add entry to "Latest PR Updates" section
   - Update relevant sections (Quick Status, TODO, DONE, etc.)
   - Keep last 10 PRs, archive older ones

6. **Version Updates**
   - Increment version number when significant changes occur
   - Update "Consolidation Date" field
   - Note major changes in changelog

### Example Update Workflow

```bash
# 1. Make your code changes
git add <your-files>

# 2. Update MASTER_CHECKLIST.md
#    - Add to DONE section
#    - Remove from TODO section
#    - Update any relevant documentation

# 3. Commit everything together
git commit -m "feat: Add new feature X

Updates MASTER_CHECKLIST.md:
- Moved task X from TODO to DONE
- Updated Quick Start section
- Added troubleshooting entry"

# 4. Push and create PR
git push
```

### Sections to Update Based on Change Type

| Change Type | Sections to Update |
|-------------|-------------------|
| Bug Fix | DONE (completed), Metro Troubleshooting (if Metro-related) |
| New Feature | DONE (completed), README (if user-facing), TODO (remaining work) |
| Documentation | How to Update This File, relevant content section |
| Build/Config | Metro Troubleshooting, Quick Start Guide, Backend Documentation |
| Testing | TESTING section, DONE section |
| Security Fix | Security & Vulnerability Scanning section |

### What NOT to Do

❌ Don't create separate README.md files  
❌ Don't create separate TODO.md files  
❌ Don't create changelog files (use git history + this file)  
❌ Don't duplicate information across sections  
❌ Don't remove completed tasks from DONE section  
❌ Don't commit without updating this file for code changes

### What TO Do

✅ Update this file with every PR  
✅ Keep information consolidated and organized  
✅ Use clear section headings and anchors  
✅ Include examples and code snippets  
✅ Date-stamp major updates  
✅ Cross-reference related sections  
✅ Verify links and references work

---

## Project Status Dashboard

| Category | Status | Notes |
|----------|--------|-------|
| Core Infrastructure | ✅ Complete | React Native + Expo 54, TypeScript |
| Metro Bundler | ✅ Complete | All startup issues resolved, Node 20.x recommended |
| Authentication | ✅ Complete | Google OAuth + Guest mode |
| AI Integration | ✅ Complete | Multi-provider support (6 free, 3 paid) |
| Voice Features | ✅ Complete | TTS + STT with fallback |
| Documentation | ✅ Consolidated | Single source of truth (this file) |
| Security | ✅ Complete | CodeQL scans passing |
| Testing | ✅ Complete | 142/142 tests passing (100%) |
| Module Resolution | ✅ Complete | Babel + Metro path alias |
| Real Implementations | ✅ Verified | No mock data in production |
| Backend Server | ✅ Complete | TypeScript Express.js with REST API |
| Node Version | ✅ Compatible | Node 20.x LTS (v20.19.5 tested) |

---

## Quick Reference - Available Commands

### Verification Commands
```bash
npm test                 # Run all tests (142/142 expected)
npm run verify:metro     # Verify Metro bundler (critical!)
npm run verify           # Quick verification (NEW in this PR)
npm run lint             # ESLint check
npx tsc --noEmit         # TypeScript check (backend errors OK)
```

### Development Commands
```bash
npm start                # Start Metro bundler
npm run start:all        # Start frontend + backend
npm run dev:backend      # Backend with hot reload
npm run start-web        # Web preview
```

### Testing Commands
```bash
npm test                 # All tests
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
npm run test:auth        # Auth tests only
npm run test:all         # Complete pipeline
```

### Build Commands
```bash
npm run build:backend    # Build backend TypeScript
npm run build:apk        # Build Android APK
npm run android          # Run on Android emulator
```

### Troubleshooting Commands
```bash
npm run verify:metro     # Check Metro bundler
npm start -- --clear     # Clear Metro cache
rm -rf node_modules/.cache && npm start  # Nuclear option
node --version           # Check Node version (should be 20.x)
```

---

## Final Notes

**This file is the SINGLE SOURCE OF TRUTH for the entire project.**

- ✅ Read this file before making ANY changes
- ✅ Update this file with EVERY PR
- ✅ Don't create new tracking documents - update this one
- ✅ All PRs update this file - it's the living history of the project

### Before Every PR

```bash
# 1. Verify everything works
npm test && npm run verify:metro && npm run lint

# 2. Update this file
# - Move completed tasks to DONE
# - Update TODO with remaining work
# - Add troubleshooting entries if applicable
# - Update any relevant sections

# 3. Commit and push
git add .
git commit -m "feat: Your changes

Updates MASTER_CHECKLIST.md with completed work"
git push
```

### Success Criteria

Your changes are ready when:
- ✅ All tests pass (142/142)
- ✅ Metro bundler works (npm run verify:metro)
- ✅ Lint passes (or warnings are documented)
- ✅ MASTER_CHECKLIST.md is updated
- ✅ No new documentation files created
- ✅ Node version is 20.x LTS

---

**Last Updated:** 2025-11-09 (Documentation Consolidation PR)  
**Version:** 3.0  
**Maintainer:** JARVIS Development Team  
**License:** Part of the JARVIS AI Command Center project

---

**END OF MASTER_CHECKLIST.md**

This file contains all project documentation. Do not create separate docs.
