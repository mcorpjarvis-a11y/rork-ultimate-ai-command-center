# Testing JARVIS in Expo Go

## Quick Test Commands

### 1. Pre-Flight Check
```bash
npm run test:expo-go
```
This validates that everything is configured correctly (5/5 tests should pass).

### 2. Start Backend (Terminal 1)
```bash
npm run start:backend
```
You should see:
```
🤖 ════════════════════════════════════════════════════════════
🤖   J.A.R.V.I.S. Backend Server
🤖   Just A Rather Very Intelligent System
🤖 ════════════════════════════════════════════════════════════

✅ Server is ONLINE
🌐 Server URL: http://0.0.0.0:3000
📡 API Base: http://0.0.0.0:3000/api

💡 Available Endpoints:
   • /api/analytics    - Performance analytics and insights
   • /api/trends       - Trend discovery and analysis
   • /api/content      - Content management
   • /api/integrations - Social accounts and connected APIs
   • /api/system       - System status and info
```

### 3. Start Frontend (Terminal 2)
```bash
npm start
```
This starts Expo with tunnel mode for easy mobile testing.

### 4. Open in Expo Go
- Scan the QR code with Expo Go app on your phone
- Or press `i` for iOS simulator
- Or press `a` for Android emulator

## Expected Console Output

When the app launches, you should see:

```
[App] Initializing Jarvis...
[PlugAndPlay] Backend connectivity: CONNECTED ✓  (if backend running)
[PlugAndPlay] Backend connected - Full features available
[App] VoiceService initialized
[App] Speech services initialized: 2
[App] Scheduler service started
[App] Monitoring service started
[App] Jarvis initialization complete
```

## Testing Features

### 1. Test Backend Connection
- Open JARVIS assistant (bottom right button)
- Ask: "What's the system status?"
- Should connect to real backend

### 2. Test Analytics
- Navigate to Analytics page
- View real-time metrics
- Check platform performance

### 3. Test Trends
- Go to Trend Analysis page
- Discover trending topics
- View trend analysis

### 4. Test Content
- Open Content Engine
- Create new content
- Saves to backend

### 5. Test Voice Services
- Click microphone icon
- Grant audio permissions when prompted
- Speak a command
- Hear JARVIS respond

## Troubleshooting

### Backend Not Connecting
**Symptom:** See `[PlugAndPlay] Backend offline - using fallback mode`

**Solution:** This is NORMAL if backend isn't running. App continues with local features.

**To Connect Backend:**
1. Make sure backend is running (`npm run start:backend`)
2. Update `EXPO_PUBLIC_API_URL` in .env to your backend URL
3. Restart the app

### Services Not Starting
**Symptom:** App crashes on launch

**Solution:**
1. Run `npm run test:startup` to validate configuration
2. Check console for specific error messages
3. Clear Expo cache: `npx expo start -c`

### Permission Errors
**Symptom:** Audio/camera permissions denied

**Solution:**
1. Go to device Settings → Expo Go → Permissions
2. Enable Camera and Microphone
3. Restart Expo Go app

## System Architecture

```
┌─────────────────┐
│  Expo Go App    │
│  (Frontend)     │
└────────┬────────┘
         │
         │ HTTP/WebSocket
         │
┌────────▼────────┐
│  Backend API    │
│  Express.js     │
└────────┬────────┘
         │
    ┌────┴────┬─────────┬─────────┐
    │         │         │         │
┌───▼───┐ ┌──▼──┐  ┌──▼──┐  ┌───▼────┐
│Analytics│ │Trends│ │Content│ │Integr. │
│ Service│ │Service│ │Service│ │ Service│
└────────┘ └─────┘  └─────┘  └────────┘
```

## Performance Checks

✅ App startup: < 3 seconds
✅ Backend response: < 500ms
✅ Service initialization: < 2 seconds
✅ Voice response: < 1 second
✅ UI interactions: 60 FPS

## Next Steps After Testing

1. ✅ Verify all 8 services start
2. ✅ Test JARVIS assistant with commands
3. ✅ Check analytics dashboard
4. ✅ Test content creation
5. ✅ Verify voice services work
6. 🚀 Build production APK: `eas build --platform android`

## Documentation

- **STARTUP_GUIDE.md** - Complete startup documentation
- **MASTER_CHECKLIST.md** - Production readiness status
- **Backend README** - API endpoint documentation (to be created)

## Support

If you encounter issues:
1. Check console output for errors
2. Run `npm run test:expo-go` for diagnostics
3. Verify backend is running (if using real APIs)
4. Check TROUBLESHOOTING section in STARTUP_GUIDE.md
