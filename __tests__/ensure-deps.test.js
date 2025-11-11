/**
 * Test for scripts/ensure-deps.js
 * Validates that React-related packages are protected from auto-upgrade
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

  test('PROTECTED_PACKAGES list includes all required React packages', () => {
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    
    // Check that PROTECTED_PACKAGES is defined and includes all required packages
    expect(content).toContain('PROTECTED_PACKAGES');
    expect(content).toContain("'react'");
    expect(content).toContain("'react-dom'");
    expect(content).toContain("'react-native'");
    expect(content).toContain("'react-native-renderer'");
    expect(content).toContain("'react-test-renderer'");
  });

  test('script filters out protected packages before npm update', () => {
    const content = fs.readFileSync(ensureDepsPath, 'utf8');
    
    // Check that the script filters packages
    expect(content).toContain('filter');
    expect(content).toContain('PROTECTED_PACKAGES.includes');
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
