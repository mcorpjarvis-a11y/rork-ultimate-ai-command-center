# Metro Bundler Troubleshooting Guide

This guide documents common Metro bundler issues and their resolutions for the Rork Ultimate AI Command Center project.

## Quick Start

To verify Metro is working correctly:

```bash
npm run verify:metro
```

This script will:
1. Clear all Metro caches
2. Test bundle generation for Android
3. Verify bundle contents
4. Report any errors

## Common Issues and Solutions

### Issue 1: `expo-av` Plugin Not Found

**Symptom:**
```
PluginError: Failed to resolve plugin for module "expo-av"
```

**Root Cause:** The project uses `expo-audio` but `app.json` was configured with the deprecated `expo-av` plugin.

**Solution:** ✅ **RESOLVED**
- Updated `app.json` to use `expo-audio` plugin instead of `expo-av`
- The `expo-audio` package was already installed and being used in code

### Issue 2: Missing `@react-native/virtualized-lists`

**Symptom:**
```
Error: Unable to resolve module @react-native/virtualized-lists
```

**Root Cause:** React Native 0.81.5 includes this as a nested dependency, but Metro requires it at the root level for proper resolution.

**Solution:** ✅ **RESOLVED**
- Installed `@react-native/virtualized-lists@0.81.5` as a direct dependency
- This ensures Metro can properly resolve the module

### Issue 3: Overly Aggressive `blockList` in Metro Config

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

## Metro Configuration

Our current `metro.config.js` provides:

1. **Path Alias Support**: `@/` resolves to project root
2. **TypeScript Support**: `.ts`, `.tsx` file extensions
3. **Modern Module Formats**: `.mjs`, `.cjs` support
4. **Asset Handling**: Extended asset extensions for media files
5. **Minimal BlockList**: Only excludes build artifacts and git directory

## Cache Clearing

If you encounter bundling issues, try clearing caches in this order:

### 1. Metro Cache (First try)
```bash
npm start -- --clear
# or
expo start --clear
```

### 2. Full Cache Clear (More thorough)
```bash
# Clear node_modules cache
rm -rf node_modules/.cache

# Clear Expo cache
rm -rf .expo/.metro

# Restart with clean cache
npm start -- --clear
```

### 3. Nuclear Option (Last resort)
```bash
# Remove all caches and reinstall
rm -rf node_modules
rm -rf .expo
rm -rf node_modules/.cache
npm install
npm start -- --clear
```

## Watchman Issues

If you have Watchman installed and experiencing file watching issues:

```bash
# Clear Watchman cache
watchman watch-del-all

# Restart Metro
npm start
```

## Verification Script

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
✨ Metro Bundler Verification PASSED ✨
```

## CI Integration

The verification script is designed for CI/CD pipelines:

```yaml
- name: Verify Metro Bundler
  run: npm run verify:metro
```

Exit codes:
- `0`: All checks passed
- `1`: Verification failed (cache clearing, bundling, or verification errors)

## Environment Variables

Metro bundling loads environment variables from:
1. `.env.production` (production builds)
2. `.env` (fallback)

Ensure these files exist with required variables. See `.env.example` for template.

## Platform-Specific Considerations

### Android
- Bundle format: Hermes Bytecode (.hbc)
- Entry point: `node_modules/expo-router/entry.js`
- Config: `app.json` android section

### Expo Go
- Development builds work with standard Metro bundling
- Production exports require proper signing and configuration
- Use `expo start` for development
- Use `expo export` for production builds

## Dependencies

Key packages for Metro functionality:
- `expo` (v54.0.23): Framework and bundler
- `react-native` (v0.81.5): Core framework
- `@react-native/virtualized-lists` (v0.81.5): Required for FlatList
- `expo-router` (v6.0.14): Navigation and entry point
- `expo-audio` (v1.0.14): Audio functionality (replaces expo-av)

## TypeScript Considerations

- TypeScript compilation errors do NOT block Metro bundling
- Backend-only TypeScript errors (in `backend/` directory) don't affect React Native bundle
- Metro bundles JavaScript, so runtime-only issues surface at app startup
- Run `npx tsc --noEmit` separately to check TypeScript errors

## Known Issues

### Non-Critical Issues

1. **Backend TypeScript Errors**: ~65 TypeScript errors in backend code don't affect Metro or React Native app
2. **Jest Native Module Mocks**: Some tests fail due to missing native module mocks (not Metro related)

### Resolved Issues

1. ✅ expo-av plugin not found
2. ✅ Missing @react-native/virtualized-lists
3. ✅ Overly restrictive blockList

## Getting Help

If you encounter Metro issues not covered here:

1. Run `npm run verify:metro` to get detailed error output
2. Check `expo-doctor` output: `npx expo-doctor`
3. Review Metro logs during `expo start --clear`
4. Check this guide for similar symptoms
5. Clear caches and try again

## Useful Commands

```bash
# Start Metro bundler
npm start

# Start with cache clear
npm start -- --clear

# Verify Metro setup
npm run verify:metro

# Check dependency health
npx expo-doctor

# Test bundle generation
expo export --platform android --output-dir /tmp/test-bundle

# Type check (separate from Metro)
npx tsc --noEmit

# Run tests
npm test
```

## Change History

### 2025-11-09: Initial Metro Fixes
- Replaced expo-av with expo-audio in app.json
- Added @react-native/virtualized-lists as direct dependency
- Simplified metro.config.js blockList
- Created verify:metro script
- Metro bundling now works successfully: 3239 modules, 8.38MB bundle
