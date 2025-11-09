/**
 * Tests for MigrationRunner
 */

import MigrationRunner from '../MigrationRunner';
import AsyncStorage from '@react-native-async-storage/async-storage';

describe('MigrationRunner', () => {
  // Note: Tests may have interdependencies due to static migrations array
  // In production, migrations are registered once at app startup
  
  beforeEach(async () => {
    // Clear migrations to ensure clean state for each test
    // Access private property for testing purposes
    (MigrationRunner as any).migrations = [];
    
    // Clear AsyncStorage
    await AsyncStorage.clear();
  });

  describe('Version Management', () => {
    test('should start at version 0', async () => {
      const version = await MigrationRunner.getCurrentVersion();
      expect(version).toBe(0);
    });

    test('should track version after migration', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test_migration',
        description: 'Test migration',
        async up() {
          await AsyncStorage.setItem('@test:data', 'test');
        },
        async down() {
          await AsyncStorage.removeItem('@test:data');
        },
      });

      await MigrationRunner.runPendingMigrations();
      const version = await MigrationRunner.getCurrentVersion();
      expect(version).toBe(1);
    });
  });

  describe('Migration Execution', () => {
    test('should run pending migrations', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'create_data',
        description: 'Create test data',
        async up() {
          await AsyncStorage.setItem('@test:value', 'created');
        },
        async down() {
          await AsyncStorage.removeItem('@test:value');
        },
      });

      await MigrationRunner.runPendingMigrations();
      
      const value = await AsyncStorage.getItem('@test:value');
      expect(value).toBe('created');
    });

    test('should run multiple migrations in order', async () => {
      const executionOrder: number[] = [];

      MigrationRunner.registerMigration({
        version: 1,
        name: 'first',
        description: 'First migration',
        async up() {
          executionOrder.push(1);
        },
        async down() {},
      });

      MigrationRunner.registerMigration({
        version: 2,
        name: 'second',
        description: 'Second migration',
        async up() {
          executionOrder.push(2);
        },
        async down() {},
      });

      await MigrationRunner.runPendingMigrations();
      expect(executionOrder).toEqual([1, 2]);
    });

    test('should skip already applied migrations', async () => {
      let executionCount = 0;

      MigrationRunner.registerMigration({
        version: 1,
        name: 'test',
        description: 'Test',
        async up() {
          executionCount++;
        },
        async down() {},
      });

      await MigrationRunner.runPendingMigrations();
      await MigrationRunner.runPendingMigrations(); // Run again

      expect(executionCount).toBe(1);
    });

    test('should handle migration errors', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'failing_migration',
        description: 'This will fail',
        async up() {
          throw new Error('Migration failed');
        },
        async down() {},
      });

      await expect(MigrationRunner.runPendingMigrations()).rejects.toThrow();
    });
  });

  describe('Migration History', () => {
    test('should record migration history', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test',
        description: 'Test',
        async up() {},
        async down() {},
      });

      await MigrationRunner.runPendingMigrations();
      const history = await MigrationRunner.getMigrationHistory();

      expect(history).toHaveLength(1);
      expect(history[0].version).toBe(1);
      expect(history[0].name).toBe('test');
      expect(history[0].successful).toBe(true);
    });

    test('should record failed migrations', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'failing',
        description: 'Will fail',
        async up() {
          throw new Error('Test error');
        },
        async down() {},
      });

      try {
        await MigrationRunner.runPendingMigrations();
      } catch (error) {
        // Expected to fail
      }

      const history = await MigrationRunner.getMigrationHistory();
      expect(history).toHaveLength(1);
      expect(history[0].successful).toBe(false);
      expect(history[0].error).toBeTruthy();
    });
  });

  describe('Rollback', () => {
    test('should rollback to previous version', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'migration_1',
        description: 'First',
        async up() {
          await AsyncStorage.setItem('@test:v1', 'value1');
        },
        async down() {
          await AsyncStorage.removeItem('@test:v1');
        },
      });

      MigrationRunner.registerMigration({
        version: 2,
        name: 'migration_2',
        description: 'Second',
        async up() {
          await AsyncStorage.setItem('@test:v2', 'value2');
        },
        async down() {
          await AsyncStorage.removeItem('@test:v2');
        },
      });

      await MigrationRunner.runPendingMigrations();
      expect(await MigrationRunner.getCurrentVersion()).toBe(2);

      await MigrationRunner.rollbackTo(1);
      expect(await MigrationRunner.getCurrentVersion()).toBe(1);

      const v2Value = await AsyncStorage.getItem('@test:v2');
      expect(v2Value).toBeNull();
    });

    test('should not rollback if target version is current or higher', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test',
        description: 'Test',
        async up() {},
        async down() {},
      });

      await MigrationRunner.runPendingMigrations();
      const version = await MigrationRunner.getCurrentVersion();

      await MigrationRunner.rollbackTo(version);
      expect(await MigrationRunner.getCurrentVersion()).toBe(version);
    });
  });

  describe('Utility Methods', () => {
    test('should check for pending migrations', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test',
        description: 'Test',
        async up() {},
        async down() {},
      });

      const hasPending = await MigrationRunner.hasPendingMigrations();
      expect(hasPending).toBe(true);

      await MigrationRunner.runPendingMigrations();

      const hasPendingAfter = await MigrationRunner.hasPendingMigrations();
      expect(hasPendingAfter).toBe(false);
    });

    test('should get pending migrations list', async () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test1',
        description: 'Test 1',
        async up() {},
        async down() {},
      });

      MigrationRunner.registerMigration({
        version: 2,
        name: 'test2',
        description: 'Test 2',
        async up() {},
        async down() {},
      });

      const pending = await MigrationRunner.getPendingMigrations();
      expect(pending).toHaveLength(2);
    });

    test('should get all migrations', () => {
      MigrationRunner.registerMigration({
        version: 1,
        name: 'test',
        description: 'Test',
        async up() {},
        async down() {},
      });

      const all = MigrationRunner.getAllMigrations();
      expect(all).toHaveLength(1);
    });
  });
});
