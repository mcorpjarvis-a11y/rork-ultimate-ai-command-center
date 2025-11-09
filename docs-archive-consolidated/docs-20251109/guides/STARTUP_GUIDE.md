# JARVIS Startup Guide

## Quick Start - Launch Everything

### Single Command to Start All Services

```bash
npm start
```

This automatically initializes all 8 core services when the app launches.

### Test Startup in Virtual Environment

```bash
npm run test:startup
```

This runs comprehensive tests to verify all services are configured correctly.

---

## What Gets Started Automatically

When you run `npm start`, the app automatically initializes:

### 1. **Core Initialization**
- `JarvisInitializationService` - Main JARVIS setup

### 2. **Backend Connectivity**
- `PlugAndPlayService` - Checks backend connection with graceful fallback

### 3. **Speech Services** (3 services)
- `VoiceService` - General voice recording
- `JarvisVoiceService` - Text-to-speech with British accent
- `JarvisListenerService` - Speech-to-text and wake word detection

### 4. **Background Services** (3 services)
- `SchedulerService` - Automated task scheduling
- `WebSocketService` - Real-time updates from backend
- `MonitoringService` - System health monitoring and logging

---

## Startup Sequence

```
App Launch
    ↓
1. JarvisInitializationService.initialize()
    ↓
2. PlugAndPlayService.initialize()
   - Checks backend at /api/system/health
   - Falls back to mock data if offline
    ↓
3. VoiceService.initialize()
   - Requests audio permissions
   - Sets up audio mode
    ↓
4. Load Speech Singletons
   - JarvisVoiceService (auto-initializes)
   - JarvisListenerService (auto-initializes)
    ↓
5. Start Background Services
   - SchedulerService.start()
   - WebSocketService.connect()
   - MonitoringService.startMonitoring()
    ↓
6. ✅ Ready! "Jarvis initialization complete"
```

---

## Console Output (Expected)

When all services start successfully, you'll see:

```
[App] Initializing Jarvis...
[PlugAndPlay] Backend connectivity: OFFLINE ✗
[PlugAndPlay] Backend offline - using fallback mode
[App] VoiceService initialized
[App] Speech services initialized: 2
[App] Scheduler service started
[App] WebSocket connection failed (will retry): ...
[App] Monitoring service started
[App] Jarvis initialization complete
```

### Safe Warnings

These warnings are **NORMAL** when backend is not running:
- ✅ `[PlugAndPlay] Backend offline - using fallback mode`
- ✅ `[App] WebSocket connection failed (will retry)`

The app continues to work with mock data and local features.

---

## Testing in Different Environments

### 1. **Expo Go** (Recommended for Testing)
```bash
npm start
# Scan QR code with Expo Go app
```

**Features that work in Expo Go:**
- ✅ All UI features
- ✅ Voice services (with permissions)
- ✅ Local data storage
- ✅ Mock data fallbacks
- ⚠️ Backend requires network (shows warnings if offline)

### 2. **Development Build**
```bash
npx expo run:android
# or
npx expo run:ios
```

### 3. **Production APK**
```bash
eas build --platform android
```

---

## Troubleshooting

### Services Not Starting?

Run the test script:
```bash
npm run test:startup
```

This checks:
- ✅ All service files exist
- ✅ Startup code is in app/_layout.tsx
- ✅ All tools are connected
- ✅ Configuration files are present

### App Crashes on Startup?

Check console for errors:
1. Look for red error messages
2. Check if permissions are requested
3. Verify network connectivity for backend

### Backend Connection Issues?

This is **EXPECTED** if backend isn't running. The app:
- Shows warning in console
- Continues with local features
- Uses mock data as fallback
- Retries connection periodically

---

## Service Details

### JarvisInitializationService
- **Purpose**: Initialize JARVIS core systems
- **Started**: Automatically on app launch
- **Required**: Yes

### PlugAndPlayService  
- **Purpose**: Backend health check and connectivity
- **Started**: After JarvisInitialization
- **Required**: No (graceful fallback)

### VoiceService
- **Purpose**: Audio recording setup
- **Started**: After PlugAndPlay
- **Required**: For voice features

### JarvisVoiceService
- **Purpose**: Text-to-speech with JARVIS personality
- **Started**: Auto-loaded as singleton
- **Required**: For voice output

### JarvisListenerService
- **Purpose**: Speech-to-text and wake word ("Hey JARVIS")
- **Started**: Auto-loaded as singleton  
- **Required**: For voice input

### SchedulerService
- **Purpose**: Automated task execution
- **Started**: After speech services
- **Required**: For scheduled posts/tasks

### WebSocketService
- **Purpose**: Real-time updates from backend
- **Started**: After Scheduler
- **Required**: No (shows warnings if offline)

### MonitoringService
- **Purpose**: System health and logging
- **Started**: Last in sequence
- **Required**: For debugging and metrics

---

## Additional Commands

### Start Backend Separately
```bash
npm run start:backend
```

### Start Frontend Only
```bash
npm run start:frontend
```

### Start Both (Backend + Frontend)
```bash
npm run start:all
```

### Test in Web Browser
```bash
npm run start-web
```

---

## Next Steps

1. **Test in Expo Go**: `npm start` → Scan QR
2. **Verify Services**: Check console for all 8 services
3. **Test Features**: Open JARVIS modal, try voice input
4. **Check Logs**: View MonitoringService logs in app

All services are now ready for production deployment! 🚀
