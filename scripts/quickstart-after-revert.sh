#!/usr/bin/env bash

# JARVIS Quickstart After Branch Revert
# Automatically detects and fixes issues after reverting branches/merges
# This is the ONE script you need after going back to a previous state

set -e

echo ""
echo "⚡ ════════════════════════════════════════════════════════════"
echo "⚡   JARVIS QUICKSTART AFTER REVERT"
echo "⚡   Automatically detecting and fixing issues..."
echo "⚡ ════════════════════════════════════════════════════════════"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track what needs fixing
needs_npm_install=false
needs_cache_clear=false
needs_prebuild=false

echo "🔍 Detecting issues..."
echo ""

# Check 1: node_modules
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  node_modules is missing${NC}"
    needs_npm_install=true
else
    # Check if critical packages exist
    if [ ! -f "node_modules/react-native/package.json" ] || [ ! -f "node_modules/expo/package.json" ]; then
        echo -e "${YELLOW}⚠️  node_modules exists but is incomplete${NC}"
        needs_npm_install=true
    else
        echo -e "${GREEN}✅ node_modules exists and has core packages${NC}"
    fi
fi

# Check 2: Expo caches
if [ -d ".expo" ] || [ -d ".expo-shared" ]; then
    echo -e "${YELLOW}⚠️  Expo cache directories found (should be cleared)${NC}"
    needs_cache_clear=true
else
    echo -e "${GREEN}✅ No stale Expo cache directories${NC}"
fi

# Check 3: Metro cache
if [ -d "$HOME/.expo" ]; then
    echo -e "${YELLOW}⚠️  Metro cache found (should be cleared)${NC}"
    needs_cache_clear=true
else
    echo -e "${GREEN}✅ No stale Metro cache${NC}"
fi

# Check 4: Native directories
if [ ! -d "android" ] && [ ! -d "ios" ]; then
    echo -e "${YELLOW}⚠️  Native build directories missing (may need prebuild)${NC}"
    needs_prebuild=true
else
    echo -e "${GREEN}✅ Native build directories exist${NC}"
fi

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

# Summary of what will be done
echo "📋 Action Plan:"
echo ""
if [ "$needs_npm_install" = true ]; then
    echo "  1. ❌ Reinstall dependencies (npm install)"
else
    echo "  1. ✅ Skip npm install (dependencies OK)"
fi

if [ "$needs_cache_clear" = true ]; then
    echo "  2. ❌ Clear all caches"
else
    echo "  2. ✅ Skip cache clear (no stale caches)"
fi

if [ "$needs_prebuild" = true ]; then
    echo "  3. ❌ Run expo prebuild"
else
    echo "  3. ✅ Skip prebuild (native dirs exist)"
fi

echo ""

# Ask for confirmation
read -p "Do you want to proceed with the fixes? (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted by user."
    exit 0
fi

echo ""
echo "🔧 Applying fixes..."
echo ""

# Fix 1: npm install
if [ "$needs_npm_install" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "📦 Reinstalling dependencies..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    rm -rf node_modules
    npm install
    echo ""
    echo -e "${GREEN}✅ Dependencies reinstalled!${NC}"
    echo ""
fi

# Fix 2: Clear caches
if [ "$needs_cache_clear" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🧹 Clearing all caches..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    rm -rf .expo .expo-shared
    rm -rf ~/.expo 2>/dev/null || true
    rm -rf $TMPDIR/metro-* 2>/dev/null || true
    rm -rf $TMPDIR/haste-* 2>/dev/null || true
    echo ""
    echo -e "${GREEN}✅ All caches cleared!${NC}"
    echo ""
fi

# Fix 3: Prebuild
if [ "$needs_prebuild" = true ]; then
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🔧 Running expo prebuild..."
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    npx expo prebuild --clean
    echo ""
    echo -e "${GREEN}✅ Prebuild complete!${NC}"
    echo ""
fi

# Final validation
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔍 Running final validation..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm run check:native-mods
validation_result=$?

echo ""
echo "════════════════════════════════════════════════════════════"
echo ""

if [ $validation_result -eq 0 ]; then
    echo -e "${GREEN}✅ ════════════════════════════════════════════════════════════${NC}"
    echo -e "${GREEN}✅   ALL FIXES APPLIED SUCCESSFULLY!${NC}"
    echo -e "${GREEN}✅   TurboModule error should be resolved${NC}"
    echo -e "${GREEN}✅ ════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "🚀 Ready to start! Run one of these commands:"
    echo ""
    echo "   ${BLUE}npm run start:all${NC}    - Start both backend and frontend"
    echo "   ${BLUE}npx expo start -c${NC}    - Start just Metro with clean cache"
    echo ""
else
    echo -e "${RED}❌ ════════════════════════════════════════════════════════════${NC}"
    echo -e "${RED}❌   Some validation checks failed${NC}"
    echo -e "${RED}❌ ════════════════════════════════════════════════════════════${NC}"
    echo ""
    echo "Try running the comprehensive fix:"
    echo "   ${BLUE}npm run fix:turbomodule${NC}"
    echo ""
    exit 1
fi
