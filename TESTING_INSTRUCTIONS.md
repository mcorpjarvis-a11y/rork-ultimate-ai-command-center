# Testing Instructions for TurboModule Fix

## Prerequisites
- Node.js >= 20.0.0 < 23.0.0
- Android device or emulator with Expo Go installed
- Termux environment (if testing on Termux)

## Testing Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Test the Sanity Check Script
```bash
npm run check:native-mods
```
**Expected:** Should verify React Native installation (may show warnings in Node env, normal)

### 3. Test the Cache Reset Script (Optional - for thorough testing)
```bash
npm run reset:cache
```
**Expected:** 
- Removes all caches
- Reinstalls dependencies
- Runs expo prebuild --clean
- Starts Metro bundler with clean cache

**Note:** This will take several minutes and requires dependencies to be installed.

### 4. Start the Complete System
```bash
npm run start:all
```

**Expected Output:**
```
🚀 ════════════════════════════════════════════════════════════
🚀   JARVIS UNIFIED LAUNCHER
🚀   Starting Complete AI Command Center
🚀 ════════════════════════════════════════════════════════════

📡 Building Backend Server...
✅ Backend build completed!
📡 Starting Backend Server...
[BACKEND] Server listening on port 3000

📱 Starting Frontend (Expo)...
�� Clearing Metro cache for clean startup...
✅ Expo Metro running in Safe Termux CJS mode

[FRONTEND] Metro waiting on exp://...

✅ ════════════════════════════════════════════════════════════
✅   ALL SYSTEMS ONLINE - JARVIS Ready
✅ ════════════════════════════════════════════════════════════
```

### 5. Load App in Expo Go

1. Open Expo Go app on your Android device
2. Scan the QR code shown in the terminal
3. Wait for the app to load

**Expected:** App loads successfully without any red error screen

**Previous Error (should NOT appear):**
```
❌ Invariant Violation: TurboModuleRegistry.getEnforcing(...): 
   'PlatformConstants' could not be found.
```

### 6. Verify Hermes is Enabled

Once the app loads, you can verify Hermes is running by checking the logs:
```bash
# Look for Hermes-related messages in the console
# Hermes provides better performance and smaller bundle sizes
```

### 7. Test Error Detection (Optional)

If you want to verify the error detection works:

1. Temporarily introduce a TurboModule error (for testing only)
2. Run `npm run start:all`
3. Observe that the script detects the error and provides clear instructions

**Expected Error Detection Output:**
```
❌ ════════════════════════════════════════════════════════════
❌   TURBOMODULE ERROR DETECTED
❌   React Native TurboModules are not properly linked
❌ ════════════════════════════════════════════════════════════

�� This usually means caches need to be cleared or versions misaligned.

🔧 To fix this, run:
   ./scripts/reset-cache.sh

   Or manually:
   1. rm -rf node_modules .expo .expo-shared
   2. npm install
   3. npx expo prebuild --clean
   4. npx expo start -c
```

## Validation Checklist

- [ ] Dependencies installed successfully
- [ ] `npm run check:native-mods` runs without fatal errors
- [ ] Backend builds successfully
- [ ] Backend server starts on port 3000
- [ ] Metro bundler starts and shows QR code
- [ ] No TurboModule errors in console
- [ ] App loads in Expo Go without red error screen
- [ ] App is responsive and interactive
- [ ] Hermes engine is confirmed enabled

## Troubleshooting

### If TurboModule errors still occur:

```bash
# Run the automated fix
npm run reset:cache

# Or follow manual steps in TURBOMODULE_FIX.md
```

### If dependencies fail to install:

```bash
# Check Node version
node --version  # Should be >= 20.0.0 < 23.0.0

# Clear npm cache
npm cache clean --force
npm install
```

### If Metro bundler won't start:

```bash
# Verify Metro config
npm run verify:metro

# Clear Metro cache manually
rm -rf ~/.expo
rm -rf $TMPDIR/metro-*
npm start -- --clear
```

## Documentation

For detailed information, see:
- [TURBOMODULE_FIX.md](./TURBOMODULE_FIX.md) - Complete fix documentation
- [QUICKSTART.md](./QUICKSTART.md) - General troubleshooting
- [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md) - Project status

## Success Criteria

✅ **The fix is successful if:**
1. Metro bundler starts without TurboModule errors
2. App loads in Expo Go without red error screens
3. No "PlatformConstants could not be found" errors appear
4. App is fully functional and responsive
5. Hermes engine is confirmed enabled

## Reporting Issues

If problems persist:
1. Run `npm run check:native-mods` and save output
2. Run `npm run start:all` and save full console output
3. Check app.json has `"jsEngine": "hermes"` under android
4. Verify versions: Expo SDK 54 + React Native 0.76.3
5. Report with all outputs and version information
