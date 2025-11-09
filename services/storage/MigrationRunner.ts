/**
 * Database Migration System for JARVIS
 * 
 * Handles schema versioning and data migrations for the file-backed JSON storage.
 * Ensures data integrity and smooth upgrades as the schema evolves.
 * 
 * Usage:
 *   import { MigrationRunner } from '@/services/storage/MigrationRunner';
 *   
 *   // Run all pending migrations
 *   await MigrationRunner.runPendingMigrations();
 *   
 *   // Get current version
 *   const version = await MigrationRunner.getCurrentVersion();
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Migration {
  version: number;
  name: string;
  description: string;
  up: () => Promise<void>;
  down: () => Promise<void>;
}

export interface MigrationRecord {
  version: number;
  name: string;
  appliedAt: string;
  successful: boolean;
  error?: string;
}

class MigrationRunner {
  private static readonly VERSION_KEY = '@jarvis:schema_version';
  private static readonly MIGRATION_HISTORY_KEY = '@jarvis:migration_history';
  private static migrations: Migration[] = [];

  /**
   * Register a migration
   */
  static registerMigration(migration: Migration): void {
    this.migrations.push(migration);
    // Sort by version to ensure correct order
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Get current schema version
   */
  static async getCurrentVersion(): Promise<number> {
    try {
      const versionStr = await AsyncStorage.getItem(this.VERSION_KEY);
      return versionStr ? parseInt(versionStr, 10) : 0;
    } catch (error) {
      console.error('[MigrationRunner] Error getting version:', error);
      return 0;
    }
  }

  /**
   * Set schema version
   */
  private static async setVersion(version: number): Promise<void> {
    await AsyncStorage.setItem(this.VERSION_KEY, version.toString());
  }

  /**
   * Get migration history
   */
  static async getMigrationHistory(): Promise<MigrationRecord[]> {
    try {
      const historyStr = await AsyncStorage.getItem(this.MIGRATION_HISTORY_KEY);
      return historyStr ? JSON.parse(historyStr) : [];
    } catch (error) {
      console.error('[MigrationRunner] Error getting history:', error);
      return [];
    }
  }

  /**
   * Add migration to history
   */
  private static async addToHistory(record: MigrationRecord): Promise<void> {
    const history = await this.getMigrationHistory();
    history.push(record);
    await AsyncStorage.setItem(this.MIGRATION_HISTORY_KEY, JSON.stringify(history));
  }

  /**
   * Run all pending migrations
   */
  static async runPendingMigrations(): Promise<void> {
    const currentVersion = await this.getCurrentVersion();
    const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);

    if (pendingMigrations.length === 0) {
      console.log('[MigrationRunner] No pending migrations');
      return;
    }

    console.log(`[MigrationRunner] Running ${pendingMigrations.length} pending migration(s)`);

    for (const migration of pendingMigrations) {
      try {
        console.log(`[MigrationRunner] Applying migration ${migration.version}: ${migration.name}`);
        await migration.up();

        await this.setVersion(migration.version);
        await this.addToHistory({
          version: migration.version,
          name: migration.name,
          appliedAt: new Date().toISOString(),
          successful: true,
        });

        console.log(`[MigrationRunner] Migration ${migration.version} completed successfully`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[MigrationRunner] Migration ${migration.version} failed:`, error);

        await this.addToHistory({
          version: migration.version,
          name: migration.name,
          appliedAt: new Date().toISOString(),
          successful: false,
          error: errorMessage,
        });

        throw new Error(`Migration ${migration.version} (${migration.name}) failed: ${errorMessage}`);
      }
    }

    console.log('[MigrationRunner] All migrations completed successfully');
  }

  /**
   * Rollback to a specific version
   */
  static async rollbackTo(targetVersion: number): Promise<void> {
    const currentVersion = await this.getCurrentVersion();

    if (targetVersion >= currentVersion) {
      console.log('[MigrationRunner] No rollback needed');
      return;
    }

    const migrationsToRollback = this.migrations
      .filter(m => m.version > targetVersion && m.version <= currentVersion)
      .sort((a, b) => b.version - a.version); // Reverse order for rollback

    console.log(`[MigrationRunner] Rolling back ${migrationsToRollback.length} migration(s)`);

    for (const migration of migrationsToRollback) {
      try {
        console.log(`[MigrationRunner] Rolling back migration ${migration.version}: ${migration.name}`);
        await migration.down();

        await this.setVersion(migration.version - 1);
        await this.addToHistory({
          version: migration.version,
          name: `Rollback: ${migration.name}`,
          appliedAt: new Date().toISOString(),
          successful: true,
        });

        console.log(`[MigrationRunner] Rollback of ${migration.version} completed`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        console.error(`[MigrationRunner] Rollback ${migration.version} failed:`, error);

        await this.addToHistory({
          version: migration.version,
          name: `Rollback: ${migration.name}`,
          appliedAt: new Date().toISOString(),
          successful: false,
          error: errorMessage,
        });

        throw new Error(`Rollback of migration ${migration.version} failed: ${errorMessage}`);
      }
    }

    console.log(`[MigrationRunner] Rollback to version ${targetVersion} completed`);
  }

  /**
   * Get list of all migrations
   */
  static getAllMigrations(): Migration[] {
    return [...this.migrations];
  }

  /**
   * Get pending migrations
   */
  static async getPendingMigrations(): Promise<Migration[]> {
    const currentVersion = await this.getCurrentVersion();
    return this.migrations.filter(m => m.version > currentVersion);
  }

  /**
   * Check if migrations need to be run
   */
  static async hasPendingMigrations(): Promise<boolean> {
    const pending = await this.getPendingMigrations();
    return pending.length > 0;
  }

  /**
   * Reset migration system (for testing only)
   */
  static async reset(): Promise<void> {
    console.warn('[MigrationRunner] Resetting migration system');
    await AsyncStorage.removeItem(this.VERSION_KEY);
    await AsyncStorage.removeItem(this.MIGRATION_HISTORY_KEY);
  }
}

export default MigrationRunner;
