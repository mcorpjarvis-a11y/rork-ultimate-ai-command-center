# 🆘 QUICK REFERENCE - TurboModule Error Fix

## 🚨 Got the TurboModule Error After Reverting Branches?

### The Error You See:
```
Invariant Violation: TurboModuleRegistry.getEnforcing(...):
'PlatformConstants' could not be found.
```

---

## ⚡ INSTANT FIX (Copy & Paste This)

```bash
npm run quickstart
```

**That's it!** This command will:
1. Detect what's broken
2. Show you what it will fix
3. Ask for confirmation
4. Fix everything
5. Start Metro with clean cache

**Time: 2-5 minutes**

---

## 📋 Other Available Commands

| Command | Use When | What It Does |
|---------|----------|--------------|
| `npm run quickstart` | **After reverting branches** | Smart detection & fix (RECOMMENDED) |
| `npm run fix:turbomodule` | **TurboModule errors persist** | Full diagnostic & comprehensive fix |
| `npm run reset:cache` | **Quick cache clear needed** | Clears all caches, reinstalls, rebuilds |
| `npm run check:native-mods` | **Just want to check status** | Validates config, no changes made |

---

## 🎯 Decision Tree

```
Do you have TurboModule error?
│
├─ YES → Did you just revert branches?
│   │
│   ├─ YES → Run: npm run quickstart
│   │
│   └─ NO → Run: npm run fix:turbomodule
│
└─ NO → You're good! Just run: npm run start:all
```

---

## 🔧 If Scripts Don't Work

### Manual Fix (3 commands):
```bash
rm -rf node_modules .expo .expo-shared ~/.expo
npm install
npx expo start -c
```

---

## 📚 Documentation

- **[AFTER_REVERT_RECOVERY.md](./AFTER_REVERT_RECOVERY.md)** ← Start here if you reverted branches
- **[HOW_TO_FIX_TURBOMODULE_ERROR.md](./HOW_TO_FIX_TURBOMODULE_ERROR.md)** ← General TurboModule guide
- **[TURBOMODULE_FIX.md](./TURBOMODULE_FIX.md)** ← Technical details

---

## ✅ Verify Fix Worked

After running the fix, check:
- [ ] `npm run check:native-mods` shows ✅ all green
- [ ] Metro starts without errors
- [ ] No red screen in Expo Go
- [ ] App loads successfully

---

## 💡 Remember for Next Time

**After reverting branches or pulling updates:**
```bash
npm run quickstart
```

**Bookmark this command!** ⭐
