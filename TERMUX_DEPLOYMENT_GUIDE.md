# JARVIS AI Command Center - Termux Deployment Guide

## 🚀 Complete Guide: From Zero to Running in Termux

This guide will walk you through every step needed to run the JARVIS AI Influencer Command Center on Termux (Android).

---

## Step 1: Install Termux

1. Download **Termux** from F-Droid (NOT from Google Play Store)
   - Go to: https://f-droid.org/packages/com.termux/
   - Or download directly: https://f-droid.org/repo/com.termux_118.apk

2. Install and open Termux

---

## Step 2: Update Termux and Install Prerequisites

```bash
# Update package lists
pkg update && pkg upgrade -y

# Install required packages
pkg install git nodejs-lts python -y

# Install Bun (modern JavaScript runtime)
curl -fsSL https://bun.sh/install | bash

# Reload shell to use bun
source ~/.bashrc

# Verify installations
node --version
bun --version
git --version
```

---

## Step 3: Clone or Download the Project

### Option A: If you have the project as a ZIP file
```bash
# Install unzip if needed
pkg install unzip -y

# Navigate to Downloads or wherever your ZIP is
cd ~/storage/downloads

# Unzip the project
unzip jarvis-ai-command-center.zip

# Move to the project directory
cd jarvis-ai-command-center
```

### Option B: If you have the project on GitHub
```bash
# Clone the repository
git clone https://github.com/your-username/jarvis-ai-command-center.git

# Navigate into the project
cd jarvis-ai-command-center
```

---

## Step 4: Install Project Dependencies

```bash
# Install all npm dependencies using Bun
bun install

# This will install:
# - Expo and React Native
# - All required packages
# - Development tools
```

---

## Step 5: Start the Development Server

```bash
# Start the Expo development server
bun run start

# Alternative with tunnel (if you want external access)
bun run start -- --tunnel
```

---

## Step 6: Access the App

After starting the server, you'll see:

```
Metro waiting on exp://192.168.x.x:8081
› Press a │ open Android
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
```

### Access Methods:

#### Method 1: Expo Go App (Recommended for Mobile)
1. Install Expo Go from Play Store
2. Scan the QR code shown in Termux
3. App will open in Expo Go

#### Method 2: Web Browser
1. Press 'w' in Termux
2. Your default browser will open
3. Access at: http://localhost:8081

#### Method 3: Manual URL
- Open your browser
- Navigate to: `http://localhost:8081`
- Or use your network IP: `http://192.168.x.x:8081`

---

## Step 7: Configure JARVIS

Once the app is running:

1. **Complete Onboarding**
   - Follow the interactive tutorial
   - Set up your preferences

2. **Connect API Keys** (if using AI features)
   - Go to: Integrations → API Keys
   - Add your OpenAI/Anthropic API key
   - Save configuration

3. **Connect Social Accounts**
   - Go to: Integrations → Social Connect
   - Link your social media accounts
   - Configure platforms

4. **Set Up IoT Devices** (Optional)
   - Open JARVIS AI Assistant (brain button)
   - Say or type: "Add a 3D printer"
   - Provide device IP address and details

5. **Configure Automation**
   - Go to: Automation → Workflow Rules
   - Set up automated tasks
   - Configure scheduling

---

## Step 8: Running in Background

To keep the server running in background:

```bash
# Install tmux for session management
pkg install tmux -y

# Start a new tmux session
tmux new -s jarvis

# Run the app
bun run start

# Detach from session: Press Ctrl+B then D

# Reattach later
tmux attach -t jarvis

# List sessions
tmux ls

# Kill session
tmux kill-session -t jarvis
```

---

## Troubleshooting

### Issue: "Cannot find module"
```bash
# Clear cache and reinstall
rm -rf node_modules
rm bun.lock
bun install
```

### Issue: Port already in use
```bash
# Find and kill process on port 8081
lsof -ti:8081 | xargs kill -9

# Or use different port
bun run start -- --port 8082
```

### Issue: "expo: command not found"
```bash
# Install Expo CLI globally
bun add -g expo-cli

# Or use npx
npx expo start
```

### Issue: Network connection problems
```bash
# Use tunnel mode
bun run start -- --tunnel

# Or localhost only
bun run start -- --localhost
```

### Issue: Storage permissions
```bash
# Request storage access
termux-setup-storage

# This will prompt for permissions
```

---

## Performance Tips

1. **Close other apps** to free up RAM
2. **Use tmux** for persistent sessions
3. **Clear Metro cache** if experiencing issues:
   ```bash
   bun run start -- --clear
   ```
4. **Enable battery optimization** exceptions for Termux
5. **Keep device plugged in** for extended sessions

---

## Advanced: Production Build

```bash
# Install EAS CLI
bun add -g eas-cli

# Login to Expo account
eas login

# Build for Android
eas build --platform android --profile preview

# Build will be available for download
```

---

## Network Access from Other Devices

### Option 1: Local Network
```bash
# Find your device IP
ifconfig | grep "inet "

# Access from other devices on same network
http://YOUR_DEVICE_IP:8081
```

### Option 2: Tunnel (Public Access)
```bash
# Start with tunnel
bun run start -- --tunnel

# Share the generated URL
# Example: https://abc123.exp.direct
```

---

## Updating the App

```bash
# Pull latest changes (if using Git)
git pull origin main

# Reinstall dependencies
bun install

# Restart server
bun run start
```

---

## Uninstallation

```bash
# Stop the server
# Ctrl+C in Termux

# Remove project
cd ~
rm -rf jarvis-ai-command-center

# Uninstall Termux (from Android Settings)
```

---

## Security Best Practices

1. **Never share API keys** publicly
2. **Use environment variables** for sensitive data
3. **Keep Termux updated**: `pkg upgrade`
4. **Use strong passwords** for any authentication
5. **Limit network access** when not needed

---

## Support & Resources

- **Expo Documentation**: https://docs.expo.dev/
- **React Native Docs**: https://reactnative.dev/
- **Termux Wiki**: https://wiki.termux.com/
- **Bun Documentation**: https://bun.sh/docs

---

## Quick Reference Commands

```bash
# Start app
bun run start

# Start with tunnel
bun run start -- --tunnel

# Clear cache
bun run start -- --clear

# Check running processes
ps aux | grep node

# Check port usage
netstat -tuln | grep 8081

# System info
uname -a
```

---

## Next Steps

1. ✅ Follow the in-app tutorial
2. ✅ Configure all integrations
3. ✅ Set up automation rules
4. ✅ Connect IoT devices
5. ✅ Start using JARVIS AI features
6. ✅ Explore all 20+ pages
7. ✅ Join community for support

**Welcome to the future of AI-powered content creation!** 🚀
