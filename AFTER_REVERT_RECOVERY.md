# 🔄 After Reverting Branches - Quick Recovery Guide

## The Problem You're Having

You went back a few branches/merges and now when you run Metro, you're getting this error:

```
Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'PlatformConstants' could not be found.
```

**This is a common issue after reverting branches!** Here's why it happens and how to fix it.

---

## 🚀 QUICKEST FIX (One Command)

Just run this command and it will automatically detect and fix everything:

```bash
npm run quickstart
```

This intelligent script will:
- ✅ Detect what's broken (missing dependencies, stale caches, etc.)
- ✅ Show you exactly what it will fix
- ✅ Ask for confirmation before making changes
- ✅ Fix everything automatically
- ✅ Validate the fix worked

**Time:** 2-5 minutes depending on your internet speed

---

## 🔧 Alternative Fixes

### Option 1: Comprehensive TurboModule Fix
If `npm run quickstart` doesn't fully resolve the issue:

```bash
npm run fix:turbomodule
```

This does a deeper fix including native module rebuild.

### Option 2: Simple Cache Reset
If you just need to clear caches:

```bash
npm run reset:cache
```

### Option 3: Manual Fix (If Scripts Don't Work)

```bash
# 1. Clean everything
rm -rf node_modules .expo .expo-shared ~/.expo

# 2. Reinstall dependencies
npm install

# 3. Clear Metro cache and start
npx expo start -c
```

---

## ❓ Why Does This Happen?

When you revert branches or go back to previous commits:

1. **node_modules might be deleted** - Your dependencies are gone
2. **Cache mismatch** - Metro and Expo caches still reference old versions
3. **Native modules out of sync** - Android/iOS native code doesn't match the JavaScript
4. **Configuration changes** - app.json or other configs might have reverted

The TurboModule error specifically happens because:
- The Metro bundler cache has outdated module information
- Native modules (like PlatformConstants) aren't properly linked
- Hermes engine configuration might not be properly cached

---

## 📋 What Each Script Does

### `npm run quickstart`
**Best for:** After reverting branches/merges
- Automatically detects issues
- Only fixes what's needed (smart and fast)
- Shows you what it will do before doing it
- Interactive and safe

### `npm run fix:turbomodule`
**Best for:** Comprehensive TurboModule issues
- Full diagnosis of TurboModule configuration
- Clears all caches
- Rebuilds native modules if needed
- More thorough than quickstart

### `npm run reset:cache`
**Best for:** Quick cache clearing
- Removes all caches
- Reinstalls dependencies
- Rebuilds native modules
- Starts Metro automatically

### `npm run check:native-mods`
**Best for:** Just checking if there's a problem
- Validates configuration
- Checks dependencies
- No changes made, just reports status

---

## 🎯 Step-by-Step Process

### 1. After Reverting Branches

```bash
# Run the intelligent quickstart
npm run quickstart
```

**What happens:**
- Script checks your current state
- Shows you what needs fixing
- Asks for confirmation
- Applies fixes
- Validates everything works

### 2. Start the App

```bash
# Option A: Start everything (backend + frontend)
npm run start:all

# Option B: Start just Metro with clean cache
npx expo start -c
```

### 3. If Issues Persist

```bash
# Try the comprehensive fix
npm run fix:turbomodule --force-prebuild
```

---

## 🆘 Troubleshooting

### "npm run quickstart doesn't work"
Try the comprehensive fix:
```bash
npm run fix:turbomodule
```

### "Still getting TurboModule error after fixes"
1. Check Node.js version:
   ```bash
   node --version
   # Should be >= 20.0.0 and < 23.0.0
   ```

2. Force rebuild native modules:
   ```bash
   npm run fix:turbomodule -- --force-prebuild
   ```

3. Check if app.json is correct:
   ```bash
   npm run check:native-mods
   ```

### "Script permission denied"
Make scripts executable:
```bash
chmod +x scripts/*.sh
```

### "Command not found: npm"
Make sure Node.js and npm are installed:
```bash
# Check if installed
node --version
npm --version

# If not installed, install Node.js 20.x or higher
```

---

## 📚 Additional Resources

- **[HOW_TO_FIX_TURBOMODULE_ERROR.md](./HOW_TO_FIX_TURBOMODULE_ERROR.md)** - Detailed user guide
- **[TURBOMODULE_FIX.md](./TURBOMODULE_FIX.md)** - Technical implementation details
- **[QUICKSTART.md](./QUICKSTART.md)** - General getting started guide

---

## 💡 Pro Tips

### Prevent This In The Future

**After switching branches:**
```bash
npx expo start -c
```

**After pulling updates:**
```bash
npm install && npx expo start -c
```

**When you see weird errors:**
```bash
npm run check:native-mods  # Diagnose
npm run quickstart         # Fix
```

### Speed Up Recovery

Keep this bookmarked for fast recovery after branch operations:
```bash
# The ultimate one-liner for post-revert recovery
npm run quickstart && npm run start:all
```

---

## ✅ Success Checklist

After running the fix, verify these:

- [ ] `npm run check:native-mods` shows all green checkmarks
- [ ] Metro starts without errors
- [ ] No red screen in Expo Go app
- [ ] No "TurboModuleRegistry" errors in console
- [ ] App loads successfully

---

## 🎬 Quick Command Reference

```bash
# The main command you need
npm run quickstart

# If quickstart isn't enough
npm run fix:turbomodule

# Just clear caches (fastest)
npm run reset:cache

# Check if there's a problem
npm run check:native-mods

# Start the app
npm run start:all
```

---

**Remember:** After reverting branches, always run `npm run quickstart` first! It's the smartest and fastest way to get back up and running.
