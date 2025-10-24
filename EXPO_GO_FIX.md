# Expo Go Connection Fix for Galaxy S25 Ultra

## The Problem
Error: "java.io.IOException: Failed to download remote update"
This means Expo Go can't download your app from the development server.

## Quick Fixes (Try in Order)

### 1. **Restart Everything** (Most Common Solution)
```bash
# Kill all running processes
pkill -f expo
pkill -f metro

# Clear cache and restart
bun run start
```

### 2. **Network Connection**
- Make sure your phone and computer are on the **SAME WiFi network**
- Disable any VPN on your phone
- Check if your router blocks device-to-device communication

### 3. **Use Tunnel Mode** (Most Reliable for Android)
The start script already uses tunnel mode, but let's verify:
```bash
bunx expo start --tunnel --android
```

### 4. **Manual IP Connection**
If tunnel doesn't work:
```bash
# Get your computer's IP address
# Windows: ipconfig
# Mac/Linux: ifconfig or ip addr

# Start without tunnel
bunx expo start --android

# In Expo Go, manually enter: exp://YOUR_IP:8081
```

### 5. **Clear Expo Go Cache**
On your Galaxy S25 Ultra:
- Open Expo Go
- Go to Settings (gear icon)
- Clear all cached data
- Force close Expo Go
- Reopen and scan QR code again

### 6. **Firewall/Antivirus**
- Temporarily disable firewall on your computer
- Allow port 8081 and 19000-19001 through firewall
- Check if antivirus is blocking connections

### 7. **Use USB Connection** (Most Reliable)
```bash
# Connect phone via USB
# Enable USB debugging on phone
adb devices  # Verify phone is connected

bunx expo start --android --localhost
```

## Current Start Command
Your package.json has:
```json
"start": "bunx rork start -p iwor6jnskhcx5cg2w1o64 --tunnel"
```

## Recommended Steps for Galaxy S25 Ultra

1. **Connect via USB** (most reliable):
```bash
# Enable Developer Mode on phone:
# Settings > About Phone > Tap Build Number 7 times
# Settings > Developer Options > Enable USB Debugging

# Connect USB cable
adb devices

# Start with localhost
bunx expo start --android --localhost
```

2. **Or use LAN with your network**:
```bash
bunx expo start --android --lan
```

3. **Check if Metro bundler is running**:
- Open browser to http://localhost:8081
- You should see Metro bundler interface

## If Still Not Working

### Check app.json
Make sure there are no syntax errors and SDK version matches Expo Go (53).

### Try Development Build
Since Expo Go has limitations, consider creating a development build:
```bash
# Install expo-dev-client
bun add expo-dev-client

# This requires building custom APK (outside Expo Go)
```

## Terminal Commands to Test

```bash
# 1. Clean install
rm -rf node_modules
rm bun.lockb
bun install

# 2. Clear Metro cache
bunx expo start --clear

# 3. Start with tunnel for Android
bunx expo start --tunnel --android

# 4. If tunnel fails, try LAN
bunx expo start --lan --android
```

## Common Issues on Samsung Devices

1. **Knox Security**: Samsung Knox might block connections
   - Try disabling Knox temporarily

2. **Game Launcher**: Disable Game Launcher interference
   - Settings > Advanced Features > Game Launcher

3. **Battery Optimization**: Disable for Expo Go
   - Settings > Apps > Expo Go > Battery > Unrestricted

4. **Network Settings**: Reset network settings if needed
   - Settings > General Management > Reset > Reset Network Settings

## Best Working Setup for You

Based on your Galaxy S25 Ultra:

1. **USB + Localhost** (Recommended):
```bash
# Connect USB, enable USB debugging
bunx expo start --android --localhost
```

2. **Or Tunnel Mode** (if USB not available):
```bash
bunx expo start --tunnel --android
```

## Test Right Now

Run this command:
```bash
bunx expo start --clear --tunnel --android
```

Then:
1. Open Expo Go on your Galaxy S25 Ultra
2. Scan the QR code
3. Wait for bundle to download

If it still fails, the issue is likely network-related. USB connection will be your best bet.
