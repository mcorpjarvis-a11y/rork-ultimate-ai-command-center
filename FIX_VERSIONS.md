# Fix Expo SDK 53 Package Versions

Your packages have wrong versions for Expo SDK 53. Run this command to fix all versions automatically:

```bash
npx expo install --fix
```

This will update all packages to their correct SDK 53 versions.

## Manual Fix (if needed)

If the above doesn't work, install these specific versions:

```bash
bun install expo-constants@~17.1.7 \
  expo-device@~13.3.2 \
  expo-image@~2.4.1 \
  expo-linking@~11.1.7 \
  expo-router@~18.1.6 \
  expo-splash-screen@~0.30.10 \
  expo-status-bar@~0.4.5 \
  expo-system-ui@~5.0.11 \
  expo-web-browser@~14.2.0 \
  react-native@0.79.6 \
  react-native-safe-area-context@5.1.0 \
  react-native-screens@~4.1.1
```

## After fixing versions:

1. Clear cache: `npx expo start --clear`
2. Delete node_modules: `rm -rf node_modules`
3. Reinstall: `bun install`
4. Start fresh: `bun start`
