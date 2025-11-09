# Backend Development Guide

## Overview

The JARVIS backend is a Node.js Express server that provides API endpoints for the mobile app. The backend has been isolated from frontend dependencies to ensure it can run in a pure Node.js environment without requiring React Native or Expo modules.

## Architecture

- **Runtime**: Pure Node.js (no React Native/Expo)
- **Build Tool**: esbuild (for fast compilation and proper module handling)
- **TypeScript Config**: Restricted to ES2020 libs only (no DOM APIs)
- **Package Strategy**: External dependencies (not bundled into output)

## Key Changes for Backend Isolation

### 1. TypeScript Configuration (`backend/tsconfig.json`)

- **Removed DOM lib**: Only `["ES2020"]` is included to prevent browser global leakage
- **Type restrictions**: `types: ["node"]` and `typeRoots: ["../node_modules/@types"]` ensure only Node types are available
- **Excluded frontend dirs**: Prevents accidental inclusion of React Native components

### 2. Build Process

The backend now uses **esbuild** instead of plain TypeScript compilation because:
- esbuild can mark React Native packages as external
- Prevents the "Unexpected typeof" error when transforming `react-native/index.js`
- Faster builds and better module resolution

**Build script**: `scripts/build-backend.js`
- Marks all React Native/Expo packages as external
- Bundles backend code but excludes node_modules
- Outputs to `backend/dist/server.express.js`

### 3. ESLint Safeguards (`backend/.eslintrc.json`)

Prevents accidental imports of:
- `react-native` and React Native packages
- `expo` and Expo SDK packages
- `react` and `react-dom`
- `@react-native-async-storage` and similar

If you try to import these in backend code, you'll get a lint error explaining why.

### 4. Verification Script

**Script**: `scripts/verify-backend-isolated.js`
- Spawns the compiled backend server
- Verifies it reaches "ONLINE" state
- Gracefully shuts it down
- Used in CI to catch regressions

## Development Modes

### Development Mode (Hot Reload)

```bash
npm run dev:backend
```

Uses `tsx watch` for instant TypeScript compilation and hot reload. This is convenient for development but runs TypeScript directly (which is why we need the isolation fixes).

### Production Build & Run

```bash
npm run start:backend
```

This will:
1. Build the backend: `npm run build:backend`
2. Start the compiled JS: `npm run start:backend:prod`

Or run them separately:
```bash
npm run build:backend
npm run start:backend:prod
```

### Verification

```bash
npm run verify:backend
```

Builds the backend and verifies it starts successfully. This is run in CI.

## Why These Changes?

### Problem: esbuild TransformError

The backend was previously started with `tsx backend/server.express.ts`, which would:
1. Transform backend TypeScript on-the-fly
2. Follow imports to `services/` folder
3. Services import React Native modules (AsyncStorage, Platform, etc.)
4. esbuild tries to transform `node_modules/react-native/index.js`
5. **CRASH**: "Unexpected typeof" error due to Flow syntax in React Native

### Solution: Precompiled + External Packages

1. **Build first**: Compile TS to JS ahead of time
2. **Mark as external**: Tell esbuild not to bundle React Native packages
3. **Runtime isolation**: Backend runs as pure Node.js (if services try to use RN features, they'll fail at runtime, which is expected)

### Reasoning for Excluding DOM lib

- Backend runs in Node.js, not a browser
- DOM globals (`window`, `document`, `localStorage`, etc.) don't exist
- Including DOM types increases risk of writing browser-specific code
- TypeScript should error if you try to use DOM APIs in backend

## Troubleshooting

### Build Succeeds but Server Crashes at Runtime

**Symptom**: Build completes, but `npm run start:backend:prod` crashes with module errors.

**Cause**: The backend is importing services that use React Native modules (AsyncStorage, Platform, etc.). These modules are marked as external during build, so Node.js tries to load them at runtime and fails.

**Solutions**:
1. **Recommended**: Refactor backend to not import services with RN dependencies
2. **Workaround**: Run backend in dev mode: `npm run dev:backend` (uses tsx which handles this better)
3. **Future**: Create backend-specific service implementations without RN dependencies

### TypeScript Errors During Build

**Symptom**: Many TypeScript errors shown during `npm run build:backend`.

**Expected**: The build uses `noEmitOnError: false` to continue despite type errors. As long as the build completes and outputs `backend/dist/server.express.js`, it's working correctly.

**Why**: The services folder has pre-existing type errors. Fixing them is out of scope for this isolation work.

### Lint Errors for Restricted Imports

**Symptom**: ESLint error: "React Native imports are not allowed in backend code"

**Cause**: You're trying to import a React Native or Expo package in backend code.

**Solution**: Remove the import and use Node.js alternatives:
- Instead of `AsyncStorage`: Use `fs` or a database
- Instead of `Platform.OS`: Use `process.platform`
- Instead of React components: Backend doesn't render UI

### "Cannot find module" at Runtime

**Symptom**: `Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'expo-secure-store'`

**Cause**: The backend code is trying to use an Expo/React Native module that's marked as external.

**Solution**: The code path using that module should not be executed in backend context. Check if the service has a backend-compatible code path or refactor to avoid the dependency.

## Testing

### Manual Testing

1. **Clean build**:
   ```bash
   rm -rf backend/dist
   npm run build:backend
   ```

2. **Start server**:
   ```bash
   npm run start:backend:prod
   ```
   
   Look for: "✅ Server is ONLINE"

3. **Test health endpoint**:
   ```bash
   curl http://localhost:3000/
   ```

4. **Test lint restrictions**:
   Add to any backend `.ts` file:
   ```typescript
   import { View } from 'react-native'; // Should fail lint
   ```
   
   Then run:
   ```bash
   npm run lint
   ```

### Automated Testing

```bash
npm run verify:backend
```

This will:
- Build the backend
- Start the server
- Wait for "ONLINE" message
- Shut down gracefully
- Exit 0 on success, 1 on failure

## CI/CD

The backend verification runs automatically on:
- Pushes to `main`, `develop`, `copilot/**` branches
- Pull requests to `main`, `develop`
- Only when backend-related files change

**Workflow**: `.github/workflows/backend-verify.yml`

## Project Structure

```
backend/
├── dist/                    # Compiled output (gitignored)
│   └── server.express.js    # Built server
├── routes/                  # API route handlers
├── middleware/              # Express middleware
├── trpc/                    # tRPC configuration
├── websocket/               # WebSocket manager
├── config/                  # Environment config
├── server.express.ts        # Main server entry point
├── tsconfig.json            # Backend TypeScript config
└── .eslintrc.json           # Backend-specific ESLint rules

scripts/
├── build-backend.js         # esbuild-based build script
└── verify-backend-isolated.js  # Startup verification script
```

## Future Improvements

1. **Service Layer Refactor**: Create backend-specific service implementations without React Native dependencies
2. **Dependency Injection**: Use DI to inject different implementations for backend vs frontend
3. **Shared Core Logic**: Extract business logic that doesn't depend on platform-specific APIs
4. **Type Safety**: Gradually fix TypeScript errors in services folder
5. **Integration Tests**: Add comprehensive backend API tests

## Getting Help

- **Build issues**: Check `backend/dist/` was created and contains `server.express.js`
- **Runtime crashes**: Check which service is being imported and if it uses React Native APIs
- **Type errors**: These are expected; build should still succeed
- **Lint errors**: Check the import path and use Node.js alternatives

For more information, see:
- [Main README](../README.md)
- [Master Checklist](../MASTER_CHECKLIST.md)
- Backend issues: Check GitHub Issues with `backend` label
