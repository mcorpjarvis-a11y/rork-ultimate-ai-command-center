/**
 * Metro Config CommonJS Validation Test
 * 
 * This test verifies that metro.config.cjs is pure CommonJS
 * and compatible with Node.js environments like Termux.
 */

const fs = require('fs');
const path = require('path');

describe('Metro Config CommonJS Validation', () => {
  const metroConfigPath = path.join(__dirname, '..', 'metro.config.cjs');
  const metroProxyPath = path.join(__dirname, '..', 'metro.config.proxy.js');
  let metroConfigContent;

  beforeAll(() => {
    metroConfigContent = fs.readFileSync(metroConfigPath, 'utf8');
  });

  test('metro.config.cjs exists', () => {
    expect(fs.existsSync(metroConfigPath)).toBe(true);
  });

  test('metro.config.proxy.js exists', () => {
    expect(fs.existsSync(metroProxyPath)).toBe(true);
  });

  test('metro.config.cjs uses require() instead of import', () => {
    // Should use require()
    expect(metroConfigContent).toMatch(/require\(/);
    
    // Should NOT use ES6 import syntax
    expect(metroConfigContent).not.toMatch(/^\s*import\s+.*from/m);
    expect(metroConfigContent).not.toMatch(/^\s*import\s*\{/m);
  });

  test('metro.config.cjs uses module.exports instead of export', () => {
    // Should use module.exports
    expect(metroConfigContent).toMatch(/module\.exports\s*=/);
    
    // Should NOT use ES6 export syntax
    expect(metroConfigContent).not.toMatch(/^\s*export\s+default/m);
    expect(metroConfigContent).not.toMatch(/^\s*export\s+const/m);
    expect(metroConfigContent).not.toMatch(/^\s*export\s+\{/m);
  });

  test('metro.config.cjs exports config object directly', () => {
    // Verify it exports the config object, not wrapped in default
    expect(metroConfigContent).toMatch(/module\.exports\s*=\s*config/);
  });

  test('scripts/start-all.js uses require() not import for any metro references', () => {
    const startAllPath = path.join(__dirname, '..', 'scripts', 'start-all.js');
    const startAllContent = fs.readFileSync(startAllPath, 'utf8');
    
    // Should NOT import metro config with ES6 syntax
    expect(startAllContent).not.toMatch(/import.*metro/);
    
    // Should use CommonJS if referencing metro
    if (startAllContent.includes('metro')) {
      expect(startAllContent).toMatch(/require.*metro/);
    }
  });

  test('scripts/start-all.js includes Metro cache clearing flag', () => {
    const startAllPath = path.join(__dirname, '..', 'scripts', 'start-all.js');
    const startAllContent = fs.readFileSync(startAllPath, 'utf8');
    
    // Should include the -c flag to clear cache
    expect(startAllContent).toMatch(/['"]expo['"],\s*['"]start['"],\s*['"]-c['"]/);
  });
});
