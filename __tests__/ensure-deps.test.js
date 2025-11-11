/**
 * Test for scripts/ensure-deps.js
 * Validates that React-related packages are correctly pinned to exact versions
 */

const fs = require('fs');
const path = require('path');

describe('ensure-deps.js', () => {
  const ensureDepsPath = path.join(__dirname, '..', 'scripts', 'ensure-deps.js');
  const packageJsonPath = path.join(__dirname, '..', 'package.json');

  test('script file exists and is readable', () => {
    expect(fs.existsSync(ensureDepsPath)).toBe(true);
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    expect(content).toBeTruthy();
  });

  test('script validates required React packages', () => {
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    
    // Check that required packages are defined and includes all required packages
    expect(content).toContain('required');
    expect(content).toContain('"react"');
    expect(content).toContain('"react-dom"');
    expect(content).toContain('"react-test-renderer"');
    expect(content).toContain('19.0.0');
  });

  test('script validates versions instead of updating', () => {
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    
    // Check that the script validates packages
    expect(content).toContain('Validating');
    expect(content).toContain('mismatch');
    expect(content).toContain('expected');
    
    // Ensure it doesn't use execSync to update
    expect(content).not.toContain('execSync');
    expect(content).not.toContain('npm update');
  });

  test('package.json has correct React versions pinned', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    // Check React versions are pinned to 19.0.0
    expect(packageJson.dependencies.react).toBe('19.0.0');
    expect(packageJson.dependencies['react-dom']).toBe('19.0.0');
    
    // Check React Native is pinned to 0.76.3
    expect(packageJson.dependencies['react-native']).toBe('0.76.3');
    
    // Check react-test-renderer is pinned to 19.0.0
    expect(packageJson.devDependencies['react-test-renderer']).toBe('19.0.0');
  });

  test('package.json has overrides for React packages', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.overrides).toBeDefined();
    expect(packageJson.overrides.react).toBe('19.0.0');
    expect(packageJson.overrides['react-dom']).toBe('19.0.0');
    expect(packageJson.overrides['react-native-renderer']).toBe('19.0.0');
    expect(packageJson.overrides['react-test-renderer']).toBe('19.0.0');
  });

  test('package.json has resolutions for React packages', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.resolutions).toBeDefined();
    expect(packageJson.resolutions.react).toBe('19.0.0');
    expect(packageJson.resolutions['react-dom']).toBe('19.0.0');
    expect(packageJson.resolutions['react-native-renderer']).toBe('19.0.0');
    expect(packageJson.resolutions['react-test-renderer']).toBe('19.0.0');
  });

  test('package.json expo.install.exclude includes all React packages', () => {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    
    expect(packageJson.expo).toBeDefined();
    expect(packageJson.expo.install).toBeDefined();
    expect(packageJson.expo.install.exclude).toBeDefined();
    
    const excludeList = packageJson.expo.install.exclude;
    expect(excludeList).toContain('react');
    expect(excludeList).toContain('react-dom');
    expect(excludeList).toContain('react-native');
    expect(excludeList).toContain('react-native-renderer');
    expect(excludeList).toContain('react-test-renderer');
  });

  test('script uses fs module to read package.json', () => {
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    
    // Verify the script requires fs module
    expect(content).toContain("require('fs')");
    expect(content).toContain('fs.readFileSync');
    expect(content).toContain('package.json');
  });
});
