/**
 * Migration 002: Add Social Media Posts Schema
 * 
 * Adds storage structure for social media posts, scheduling, and analytics
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import MigrationRunner from '../MigrationRunner';

MigrationRunner.registerMigration({
  version: 2,
  name: 'add_social_media_schema',
  description: 'Add storage for social media posts, schedules, and analytics',

  async up() {
    console.log('[Migration 002] Adding social media schema');

    // Initialize posts storage
    const posts = {
      posts: [],
      lastUpdated: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:social_posts', JSON.stringify(posts));

    // Initialize analytics snapshots
    const analytics = {
      snapshots: [],
      lastSnapshot: new Date().toISOString(),
    };

    await AsyncStorage.setItem('@jarvis:analytics_snapshots', JSON.stringify(analytics));

    console.log('[Migration 002] Social media schema added');
  },

  async down() {
    console.log('[Migration 002] Rolling back social media schema');

    await AsyncStorage.removeItem('@jarvis:social_posts');
    await AsyncStorage.removeItem('@jarvis:analytics_snapshots');

    console.log('[Migration 002] Social media schema rolled back');
  },
});
