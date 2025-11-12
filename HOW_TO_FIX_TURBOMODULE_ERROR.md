# How to Fix TurboModule PlatformConstants Error

## 🔄 Just Reverted Branches?

If you just went back a few branches/merges and now have this error, **[see AFTER_REVERT_RECOVERY.md](./AFTER_REVERT_RECOVERY.md)** for the quickest fix!

**TL;DR:** Run this command:
```bash
npm run quickstart
```

---

## The Error

If you're seeing this error:

```
Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'PlatformConstants' could not be found.
```

**Don't worry!** The fix is already in place in this branch. You just need to apply it.

## Quick Fix (Takes 2-5 minutes)

### After Reverting Branches
If you just reverted branches, use the smart recovery script:

```bash
npm run quickstart
```

This automatically detects and fixes only what's needed.

### General TurboModule Errors
For general TurboModule errors, run:

```bash
npm run reset:cache
```

Both commands will automatically:
1. Clear all caches (Metro, Expo, node_modules)
2. Reinstall dependencies
3. Rebuild native modules
4. Start Metro with a clean cache

## What This Fix Does

The error occurs because:
- Metro bundler has cached outdated module information
- Native modules need to be rebuilt after dependency changes
- Hermes engine configuration needs to be properly set

This branch already includes:
1. ✅ Hermes engine configuration in `app.json`
2. ✅ New Architecture enabled
3. ✅ Automated cache reset script
4. ✅ Diagnostic tools to verify the fix

## Step-by-Step Instructions

### Option 1: Automated Fix (Recommended)

```bash
npm run reset:cache
```

Wait for the script to complete and Metro to start.

### Option 2: Manual Fix

If the automated script doesn't work:

```bash
# 1. Clean everything
rm -rf node_modules .expo .expo-shared
rm -rf ~/.expo

# 2. Reinstall dependencies
npm install

# 3. Verify configuration
npm run check:native-mods

# 4. Rebuild native modules
npx expo prebuild --clean

# 5. Start with clean cache
npx expo start -c
```

## Verify the Fix

After running the fix, verify that:

1. **Metro starts without errors**
   ```
   ✅ Expo Metro running
   ```

2. **No TurboModule errors in console**

3. **Configuration check passes**
   ```bash
   npm run check:native-mods
   # Should show: ✅ All checks passed
   ```

4. **App loads in Expo Go without red screen errors**

## Why Did This Happen?

When you switched branches or updated dependencies, the Metro cache and native modules became out of sync with the new configuration. This is a common issue in React Native development, especially when:
- Switching between branches
- Updating React Native or Expo versions
- Changing native module configurations

## Prevention

To prevent this error in the future:

**After switching branches:**
```bash
npx expo start -c
```

**After updating dependencies:**
```bash
npm run reset:cache
```

**If you see unexplained errors:**
```bash
npm run check:native-mods  # Diagnose
npm run reset:cache        # Fix
```

## Still Having Issues?

If the error persists:

1. **Check Node.js version** (must be 20.x - 22.x):
   ```bash
   node --version
   ```

2. **Check React Native version**:
   ```bash
   npm list react-native --depth=0
   # Should show: 0.76.3
   ```

3. **Check for conflicting global packages**:
   ```bash
   npm list -g --depth=0
   ```

4. **Try running prebuild with verbose output**:
   ```bash
   npx expo prebuild --clean --platform android
   ```

## Summary

The fix is already in this branch. You just need to:
1. Run `npm run reset:cache`
2. Wait for Metro to start
3. Open your app in Expo Go

That's it! The error should be gone.

## Technical Details

For more information about the fix, see [TURBOMODULE_FIX.md](./TURBOMODULE_FIX.md).
