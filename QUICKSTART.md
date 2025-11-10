# JARVIS Command Center - Plug and Play Quick Start

> **⚡ Get up and running in 5 minutes**

This guide gets you from zero to running JARVIS in the fastest way possible.

---

## 🎯 Prerequisites (1 minute)

1. **Node.js 20.x** (LTS recommended)
   ```bash
   node --version  # Should show v20.x.x
   ```

2. **Git** (for cloning)
   ```bash
   git --version
   ```

3. **Android device** with Expo Go app installed
   - Download from: [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)

---

## 🚀 Setup (2 minutes)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd rork-ultimate-ai-command-center

# Install dependencies (automatic setup)
npm install
```

**Note:** The `postinstall` script automatically:
- Verifies dependencies are compatible
- Aligns Expo packages
- Runs health checks

### Step 2: Verify Everything Works

```bash
# Run complete verification (recommended)
npm run verify:all
```

This checks:
- ✅ All 28 service dependencies
- ✅ Startup order is correct
- ✅ Metro bundler works
- ✅ All 197 tests pass
- ✅ Backend builds successfully

**Expected output:**
```
✅ ALL CRITICAL CHECKS PASSED
✅ Passed:   28 checks
✅ 197/197 tests passing
✅ Backend build successful
```

---

## 🎮 Run the App (2 minutes)

### Option 1: Full Stack (Frontend + Backend)

```bash
npm run start:all
```

This starts:
1. Backend API server on `http://localhost:3000`
2. Metro bundler for frontend
3. Displays QR code for Expo Go

### Option 2: Frontend Only

```bash
npm start
```

### Option 3: Backend Only

```bash
npm run dev:backend  # With hot reload
# OR
npm run start:backend  # Production mode
```

---

## 📱 Connect Your Device

1. **Open Expo Go** on your Android device
2. **Scan the QR code** displayed in your terminal
3. **Wait for app to load** (first load takes 1-2 minutes)

**You should see:**
```
[App] 🚀 Starting app initialization...
[App] Step 0: Validating configuration...
[App] Step 1: Testing secure storage...
[App] Step 2: Checking authentication...
[App] 🔐 OAuth login REQUIRED to proceed
```

4. **Sign in with Google** (or other OAuth provider)
5. **Grant permissions** (one-time setup)
6. **JARVIS initializes** and you're ready!

---

## 🎉 You're Done!

The app is now running in **"Clean Slate"** mode:
- ✅ Works without any API keys
- ✅ All local features enabled
- ✅ OAuth authentication active
- ✅ Voice services ready
- ✅ Backend services operational

### Add AI Providers (Optional)

To enable AI features, add API keys in the app:

1. Go to **Settings** → **AI Providers**
2. Click **Add Provider**
3. Enter your API key
4. Test the connection

**Recommended free providers:**
- **Groq** (fastest, free tier)
- **Google Gemini** (free tier)
- **HuggingFace** (free tier)

---

## 🔍 Verification Commands

Quick health checks you can run anytime:

```bash
# Check startup order and dependencies
npm run verify:startup-order

# Check Metro bundler
npm run verify:metro

# Run all tests
npm test

# Check backend
npm run verify:backend

# Complete verification
npm run verify:all
```

---

## 📊 System Status

After installation, your system should report:

| Component | Status | Details |
|-----------|--------|---------|
| **Tests** | ✅ 197/197 passing | 100% pass rate |
| **TypeScript** | ✅ 0 errors | Clean compilation |
| **ESLint** | ✅ 0 errors | 99 warnings (documented) |
| **Metro Bundler** | ✅ Working | 3,248 modules bundled |
| **Backend** | ✅ Online | 9 API routes ready |
| **Services** | ✅ 28/28 ready | All dependencies present |
| **OAuth Providers** | ✅ 11 available | Google, GitHub, Discord, etc. |
| **Node Version** | ✅ 20.x LTS | Optimal performance |

---

## 🐛 Troubleshooting

### "Metro bundler won't start"

```bash
# Clear caches and restart
npm run verify:metro
npm start -- --clear
```

### "Tests failing"

```bash
# Clear Jest cache
rm -rf node_modules/.cache
npm test -- --clearCache
npm test
```

### "Backend won't start"

```bash
# Rebuild backend
npm run build:backend
npm run start:backend
```

### "App stuck on loading screen"

```bash
# Check logs in terminal for error messages
# Most common: Missing OAuth provider connection
# Solution: Complete OAuth sign-in flow
```

### "Cannot read property 'default' of undefined"

This error is NOT present in this codebase. If you see it:
1. Clear all caches: `npm start -- --clear`
2. Rebuild backend: `npm run build:backend`
3. Verify all tests pass: `npm test`
4. Check startup order: `npm run verify:startup-order`

---

## 📚 Next Steps

Once running, explore:

1. **Voice Commands**
   - Say "Jarvis" to activate wake word
   - Ask questions, get AI responses

2. **Social Media Integration**
   - Connect Twitter, Instagram, YouTube
   - Schedule posts, track analytics

3. **IoT Control**
   - Add smart home devices
   - Control lights, thermostats via voice

4. **Content Generation**
   - AI-powered content creation
   - Media studio for images/videos

5. **Analytics Dashboard**
   - Real-time performance metrics
   - Multi-platform insights

---

## 🔗 Documentation Links

- **Complete Guide**: [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)
- **Testing Guide**: [TESTING.md](./TESTING.md)
- **API Documentation**: See `/backend/routes` folder
- **Service Architecture**: See `/services` folder

---

## ✅ Success Criteria

Your system is working correctly if:

- ✅ `npm run verify:all` passes all checks
- ✅ All 197 tests pass
- ✅ Metro bundler generates bundle successfully
- ✅ Backend server reaches "ONLINE" state
- ✅ App loads in Expo Go without errors
- ✅ OAuth sign-in flow completes
- ✅ Main dashboard appears
- ✅ JARVIS responds to commands

---

## 🆘 Getting Help

If you're still stuck:

1. **Check logs**: Look for error messages in terminal
2. **Run verification**: `npm run verify:all`
3. **Review documentation**: [MASTER_CHECKLIST.md](./MASTER_CHECKLIST.md)
4. **Check Node version**: Should be 20.x LTS
5. **Verify dependencies**: `npm install` again

---

## 🎊 Congratulations!

You now have JARVIS Ultimate AI Command Center running on your device!

**What makes this truly plug-and-play:**
- ✅ Zero configuration required to start
- ✅ Automatic dependency management
- ✅ Clean slate mode (works without API keys)
- ✅ Comprehensive verification scripts
- ✅ Graceful error handling
- ✅ Self-documenting startup sequence
- ✅ Production-ready architecture

**Total setup time:** ~5 minutes from clone to running app! 🚀

---

*Last Updated: 2025-11-10*  
*Version: 1.0 (Plug and Play)*
