// Jest setup file that runs AFTER the test framework is installed
// This file has access to beforeEach, afterEach, etc.

// Clear storage before each test
beforeEach(() => {
  if (global.clearTestStorage) {
    global.clearTestStorage();
  }
});
