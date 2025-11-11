# Login Pipeline Documentation

## Overview

This document describes the complete login and permission pipeline for JARVIS, including the initialization sequence and permission management.

## Services

### JarvisLoggerService

Centralized logging service providing consistent formatted output across all JARVIS services.

**Location:** `services/JarvisLoggerService.ts`

**Methods:**
- `log(...args)` - General log with [JARVIS] prefix
- `success(msg, ...args)` - Success message with ✅
- `warn(msg, ...args)` - Warning message with ⚠️
- `error(msg, ...args)` - Error message with ❌
- `info(msg, ...args)` - Info message with ℹ️
- `debug(msg, ...args)` - Debug message (dev only) with 🐛
- `stage(stageName, ...args)` - Stage announcement with 🚀
- `status(type, service, ...args)` - Status update with 🟢/🔴/✅/🔄

**Usage:**
```typescript
import JarvisLogger from '@/services/JarvisLoggerService';

JarvisLogger.success('Auth initialized');
JarvisLogger.stage('Step 1', 'Loading configuration...');
JarvisLogger.error('Failed to connect:', error);
```

### JarvisPermissionsService

Unified permission request service handling all Expo permissions in one place.

**Location:** `services/JarvisPermissionsService.ts`

**Main Function:**
```typescript
async function requestAllPermissions(): Promise<PermissionResults>
```

**Permissions Requested:**
1. **Notifications** - expo-notifications
2. **Audio/Microphone** - expo-audio (recording)
3. **File System** - expo-file-system
4. **Media Library** - expo-media-library
5. **Location** - expo-location
6. **Camera** - expo-image-picker

**Features:**
- Non-blocking: continues even if permissions denied
- Graceful degradation with warnings
- Returns detailed results for each permission
- Sets audio mode for recording on iOS

**Usage:**
```typescript
import { requestAllPermissions, hasCriticalPermissions } from '@/services/JarvisPermissionsService';

// Request all permissions
const permissions = await requestAllPermissions();

// Check if critical permissions granted
const hasRequired = hasCriticalPermissions(permissions);
if (!hasRequired) {
  console.warn('App will have limited functionality');
}
```

## Initialization Sequence

The complete startup flow is orchestrated in `app/_layout.tsx`:

```
Step 0: Config Validation
  └─> Validate environment and configuration
  └─> Check for critical errors

Step 1: Secure Storage Test
  └─> Test SecureStore availability
  └─> Log warnings if unavailable

Steps 2-4: Parallel Checks (OPTIMIZED)
  ├─> Step 2: Authentication check
  ├─> Step 3: OAuth validation
  └─> Step 4: Onboarding status check

Step 4.5: Request All Permissions
  └─> Request notifications, audio, files, media, location, camera
  └─> Non-blocking with graceful degradation

Step 5: Master Profile Validation
  └─> Non-blocking validation logging

Step 6: JARVIS Initialization
  ├─> Core JARVIS services
  ├─> Backend connectivity (PlugAndPlayService)
  ├─> Speech services (VoiceService, JarvisVoiceService, JarvisListenerService)
  ├─> Always-listening service (wake word detection)
  ├─> Scheduler service
  ├─> WebSocket connection
  └─> Monitoring service

→ App Ready / Navigate to Dashboard
```

## Log Output Example

When the app starts successfully, you should see:

```
🚀 [App] Starting app initialization...
🚀 [Step 0] Validating configuration...
✅ SecureStorage test passed
🚀 [Steps 2-4] Checking authentication, OAuth, and onboarding in parallel...
✅ Authentication check passed
✅ Master profile found: user@example.com
✅ OAuth providers connected: google
✅ OAuth validation passed
🚀 [Step 4.5] Requesting permissions...
✅ Notifications permission granted
✅ Audio permission granted
✅ File system access available
✅ Media library permission granted
✅ Location permission granted
✅ Camera permission granted
✅ All permissions granted (7/7)
✅ Permissions granted
🚀 [Step 5] Validating master profile...
🚀 [Step 6] Initializing JARVIS with live data...
🚀 [JARVIS] Initializing JARVIS core systems...
✅ Core JARVIS services initialized
✅ Backend services connected
✅ VoiceService initialized
✅ Speech services initialized: 2
✅ Always-listening service started - JARVIS is now listening for wake word
✅ Scheduler service started
✅ WebSocket connected
✅ Monitoring service started
✅ JARVIS initialization complete - All systems operational!
✅ Navigation: Dashboard
✅ JARVIS initialized and ready
✅ App initialization complete - All systems operational
```

## Error Handling

### Permission Denied

If a permission is denied, the service logs a warning but continues:

```
⚠️ Notifications permission denied
⚠️ Permissions granted: 6/7
ℹ️ App will continue with limited functionality
```

The app continues to work with reduced functionality.

### Authentication Failure

If authentication fails, the app shows the sign-in screen:

```
⚠️ No valid master profile found, showing sign-in
ℹ️ OAuth login REQUIRED to proceed
```

### Service Initialization Failure

Individual service failures don't stop the app:

```
⚠️ Backend connectivity initialization failed (will retry later)
⚠️ WebSocket connection failed (will retry automatically)
⚠️ Speech services unavailable, continuing without voice features
```

The app continues with whatever services are available.

## Testing

### Automated Test

Run the login pipeline test:

```bash
npm run test:login-pipeline
```

This tests:
1. Permission requests
2. Auth initialization
3. JARVIS initialization
4. Voice system availability

### Manual Testing

1. **Clean Installation Test:**
   ```bash
   # Clear app data
   npx expo start -c
   
   # Expected: All permissions requested on first run
   # Expected: Sign-in screen shown if not authenticated
   ```

2. **Permission Grant Test:**
   - Grant all permissions → Full functionality
   - Deny some permissions → Graceful degradation with warnings
   - Deny all permissions → App still works with limited features

3. **Authentication Test:**
   - New user → Sign-in screen
   - Authenticated user → Direct to dashboard
   - OAuth required → No bypass allowed

## Configuration

### app.json Plugins

The following Expo plugins must be configured:

```json
{
  "plugins": [
    "expo-router",
    ["expo-audio", {
      "microphonePermission": "Allow ${PRODUCT_NAME} to access your microphone"
    }],
    "expo-speech",
    ["expo-image-picker", {
      "photosPermission": "The app accesses your photos..."
    }],
    ["expo-media-library", {
      "photosPermission": "Allow ${PRODUCT_NAME} to access your photos.",
      "savePhotosPermission": "Allow ${PRODUCT_NAME} to save photos.",
      "isAccessMediaLocationEnabled": true
    }],
    "expo-document-picker",
    "expo-notifications"
  ]
}
```

### Android Permissions

Required in `app.json`:

```json
{
  "android": {
    "permissions": [
      "INTERNET",
      "CAMERA",
      "MICROPHONE",
      "RECORD_AUDIO",
      "POST_NOTIFICATIONS"
    ]
  }
}
```

## Troubleshooting

### "expo-notifications plugin error"

**Solution:** Ensure expo-notifications is listed in plugins array in app.json and is installed:

```bash
npx expo install expo-notifications
```

### "Speech recognition not available"

**Cause:** expo-speech-recognition may not be available in all environments.

**Expected Behavior:** App continues without voice features, logs warning:

```
⚠️ Speech services unavailable, continuing without voice features
```

### Permissions not requested

**Solution:** 
1. Clear app cache: `npx expo start -c`
2. Verify JarvisPermissionsService is imported in app/_layout.tsx
3. Check Step 4.5 is executing in logs

### Splash screen hangs

**Solution:** The splash has a 5-second fallback timeout. If initialization hangs, it will force show sign-in screen.

## Best Practices

1. **Always use JarvisLogger** instead of console.log for consistency
2. **Non-blocking permissions** - Don't throw errors on denied permissions
3. **Graceful degradation** - App should work with minimal permissions
4. **Clear log stages** - Use stage() for major initialization steps
5. **Error context** - Include relevant data in error logs

## Future Enhancements

- [ ] Background permission for location
- [ ] Bluetooth permission for IoT devices
- [ ] Calendar permission for scheduling
- [ ] Contacts permission for user management
- [ ] Storage permission optimization for Android 11+

## References

- [Expo Permissions Guide](https://docs.expo.dev/guides/permissions/)
- [expo-notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [expo-audio](https://docs.expo.dev/versions/latest/sdk/audio/)
- [expo-location](https://docs.expo.dev/versions/latest/sdk/location/)
- [React Native Permissions Best Practices](https://reactnative.dev/docs/permissionsandroid)
