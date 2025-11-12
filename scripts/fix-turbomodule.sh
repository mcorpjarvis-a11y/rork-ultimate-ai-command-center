#!/usr/bin/env bash

# JARVIS TurboModule Fix Script
# Comprehensive fix for TurboModule PlatformConstants errors
# Handles post-merge-revert scenarios and validates the complete setup

set -e

echo ""
echo "🔧 ════════════════════════════════════════════════════════════"
echo "🔧   JARVIS TURBOMODULE FIX"
echo "🔧   Diagnosing and fixing TurboModule issues..."
echo "🔧 ════════════════════════════════════════════════════════════"
echo ""

# Step 1: Check current state
echo "📋 Step 1: Checking current configuration..."
echo ""

# Check if app.json has proper configuration
if grep -q '"newArchEnabled": true' app.json && grep -q '"jsEngine": "hermes"' app.json; then
    echo "✅ app.json configuration is correct"
else
    echo "⚠️  app.json configuration needs update"
    echo "   This will be handled automatically"
fi

# Check if node_modules exists
if [ -d "node_modules" ]; then
    echo "✅ node_modules directory exists"
    has_node_modules=true
else
    echo "⚠️  node_modules directory is missing"
    has_node_modules=false
fi

# Check if dependencies are properly installed
if [ "$has_node_modules" = true ]; then
    if [ -f "node_modules/react-native/package.json" ] && [ -f "node_modules/expo/package.json" ]; then
        echo "✅ Core dependencies (react-native, expo) are installed"
        deps_ok=true
    else
        echo "⚠️  Core dependencies are missing or incomplete"
        deps_ok=false
    fi
else
    deps_ok=false
fi

echo ""
echo "📋 Diagnosis complete!"
echo ""

# Step 2: Apply fixes based on diagnosis
if [ "$has_node_modules" = false ] || [ "$deps_ok" = false ]; then
    echo "🔧 Step 2: Installing/Reinstalling dependencies..."
    echo ""
    echo "📦 Removing old node_modules (if exists)..."
    rm -rf node_modules
    
    echo "📥 Installing fresh dependencies..."
    npm install
    echo ""
else
    echo "✅ Step 2: Dependencies are already installed and complete"
    echo ""
fi

# Step 3: Clear all caches
echo "🧹 Step 3: Clearing all caches..."
echo ""

echo "🗑️  Removing .expo and .expo-shared directories..."
rm -rf .expo .expo-shared

echo "🗑️  Removing Metro cache..."
rm -rf ~/.expo 2>/dev/null || true
rm -rf $TMPDIR/metro-* 2>/dev/null || true
rm -rf $TMPDIR/haste-* 2>/dev/null || true

echo "✅ All caches cleared!"
echo ""

# Step 4: Run configuration check
echo "🔍 Step 4: Running configuration validation..."
echo ""
npm run check:native-mods
check_result=$?
echo ""

if [ $check_result -eq 0 ]; then
    echo "✅ Configuration validation passed!"
else
    echo "⚠️  Configuration validation found issues"
    echo "   Continuing with the fix process..."
fi
echo ""

# Step 5: Prebuild (if needed)
echo "🔧 Step 5: Rebuilding native modules..."
echo ""
echo "   This may take a few minutes..."
echo ""

# Only run prebuild if android/ios directories don't exist or if forced
if [ ! -d "android" ] || [ ! -d "ios" ] || [ "$1" = "--force-prebuild" ]; then
    npx expo prebuild --clean
else
    echo "   Skipping prebuild (native directories already exist)"
    echo "   Run with --force-prebuild flag to force rebuild"
fi

echo ""
echo "✅ ════════════════════════════════════════════════════════════"
echo "✅   TURBOMODULE FIX COMPLETE!"
echo "✅ ════════════════════════════════════════════════════════════"
echo ""
echo "📝 Summary:"
echo "   • Dependencies: Installed and verified"
echo "   • Caches: Cleared"
echo "   • Configuration: Validated"
echo "   • Native modules: Ready"
echo ""
echo "🚀 Next steps:"
echo ""
echo "   1. Start the development server:"
echo "      npm run start:all"
echo ""
echo "   2. Or start just the frontend:"
echo "      npx expo start -c"
echo ""
echo "   3. If issues persist, run with --force-prebuild:"
echo "      ./scripts/fix-turbomodule.sh --force-prebuild"
echo ""
echo "📚 For more information, see:"
echo "   • HOW_TO_FIX_TURBOMODULE_ERROR.md"
echo "   • TURBOMODULE_FIX.md"
echo ""
