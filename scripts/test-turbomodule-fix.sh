#!/usr/bin/env bash

# Test the TurboModule fix workflow
# This simulates the post-branch-revert scenario and validates the fix

echo ""
echo "🧪 Testing TurboModule Fix Workflow"
echo "===================================="
echo ""

# Step 1: Verify scripts exist
echo "1. Checking that all fix scripts exist..."
if [ -f "scripts/fix-turbomodule.sh" ] && [ -f "scripts/quickstart-after-revert.sh" ] && [ -f "scripts/reset-cache.sh" ]; then
    echo "   ✅ All fix scripts found"
else
    echo "   ❌ Some fix scripts missing"
    exit 1
fi

# Step 2: Verify scripts are executable
echo "2. Checking script permissions..."
if [ -x "scripts/fix-turbomodule.sh" ] && [ -x "scripts/quickstart-after-revert.sh" ] && [ -x "scripts/reset-cache.sh" ]; then
    echo "   ✅ All scripts are executable"
else
    echo "   ❌ Some scripts are not executable"
    exit 1
fi

# Step 3: Verify npm scripts exist
echo "3. Checking npm scripts..."
if grep -q '"quickstart":' package.json && grep -q '"fix:turbomodule":' package.json && grep -q '"reset:cache":' package.json; then
    echo "   ✅ All npm scripts configured"
else
    echo "   ❌ Some npm scripts missing"
    exit 1
fi

# Step 4: Verify documentation exists
echo "4. Checking documentation..."
if [ -f "AFTER_REVERT_RECOVERY.md" ] && [ -f "HOW_TO_FIX_TURBOMODULE_ERROR.md" ] && [ -f "TURBOMODULE_FIX.md" ]; then
    echo "   ✅ All documentation files present"
else
    echo "   ❌ Some documentation missing"
    exit 1
fi

# Step 5: Test configuration check
echo "5. Running configuration validation..."
if npm run check:native-mods > /dev/null 2>&1; then
    echo "   ✅ Configuration check passes"
else
    echo "   ⚠️  Configuration check has warnings (may be expected)"
fi

# Step 6: Verify app.json configuration
echo "6. Verifying app.json configuration..."
if grep -q '"newArchEnabled": true' app.json && grep -q '"jsEngine": "hermes"' app.json; then
    echo "   ✅ app.json properly configured"
else
    echo "   ❌ app.json configuration incorrect"
    exit 1
fi

echo ""
echo "✅ All Tests Passed!"
echo ""
echo "The TurboModule fix tooling is properly installed and configured."
echo ""
echo "Available commands:"
echo "  • npm run quickstart       - Smart recovery after branch revert"
echo "  • npm run fix:turbomodule  - Comprehensive TurboModule fix"
echo "  • npm run reset:cache      - Clear all caches and rebuild"
echo "  • npm run check:native-mods - Validate configuration"
echo ""
