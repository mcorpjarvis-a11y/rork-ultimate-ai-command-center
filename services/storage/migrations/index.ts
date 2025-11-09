/**
 * Migrations Index
 * 
 * Automatically imports all migration files to register them with MigrationRunner.
 * Add new migrations here to ensure they're loaded.
 */

// Import all migrations in order
import './001_initial_schema';
import './002_add_social_media_schema';
import './003_add_monetization_iot_schemas';

/**
 * To create a new migration:
 * 
 * 1. Create a new file: 00X_migration_name.ts
 * 2. Import MigrationRunner and register your migration
 * 3. Add the import statement above
 * 4. Run migrations: await MigrationRunner.runPendingMigrations()
 * 
 * Example:
 * 
 * import MigrationRunner from '../MigrationRunner';
 * 
 * MigrationRunner.registerMigration({
 *   version: 4,
 *   name: 'my_migration',
 *   description: 'Description of what this migration does',
 *   
 *   async up() {
 *     // Migration logic here
 *   },
 *   
 *   async down() {
 *     // Rollback logic here
 *   },
 * });
 */

export { default as MigrationRunner } from '../MigrationRunner';
