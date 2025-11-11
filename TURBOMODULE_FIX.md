# Expo Hermes TurboModule Fix Documentation

## Problem Overview

The Jarvis system was experiencing the following error when running the Expo Go frontend:

```
Invariant Violation: TurboModuleRegistry.getEnforcing(...): 'PlatformConstants' could not be found.
```

This error indicates that the Hermes runtime is trying to load a TurboModule from React Native, but the module is not properly linked or cached data is stale.

## Root Cause

The issue occurs when:
1. Metro bundler cache contains outdated module information
2. `.expo` and `.expo-shared` directories have stale native module references
3. Native modules haven't been properly rebuilt after dependency changes
4. Hermes engine isn't explicitly configured in the project

## Solution Implemented

### 1. Hermes Engine Configuration

**File:** `app.json`

Added explicit Hermes engine configuration to the Android settings:

```json
{
  "expo": {
    "android": {
      "jsEngine": "hermes"
    }
  }
}
```

This ensures that Expo uses the Hermes JavaScript engine for Android builds, which provides better performance and smaller bundle sizes.

### 2. Cache Reset Script

**File:** `scripts/reset-cache.sh`

Created an automated script that performs a complete cache cleanup and rebuild:

```bash
#!/usr/bin/env bash
# Removes all caches and rebuilds the project
rm -rf node_modules .expo .expo-shared
npm install
npx expo prebuild --clean
npx expo start -c
```

**Usage:**
```bash
./scripts/reset-cache.sh
# or
npm run reset:cache
```

### 3. Native Module Sanity Check

**File:** `scripts/check-native-mods.js`

Created a diagnostic script that verifies TurboModule linking:

```javascript
// Checks if PlatformConstants can be imported
// Verifies React Native installation
// Provides clear error messages and fix instructions
```

**Usage:**
```bash
node scripts/check-native-mods.js
# or
npm run check:native-mods
```

### 4. Enhanced Error Detection

**File:** `scripts/start-all.js`

Enhanced the unified launcher to automatically detect TurboModule errors in real-time and provide actionable guidance:

- Monitors both stdout and stderr for TurboModule errors
- Displays clear, formatted error messages
- Suggests running the reset script
- Gracefully shuts down all services on error

### 5. Package.json Scripts

Added convenient npm scripts:

```json
{
  "scripts": {
    "check:native-mods": "node scripts/check-native-mods.js",
    "reset:cache": "./scripts/reset-cache.sh"
  }
}
```

## Version Compatibility

The project uses:
- **Expo SDK:** 54.0.23
- **React Native:** 0.76.3 (New Architecture)
- **React:** 19.0.0

These versions are compatible. Expo SDK 54 officially supports React Native 0.76.x with the New Architecture enabled.

## How to Fix TurboModule Errors

### Quick Fix (Recommended)

```bash
npm run reset:cache
```

This will:
1. Remove all cached data
2. Reinstall dependencies
3. Rebuild native modules
4. Start Metro with clean cache

### Manual Fix

If the automated script doesn't work, follow these steps:

```bash
# 1. Clean all caches
rm -rf node_modules .expo .expo-shared
rm -rf ~/.expo
rm -rf $TMPDIR/metro-* $TMPDIR/haste-*

# 2. Reinstall dependencies
npm install

# 3. Verify React Native installation
npm run check:native-mods

# 4. Rebuild native modules
npx expo prebuild --clean

# 5. Start with clean cache
npx expo start -c
```

### Verifying the Fix

After running the fix, verify that:

1. **Metro bundler starts without errors:**
   ```
   ✅ Expo Metro running in Safe Termux CJS mode
   ```

2. **No TurboModule errors in the console**

3. **Native modules sanity check passes:**
   ```bash
   npm run check:native-mods
   ```

4. **Expo Go app loads successfully without red screen errors**

## Prevention

To prevent TurboModule errors in the future:

1. **After updating dependencies:**
   ```bash
   npm run reset:cache
   ```

2. **After switching branches:**
   ```bash
   npx expo start -c
   ```

3. **If experiencing unexplained errors:**
   ```bash
   npm run check:native-mods  # Diagnose the issue
   npm run reset:cache        # Fix the issue
   ```

## Troubleshooting

### Error: "expo command not found"

```bash
npm install -g expo-cli
# or
npx expo --version
```

### Error: Permission denied when running reset-cache.sh

```bash
chmod +x scripts/reset-cache.sh
```

### Error persists after cache reset

1. Check Node.js version (must be >= 20.0.0 < 23.0.0):
   ```bash
   node --version
   ```

2. Verify you're using the correct React Native version:
   ```bash
   npm list react-native --depth=0
   ```

3. Try running prebuild manually with more verbose output:
   ```bash
   npx expo prebuild --clean --platform android
   ```

4. Check for conflicting global packages:
   ```bash
   npm list -g --depth=0
   ```

## Additional Resources

- [Expo SDK 54 Release Notes](https://expo.dev/changelog/2024/)
- [React Native 0.76 Release Notes](https://reactnative.dev/blog/2024/11/25/release-0.76)
- [Hermes Engine Documentation](https://hermesengine.dev/)
- [TurboModules Documentation](https://reactnative.dev/docs/the-new-architecture/pillars-turbomodules)

## Summary

The fix involves:
1. ✅ Explicitly enabling Hermes engine in `app.json`
2. ✅ Creating automated cache reset tooling
3. ✅ Adding sanity check scripts for diagnostics
4. ✅ Enhancing error detection in the start script
5. ✅ Providing clear documentation and usage instructions

All tools are now integrated into the project and accessible via npm scripts for easy maintenance and troubleshooting.
