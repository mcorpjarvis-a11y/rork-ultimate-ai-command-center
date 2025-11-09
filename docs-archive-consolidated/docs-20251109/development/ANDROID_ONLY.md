# Android-Only Project

## Overview

This project is **Android-only** and does **NOT** support iOS/Apple platforms. It is specifically designed for:

- **Development environment**: Galaxy S25 Ultra via Termux / Expo Go
- **Target platform**: Android devices
- **Distribution method**: APK for sideloading (not for app stores)

## Why Android-Only?

This project has been intentionally configured to support only Android to:

1. Simplify the development workflow for Android-focused deployment
2. Eliminate iOS-specific dependencies and configurations
3. Optimize for Termux-based development on Android devices
4. Focus on APK builds for sideloading

## Platform Configuration

### Explicitly Restricted Platforms

The `app.json` configuration explicitly limits platforms:

```json
{
  "expo": {
    "platforms": ["android"]
  }
}
```

### Removed iOS Configurations

The following iOS-specific configurations have been completely removed:

- **iOS block in app.json**: Including bundleIdentifier, infoPlist, and iCloud settings
- **iOS directory**: The entire `/ios` native directory
- **iCloud configurations**: Removed from all plugins (e.g., expo-document-picker)
- **iOS-specific code**: All `Platform.OS === 'ios'` conditional logic
- **iOS script**: Removed from package.json

## Development Guidelines

### ✅ DO

- Develop and test on Android devices
- Use Expo Go on Android for development
- Build APKs using `npm run build:apk`
- Focus on Android-specific optimizations
- Test Android permissions and features

### ❌ DON'T

- Add iOS configurations back to app.json
- Create or restore the `/ios` directory
- Add iOS-specific conditional code (`Platform.OS === 'ios'`)
- Include iOS-specific plugins or configurations
- Attempt to run `expo run:ios` or similar iOS commands

## Maintenance Expectations

### Prevention Mechanism

A guard script (`scripts/prevent-ios.js`) runs before `npm start` to ensure iOS configurations don't accidentally get reintroduced:

```bash
npm start  # Automatically runs prevent-ios.js check
```

The script will **fail startup** if it detects:

- An `ios` block in app.json
- iOS in the platforms array
- iCloud configurations in plugins

### Contributing

When contributing to this project:

1. **Never reintroduce iOS support** - This is a permanent architectural decision
2. **Test on Android only** - Use Android devices or emulators for testing
3. **Avoid cross-platform abstractions** that add iOS support
4. **Remove iOS conditionals** - Simplify code by removing unnecessary Platform.OS checks
5. **Document Android-specific features** - Focus documentation on Android deployment

### Code Review Checklist

Before submitting a PR, ensure:

- [ ] No `ios` block exists in app.json
- [ ] No iOS-specific Platform.OS checks in code
- [ ] No iCloud or iOS-specific plugin configurations
- [ ] Documentation doesn't reference iOS deployment
- [ ] The prevent-ios.js guard script passes
- [ ] Android build and tests pass

## Building and Distribution

### Development Build

```bash
# Start development server
npm start

# Run on Android device/emulator
npm run android
```

### Release APK Build

```bash
# Build release APK for sideloading
npm run build:apk
```

### Distribution

- **APK files** can be sideloaded to Android devices
- **No Google Play Store** submission required
- **No Apple App Store** - iOS is not supported

## Reverting This Decision

If you need to add iOS support in the future (not recommended), you would need to:

1. Remove the `prestart` script from package.json
2. Delete or modify scripts/prevent-ios.js
3. Add back the `ios` block to app.json
4. Run `npx expo prebuild` to regenerate iOS native directory
5. Add back iOS-specific conditional code
6. Update documentation
7. Test on iOS devices

**Note**: This would be a significant architectural change and is explicitly out of scope for this project.

## Questions or Issues?

If you encounter issues related to the Android-only configuration:

1. Check that you're not trying to run iOS-specific commands
2. Verify your app.json doesn't contain iOS configurations
3. Ensure you're testing on Android devices or emulators
4. Review the prevent-ios.js script for validation rules

## Summary

This project is **permanently Android-only** by design. All iOS support has been completely removed, and guard mechanisms prevent its reintroduction. Focus all development, testing, and distribution efforts on the Android platform.
