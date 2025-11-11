#!/usr/bin/env bash

# JARVIS Cache Reset Script
# Clears all caches and rebuilds the Expo project to fix TurboModule issues

set -e

echo ""
echo "🧹 ════════════════════════════════════════════════════════════"
echo "🧹   JARVIS CACHE RESET"
echo "🧹   Cleaning all caches and rebuilding..."
echo "🧹 ════════════════════════════════════════════════════════════"
echo ""

# Step 1: Remove node_modules and caches
echo "📦 Removing node_modules..."
rm -rf node_modules

echo "🗑️  Removing .expo and .expo-shared..."
rm -rf .expo .expo-shared

echo "🗑️  Removing Metro cache..."
rm -rf ~/.expo
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

# Step 2: Reinstall dependencies
echo ""
echo "📥 Installing fresh dependencies..."
npm install

# Step 3: Run expo prebuild --clean
echo ""
echo "🔧 Running expo prebuild --clean..."
npx expo prebuild --clean

# Step 4: Start with clean cache
echo ""
echo "✅ ════════════════════════════════════════════════════════════"
echo "✅   Cache reset complete!"
echo "✅ ════════════════════════════════════════════════════════════"
echo ""
echo "🚀 Starting Metro with clean cache..."
echo ""
npx expo start -c
