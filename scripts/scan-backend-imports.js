#!/usr/bin/env node

/**
 * Scan Backend Imports Script
 * 
 * Scans the built backend dist folder for any imports of React Native or Expo modules.
 * This catches cases where RN/Expo packages leak into the backend build.
 * 
 * Usage: node scripts/scan-backend-imports.js
 * 
 * Exit codes:
 * - 0: No forbidden imports found
 * - 1: Forbidden imports detected or scan failed
 */

const fs = require('fs');
const path = require('path');

const DIST_DIR = path.join(__dirname, '..', 'backend', 'dist');
const FORBIDDEN_PATTERNS = [
  'react-native',
  'expo-router',
  'expo-secure-store',
  'expo-audio',
  'expo-auth-session',
  'expo-blur',
  'expo-clipboard',
  'expo-constants',
  'expo-crypto',
  'expo-document-picker',
  'expo-file-system',
  'expo-font',
  'expo-haptics',
  'expo-image',
  'expo-image-picker',
  'expo-linear-gradient',
  'expo-linking',
  'expo-location',
  'expo-media-library',
  'expo-speech',
  'expo-speech-recognition',
  'expo-splash-screen',
  'expo-status-bar',
  'expo-symbols',
  'expo-system-ui',
  'expo-web-browser',
  '@react-native',
];

function scanFile(filePath) {
  const violations = [];
  
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    
    for (const pattern of FORBIDDEN_PATTERNS) {
      // Look for require() or import statements
      const requireRegex = new RegExp(`require\\(['"](${pattern}[^'"]*?)['"]\\)`, 'g');
      const importRegex = new RegExp(`from\\s+['"](${pattern}[^'"]*?)['"]`, 'g');
      
      let match;
      
      while ((match = requireRegex.exec(content)) !== null) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          pattern: match[1],
          type: 'require',
        });
      }
      
      while ((match = importRegex.exec(content)) !== null) {
        violations.push({
          file: path.relative(process.cwd(), filePath),
          pattern: match[1],
          type: 'import',
        });
      }
    }
  } catch (error) {
    console.error(`❌ Failed to scan ${filePath}:`, error.message);
  }
  
  return violations;
}

function scanDirectory(dirPath) {
  let allViolations = [];
  
  try {
    const items = fs.readdirSync(dirPath);
    
    for (const item of items) {
      const itemPath = path.join(dirPath, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        allViolations = allViolations.concat(scanDirectory(itemPath));
      } else if (stat.isFile() && itemPath.endsWith('.js')) {
        const violations = scanFile(itemPath);
        allViolations = allViolations.concat(violations);
      }
    }
  } catch (error) {
    console.error(`❌ Failed to scan directory ${dirPath}:`, error.message);
  }
  
  return allViolations;
}

function main() {
  console.log('🔍 Scanning backend build for forbidden imports...');
  console.log(`📂 Scanning: ${DIST_DIR}`);
  console.log('');
  
  if (!fs.existsSync(DIST_DIR)) {
    console.error('❌ Backend dist directory not found!');
    console.error(`   Expected: ${DIST_DIR}`);
    console.error('   Run "npm run build:backend" first.');
    process.exit(1);
  }
  
  const violations = scanDirectory(DIST_DIR);
  
  if (violations.length === 0) {
    console.log('✅ No forbidden imports found!');
    console.log('   Backend is properly isolated from React Native and Expo packages.');
    process.exit(0);
  }
  
  console.error('❌ FORBIDDEN IMPORTS DETECTED!');
  console.error('');
  console.error('The following React Native/Expo imports were found in the backend build:');
  console.error('');
  
  for (const violation of violations) {
    console.error(`   ${violation.type}: '${violation.pattern}'`);
    console.error(`      in ${violation.file}`);
    console.error('');
  }
  
  console.error('These packages must not be imported in the backend.');
  console.error('');
  console.error('To fix:');
  console.error('  1. Check backend routes/services for React Native/Expo imports');
  console.error('  2. Create Node-safe shims in backend/shims/ if needed');
  console.error('  3. Add aliases in scripts/build-backend.js to use the shims');
  console.error('');
  
  process.exit(1);
}

main();
