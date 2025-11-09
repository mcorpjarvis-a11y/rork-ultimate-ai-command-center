/**
 * Migration 003: Add Monetization and IoT Schemas
 * 
 * Adds storage for revenue streams and IoT devices
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import MigrationRunner from '../MigrationRunner';

MigrationRunner.registerMigration({
  version: 3,
  name: 'add_monetization_iot_schemas',
  description: 'Add storage for monetization tracking and IoT devices',

  async up() {
    console.log('[Migration 003] Adding monetization and IoT schemas');

    // Initialize revenue streams
    const revenueStreams = {
      streams: [],
      totalRevenue: 0,
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:revenue_streams', JSON.stringify(revenueStreams));

    // Initialize IoT devices
    const iotDevices = {
      devices: [],
      lastDiscovery: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:iot_devices', JSON.stringify(iotDevices));

    console.log('[Migration 003] Monetization and IoT schemas added');
  },

  async down() {
    console.log('[Migration 003] Rolling back monetization and IoT schemas');

    await AsyncStorage.removeItem('@jarvis:revenue_streams');
    await AsyncStorage.removeItem('@jarvis:iot_devices');

    console.log('[Migration 003] Monetization and IoT schemas rolled back');
  },
});
