# 📱 Testing Guide for Physical Android Device

## Prerequisites
- Physical Android device (not emulator)
- USB debugging enabled
- ADB installed on computer
- Device connected via USB

## Step 1: Clean Install (First-Time User Flow)

### 1.1 Uninstall existing app (if any)
```bash
adb uninstall host.exp.exponent  # For Expo Go
# OR
adb uninstall com.yourapp.package  # For standalone build
```

### 1.2 Start the app
```bash
npm start
# Then scan QR code with Expo Go app
```

### 1.3 Expected Flow
1. **Sign-In Screen appears**
   - ✅ Shows email/password form
   - ✅ Shows "Create Account" option
   - ✅ Shows Google sign-in button

2. **Sign Up**
   - Enter: Name, Email, Password
   - Tap "Create Account"
   - ✅ Master profile created
   - ✅ Routes to `/onboarding/permissions`

3. **Permission Screen**
   - Screen loads
   - ⏱️ Wait 800ms
   - ✅ Permission dialogs pop up automatically
   - Grant these permissions:
     - 📷 Camera (OK)
     - 🎤 **Microphone (REQUIRED for JARVIS)** (OK)
     - 📍 Location (OK)
     - 📶 Bluetooth (OK)
     - 💾 Storage (OK)
   - ✅ Tap "Continue to OAuth Setup"
   - ✅ Routes to `/onboarding/oauth-setup`

4. **OAuth Wizard**
   - ✅ Shows list of services
   - Optional: Connect Google, GitHub, etc.
   - ✅ Tap "Continue to Dashboard" or "Skip for Now"
   - ✅ Routes to `/` (dashboard)

5. **Dashboard & JARVIS**
   - ✅ Dashboard loads
   - ✅ Console shows: "JARVIS initialization complete"
   - ✅ Console shows: "Always-listening service started"
   - 🎤 **Say "Jarvis"**
   - ✅ **JARVIS responds: "Yes, sir?"** (or another acknowledgment)

## Step 2: Test Returning User Flow

### 2.1 Close app completely
```bash
# Force close the app
adb shell am force-stop host.exp.exponent
```

### 2.2 Reopen app
- Open Expo Go and launch app again

### 2.3 Expected Flow
1. **App opens directly to dashboard**
   - ✅ NO sign-in screen
   - ✅ NO permission screen
   - ✅ NO OAuth wizard
   - ✅ Dashboard appears immediately (~2 seconds)

2. **JARVIS initializes**
   - ✅ Console shows: "Master profile found"
   - ✅ Console shows: "Onboarding complete"
   - ✅ Console shows: "JARVIS initialization complete"
   - ✅ Console shows: "Always-listening service started"

3. **Test wake word**
   - 🎤 **Say "Jarvis"**
   - ✅ **JARVIS responds: "Yes, sir?"**
   - 🎤 **Try other variations:**
     - "Hey Jarvis" → ✅ Responds
     - "OK Jarvis" → ✅ Responds
     - "Yo Jarvis" → ✅ Responds

## Step 3: Test Wake Word Detection

### 3.1 Test all wake word variations
```
Say:                    Expected Response:
────────────────────   ─────────────────────────────
"Jarvis"               → "Yes, sir?" (or variation)
"Hey Jarvis"           → "Yes, sir?" (or variation)
"OK Jarvis"            → "Yes, sir?" (or variation)
"Yo Jarvis"            → "Yes, sir?" (or variation)
```

### 3.2 Expected Acknowledgments (Random)
- "Yes, sir?"
- "At your service, sir."
- "How may I help you, sir?"
- "I'm here, sir."
- "Yes, sir. I'm listening."
- "Ready, sir."

### 3.3 Test command flow
1. Say "Jarvis"
2. Wait for acknowledgment
3. Say a command (e.g., "What time is it?")
4. JARVIS should process the command
5. After 10 seconds of no command, returns to listening mode

## Step 4: Check Console Logs

### 4.1 View logs
```bash
# In terminal where npm start is running
# OR
adb logcat | grep -i jarvis
```

### 4.2 Expected logs on startup
```
[App] Starting app initialization...
[App] SecureStorage test passed
[App] Master profile found: user@email.com
[App] Profile and onboarding complete, initializing JARVIS
[App] Initializing Jarvis...
[App] VoiceService initialized
[App] Speech services initialized: 2
[App] Starting always-listening service...
[AlwaysListening] Starting always-listening service...
[AlwaysListening] ✅ Always-listening service started successfully
[App] ✅ Always-listening service started - JARVIS is now listening for wake word
[App] Scheduler service started
[App] Monitoring service started
[App] Jarvis initialization complete
```

### 4.3 Expected logs on wake word
```
[AlwaysListening] ✅ Wake word detected!
[JarvisVoiceService] JARVIS speaking: Yes, sir?
```

## Step 5: Test Interrupted Onboarding

### 5.1 Reset onboarding state
```bash
# Clear app data
adb shell pm clear host.exp.exponent

# Restart app
npm start
```

### 5.2 Interrupt flow
1. Sign up → Complete
2. Grant permissions → Complete
3. **CLOSE APP before completing OAuth wizard**

### 5.3 Reopen app
- ✅ Should route to `/onboarding/oauth-setup`
- ✅ NOT to sign-in screen
- ✅ NOT to dashboard

### 5.4 Complete wizard
- Tap "Continue" or "Skip"
- ✅ Routes to dashboard
- ✅ JARVIS initializes

## Troubleshooting

### Issue: Permissions not auto-requesting
**Check:**
- Is device Android? (iOS not supported yet)
- Console shows: "Auto-requesting permissions..."
- Wait full 800ms after screen loads

**Fix:**
- Manually tap "Request All Permissions" button
- Grant permissions
- Continue to next step

### Issue: JARVIS not responding to wake word
**Check:**
- Microphone permission granted? (Critical!)
- Console shows: "Always-listening service started successfully"
- Try speaking louder/clearer
- Check device is not muted

**Fix:**
```bash
# Check permissions
adb shell pm dump host.exp.exponent | grep -i permission

# Look for:
# android.permission.RECORD_AUDIO: granted=true
```

### Issue: App stuck on sign-in screen
**Check:**
- Profile created? Check console: "Master profile created"
- Onboarding status? Check AsyncStorage

**Fix:**
```bash
# View AsyncStorage
adb shell run-as host.exp.exponent cat /data/data/host.exp.exponent/files/.expo-internal/RCTAsyncLocalStorage_V1

# Should see:
# "jarvis-onboarding-completed":"true"
```

### Issue: Dashboard shows but JARVIS doesn't initialize
**Check:**
- Console shows errors?
- VoiceService initialized?
- Microphone permission granted?

**Debug:**
```javascript
// Check in browser console or logs:
await OnboardingStatus.isOnboardingComplete(); // Should return true
await MasterProfile.getMasterProfile();        // Should return profile
```

## Success Criteria Checklist

### First-Time User
- [ ] Sign-up screen shows
- [ ] Sign-up creates profile
- [ ] Permissions auto-request (800ms)
- [ ] All critical permissions granted
- [ ] OAuth wizard shows
- [ ] Onboarding marked complete
- [ ] Dashboard loads
- [ ] JARVIS initializes
- [ ] JARVIS responds to "Jarvis"

### Returning User
- [ ] App opens to dashboard immediately
- [ ] No sign-in/wizard screens
- [ ] JARVIS initializes in ~2 seconds
- [ ] JARVIS responds to wake words
- [ ] All wake word variations work

### Wake Word Detection
- [ ] "Jarvis" → Responds
- [ ] "Hey Jarvis" → Responds
- [ ] "OK Jarvis" → Responds
- [ ] "Yo Jarvis" → Responds
- [ ] Random acknowledgments working
- [ ] Command timeout (10 sec) working

## Performance Targets

- **First launch to dashboard:** < 5 seconds (after permissions)
- **Restart to dashboard:** < 2 seconds
- **JARVIS initialization:** < 1 second
- **Wake word response time:** < 500ms

## Report Issues

If any tests fail, gather:
1. Console logs (full output)
2. Steps to reproduce
3. Android version
4. Device model
5. Screenshots (if applicable)

Then create an issue with title:
"[Testing] Issue with [feature name] on [device]"
