# Testing Framework Documentation

## Overview

This project uses **Jest** with **React Native Testing Library** for comprehensive testing. The testing framework is optimized for **Termux, Expo Go, and Android (Samsung S25 Ultra)** environments.

## Test Structure

```
services/auth/__tests__/
├── AuthManager.test.ts         # AuthManager unit tests
├── providerRegistry.test.ts    # Provider registry validation tests
└── integration.test.ts         # Integration and compatibility tests

scripts/
├── test-metro-config.js        # Metro bundler configuration validation
├── test-provider-registry.js   # Static provider registry validation
└── test-pipeline.js           # Comprehensive test pipeline runner
```

## Running Tests

### Run All Tests
```bash
npm test
```

### Run Tests in Watch Mode
```bash
npm run test:watch
```

### Run Tests with Coverage
```bash
npm run test:coverage
```

### Run Auth Tests Only
```bash
npm run test:auth
```

### Run Complete Test Pipeline
```bash
npm run test:all
```

### Run Validation Scripts
```bash
npm run test:metro-config          # Validate Metro bundler config
npm run test:provider-registry     # Validate provider registry
```

## Test Categories

### 1. Unit Tests (Jest)
- **AuthManager Tests**: Tests provider loading, token management, and event system
- **Provider Registry Tests**: Validates all providers export required functions
- **Integration Tests**: Tests Metro bundler compatibility and full auth flow

### 2. Validation Scripts
- **Metro Config Validation**: Ensures Metro bundler is properly configured
- **Provider Registry Validation**: Ensures all providers are statically imported
- **Startup Tests**: Validates dependency management

## Key Features

### Metro Bundler Compatibility
✅ **No dynamic imports** - All provider helpers use static imports  
✅ **Static registry** - Provider registry is built at compile time  
✅ **Path aliases** - Proper @/ path resolution configured  

### Android/Expo Go Compatibility
✅ **Expo-compatible** - Uses `jest-expo` preset  
✅ **React Native mocks** - Proper mocking for RN components  
✅ **Secure Store mocks** - Mocked secure storage for tests  

### Termux Compatibility
✅ **Node.js tests** - All tests run in Node.js environment  
✅ **No native dependencies** - Tests don't require native compilation  
✅ **Fast execution** - Tests complete in ~2 seconds  

## Test Pipeline

The test pipeline (`npm run test:all`) runs tests in this order:

1. **Metro Configuration Validation** (Critical)
2. **Provider Registry Validation** (Critical)
3. **Unit Tests with Jest** (Critical)
4. **ESLint** (Non-critical)

Critical tests must pass for the pipeline to succeed.

## Configuration Files

### jest.config.js
- Preset: `jest-expo`
- Transform ignore patterns for React Native
- Module name mapper for @/ alias
- Coverage thresholds (50% minimum)

### jest.setup.js
- Mocks Expo modules (auth-session, web-browser, secure-store)
- Mocks React Native modules
- Suppresses console warnings in tests

## Coverage

Current test coverage:
- **80 tests** passing
- **3 test suites** (AuthManager, Provider Registry, Integration)
- **Coverage targets**: 50% minimum (branches, functions, lines, statements)

## Writing Tests

### Example: Testing a Provider
```typescript
describe('My Provider', () => {
  test('should have required functions', () => {
    const provider = require('../providerHelpers/myprovider');
    expect(typeof provider.startAuth).toBe('function');
    expect(typeof provider.refreshToken).toBe('function');
    expect(typeof provider.revokeToken).toBe('function');
  });
});
```

### Example: Testing AuthManager
```typescript
describe('AuthManager', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should load provider from registry', async () => {
    const result = await AuthManager.startAuthFlow('google');
    expect(result).toBe(true);
  });
});
```

## Continuous Integration

The test pipeline can be integrated with CI/CD:

```bash
# Run all tests and validations
npm run test:all

# Exit code 0 = success, 1 = failure
```

## Troubleshooting

### Tests fail with "Cannot find module"
- Run `npm install` to ensure all dependencies are installed
- Check that `jest-expo` and testing libraries are installed

### Metro bundler errors during tests
- Ensure `metro.config.js` exists
- Run `npm run test:metro-config` to validate configuration

### Provider loading errors
- Ensure all providers are in `services/auth/providerHelpers/`
- Run `npm run test:provider-registry` to validate

### Tests hang or timeout
- Check that async operations are properly awaited
- Ensure mocks are returning resolved promises

## Android-Specific Notes

### Running on Samsung S25 Ultra
The tests are designed to work with:
- **Android API Level**: 31+ (Android 12+)
- **Expo Go**: Latest version
- **Metro Bundler**: Static imports only (no dynamic imports)

### Termux Environment
Tests can be run directly in Termux:
```bash
# In Termux
cd /data/data/com.termux/files/home/your-project
npm test
```

## Best Practices

1. **Always run tests before committing**
   ```bash
   npm run test:all
   ```

2. **Use watch mode during development**
   ```bash
   npm run test:watch
   ```

3. **Check coverage regularly**
   ```bash
   npm run test:coverage
   ```

4. **Validate Metro config after changes**
   ```bash
   npm run test:metro-config
   ```

5. **Test on actual device**
   ```bash
   npm run android  # Build and test on S25 Ultra
   ```

## Support

For issues related to:
- **Jest/Testing**: Check `jest.config.js` and `jest.setup.js`
- **Metro Bundler**: Check `metro.config.js`
- **Provider Registry**: Check `services/auth/AuthManager.ts`
- **Android/Expo**: Check Expo documentation

## Future Enhancements

Potential improvements:
- [ ] E2E tests with Detox
- [ ] Visual regression tests
- [ ] Performance benchmarking
- [ ] Device farm integration
- [ ] Automated CI/CD pipeline
