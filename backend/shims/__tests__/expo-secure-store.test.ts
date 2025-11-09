/**
 * Tests for backend expo-secure-store shim
 * 
 * Verifies that the Node.js shim provides the expected API
 * and works correctly in a Node environment.
 */

import * as SecureStore from '../expo-secure-store';
import * as fs from 'fs';
import * as path from 'path';

const STORAGE_FILE = path.join(process.cwd(), 'backend', '.data', 'secure-store.json');

describe('expo-secure-store shim', () => {
  beforeEach(() => {
    // Clean up storage file before each test
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        fs.unlinkSync(STORAGE_FILE);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  afterEach(() => {
    // Clean up after tests
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        fs.unlinkSync(STORAGE_FILE);
      }
    } catch (error) {
      // Ignore cleanup errors
    }
  });

  it('should set and get a value', async () => {
    const key = 'test_key';
    const value = 'test_value';

    await SecureStore.setItemAsync(key, value);
    const retrieved = await SecureStore.getItemAsync(key);

    expect(retrieved).toBe(value);
  });

  it('should return null for non-existent key', async () => {
    const retrieved = await SecureStore.getItemAsync('non_existent_key');
    expect(retrieved).toBeNull();
  });

  it('should delete a value', async () => {
    const key = 'test_key_delete';
    const value = 'test_value_delete';

    await SecureStore.setItemAsync(key, value);
    let retrieved = await SecureStore.getItemAsync(key);
    expect(retrieved).toBe(value);

    await SecureStore.deleteItemAsync(key);
    retrieved = await SecureStore.getItemAsync(key);
    expect(retrieved).toBeNull();
  });

  it('should handle multiple keys independently', async () => {
    await SecureStore.setItemAsync('key1', 'value1');
    await SecureStore.setItemAsync('key2', 'value2');
    await SecureStore.setItemAsync('key3', 'value3');

    expect(await SecureStore.getItemAsync('key1')).toBe('value1');
    expect(await SecureStore.getItemAsync('key2')).toBe('value2');
    expect(await SecureStore.getItemAsync('key3')).toBe('value3');
  });

  it('should overwrite existing values', async () => {
    const key = 'test_key_overwrite';

    await SecureStore.setItemAsync(key, 'initial_value');
    expect(await SecureStore.getItemAsync(key)).toBe('initial_value');

    await SecureStore.setItemAsync(key, 'updated_value');
    expect(await SecureStore.getItemAsync(key)).toBe('updated_value');
  });

  it('should handle JSON serializable data', async () => {
    const key = 'test_json';
    const data = {
      access_token: 'abc123',
      refresh_token: 'xyz789',
      expires_in: 3600,
    };
    const jsonValue = JSON.stringify(data);

    await SecureStore.setItemAsync(key, jsonValue);
    const retrieved = await SecureStore.getItemAsync(key);

    expect(retrieved).toBe(jsonValue);
    expect(JSON.parse(retrieved!)).toEqual(data);
  });

  it('should persist data to file', async () => {
    const key = 'test_persistence';
    const value = 'persistent_value';

    await SecureStore.setItemAsync(key, value);

    // Verify file was created
    expect(fs.existsSync(STORAGE_FILE)).toBe(true);

    // Read file directly and verify content
    const fileContent = fs.readFileSync(STORAGE_FILE, 'utf8');
    const data = JSON.parse(fileContent);
    expect(data[key]).toBe(value);
  });

  it('should handle concurrent operations gracefully', async () => {
    // Test basic concurrent set operations
    const operations = [];
    for (let i = 0; i < 10; i++) {
      operations.push(SecureStore.setItemAsync(`key_${i}`, `value_${i}`));
    }

    await Promise.all(operations);

    // Verify all values were set
    for (let i = 0; i < 10; i++) {
      const value = await SecureStore.getItemAsync(`key_${i}`);
      expect(value).toBe(`value_${i}`);
    }
  });
});
