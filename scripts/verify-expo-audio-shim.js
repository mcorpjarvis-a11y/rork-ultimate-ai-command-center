#!/usr/bin/env node
/**
 * Verification script for expo-audio shim
 * Tests that the shim exports are correct for backend builds
 */

const path = require('path');

// Test importing the shim directly
console.log('Testing expo-audio shim exports...');

try {
  // Import using require to test in Node.js
  const expoAudio = require(path.resolve(__dirname, '../backend/shims/expo-audio.ts'));
  
  console.log('✓ Successfully imported expo-audio shim');
  
  // Test default export
  if (expoAudio.default) {
    console.log('✓ Default export (AudioModule) exists');
  } else {
    console.error('✗ Default export (AudioModule) is missing');
    process.exit(1);
  }
  
  // Test named AudioModule export
  if (expoAudio.AudioModule) {
    console.log('✓ Named export (AudioModule) exists');
  } else {
    console.error('✗ Named export (AudioModule) is missing');
    process.exit(1);
  }
  
  // Test RecordingPresets
  if (expoAudio.RecordingPresets) {
    console.log('✓ RecordingPresets export exists');
    if (expoAudio.RecordingPresets.HIGH_QUALITY !== undefined) {
      console.log('✓ RecordingPresets.HIGH_QUALITY is defined');
    }
    if (expoAudio.RecordingPresets.LOW_QUALITY !== undefined) {
      console.log('✓ RecordingPresets.LOW_QUALITY is defined');
    }
  } else {
    console.error('✗ RecordingPresets export is missing');
    process.exit(1);
  }
  
  // Test that default and named exports are the same
  if (expoAudio.default === expoAudio.AudioModule) {
    console.log('✓ Default and named AudioModule exports are identical');
  } else {
    console.error('✗ Default and named AudioModule exports differ');
    process.exit(1);
  }
  
  console.log('\n✅ All expo-audio shim exports are correct!');
  
} catch (error) {
  console.error('✗ Failed to import expo-audio shim:', error.message);
  process.exit(1);
}
