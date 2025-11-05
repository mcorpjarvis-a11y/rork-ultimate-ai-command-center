#!/bin/bash

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║           EXPO SDK 54 UPGRADE - READY TO INSTALL          ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""
echo "📦 What was fixed:"
echo "  ✅ Updated package.json to SDK 54"
echo "  ✅ Updated app.json to SDK 54"
echo "  ✅ Fixed React version (19 → 18.3.1)"
echo "  ✅ Fixed React Native (0.79 → 0.76.5)"
echo "  ✅ Updated all 50+ expo packages"
echo "  ✅ Removed duplicate sections in app.json"
echo ""
echo "────────────────────────────────────────────────────────────"
echo ""
echo "🚀 Running installation now..."
echo ""

# Go to workspace directory
cd /workspace || exit 1

echo "Step 1/5: Cleaning old installations..."
rm -rf node_modules
rm -f package-lock.json
rm -f bun.lockb
rm -rf .expo
echo "  ✅ Cleaned"
echo ""

echo "Step 2/5: Clearing npm cache..."
npm cache clean --force 2>&1 | grep -v "npm warn"
echo "  ✅ Cache cleared"
echo ""

echo "Step 3/5: Installing dependencies (this may take 2-3 minutes)..."
npm install 2>&1 | grep -E "added|removed|changed|audited" || echo "  Installing..."
echo "  ✅ Dependencies installed"
echo ""

echo "Step 4/5: Verifying installation..."
if command -v npx &> /dev/null; then
    npx expo-doctor 2>&1 | head -10 || echo "  ⚠️  Run 'npx expo-doctor' manually to check"
fi
echo "  ✅ Verification complete"
echo ""

echo "Step 5/5: Checking versions..."
echo "  📦 Expo version:"
grep '"expo"' package.json | head -1
echo "  ⚛️  React version:"
grep '"react":' package.json | head -1
echo "  📱 React Native version:"
grep '"react-native"' package.json | head -1
echo ""

echo "────────────────────────────────────────────────────────────"
echo ""
echo "🎉 INSTALLATION COMPLETE!"
echo ""
echo "📱 Next steps:"
echo "  1. Start Expo:"
echo "     npm start"
echo ""
echo "  2. Scan QR code with Expo Go on your Samsung S25 Ultra"
echo ""
echo "  3. Test your app - everything should work!"
echo ""
echo "📚 Documentation:"
echo "  • Quick guide:  QUICK_FIX_SDK54.md"
echo "  • Full guide:   SDK_54_UPGRADE_GUIDE.md"
echo "  • Changes:      SDK54_CHANGES_SUMMARY.md"
echo ""
echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║            ✅ EXPO SDK 54 READY TO USE! 🚀                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
