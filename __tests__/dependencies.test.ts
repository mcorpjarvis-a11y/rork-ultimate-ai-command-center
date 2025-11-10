/**
 * Dependency Compatibility Tests
 * 
 * These tests verify that critical dependencies are properly installed
 * and compatible with Expo SDK 54 and React Native 0.82.1.
 */

describe('Dependency Compatibility', () => {
  test('React version matches React Native 0.82.1 requirements', () => {
    const React = require('react');
    expect(React.version).toBe('19.1.1');
  });

  test('React DOM version matches React version', () => {
    const ReactDOM = require('react-dom');
    expect(ReactDOM.version).toBe('19.1.1');
  });

  test('React Native is properly installed', () => {
    // Just verify the package can be required
    const RN = require('react-native');
    expect(RN).toBeDefined();
  });

  test('React Navigation is compatible', () => {
    const { NavigationContainer } = require('@react-navigation/native');
    expect(NavigationContainer).toBeDefined();
  });

  test('React Query is accessible', () => {
    const { QueryClient } = require('@tanstack/react-query');
    expect(QueryClient).toBeDefined();
  });

  test('TRPC client is accessible', () => {
    const { createTRPCProxyClient } = require('@trpc/client');
    expect(createTRPCProxyClient).toBeDefined();
  });

  test('Zod validation library is accessible', () => {
    const { z } = require('zod');
    expect(z).toBeDefined();
    expect(typeof z.string).toBe('function');
  });
});
