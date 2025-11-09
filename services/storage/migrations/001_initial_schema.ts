/**
 * Migration 001: Initial Schema
 * 
 * Sets up the initial data structure for JARVIS storage
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import MigrationRunner from '../MigrationRunner';

MigrationRunner.registerMigration({
  version: 1,
  name: 'initial_schema',
  description: 'Create initial storage structure for profiles, API keys, and settings',

  async up() {
    console.log('[Migration 001] Creating initial schema');

    // Initialize master profile structure
    const masterProfile = {
      id: 'master',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      connectedProviders: [],
      settings: {
        voiceEnabled: false,
        darkMode: true,
        notifications: true,
      },
    };

    await AsyncStorage.setItem('@jarvis:master_profile', JSON.stringify(masterProfile));

    // Initialize API keys structure
    const apiKeys = {
      providers: {},
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:api_keys', JSON.stringify(apiKeys));

    // Initialize connected providers structure
    const connectedProviders = {
      providers: [],
      lastSync: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:connected_providers', JSON.stringify(connectedProviders));

    console.log('[Migration 001] Initial schema created');
  },

  async down() {
    console.log('[Migration 001] Rolling back initial schema');

    await AsyncStorage.removeItem('@jarvis:master_profile');
    await AsyncStorage.removeItem('@jarvis:api_keys');
    await AsyncStorage.removeItem('@jarvis:connected_providers');

    console.log('[Migration 001] Initial schema rolled back');
  },
});
