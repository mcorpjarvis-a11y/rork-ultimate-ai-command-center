#!/usr/bin/env node
/**
 * Prevent iOS Support Guard Script
 * 
 * This script runs before `npm start` to ensure iOS configurations
 * don't accidentally get reintroduced into the app.json file.
 * 
 * This project is Android-only and does not support iOS/Apple platforms.
 */

const fs = require('fs');
const path = require('path');

const APP_JSON_PATH = path.join(__dirname, '..', 'app.json');

try {
  // Read app.json
  const appJsonContent = fs.readFileSync(APP_JSON_PATH, 'utf8');
  const appJson = JSON.parse(appJsonContent);

  // Check for ios block
  if (appJson.expo && appJson.expo.ios) {
    console.error('\n❌ ERROR: iOS configuration detected in app.json!');
    console.error('This project is Android-only and does not support iOS/Apple platforms.');
    console.error('\nPlease remove the "ios" block from app.json.\n');
    process.exit(1);
  }

  // Check for platforms array
  if (appJson.expo && appJson.expo.platforms) {
    if (appJson.expo.platforms.includes('ios')) {
      console.error('\n❌ ERROR: iOS platform detected in platforms array!');
      console.error('This project is Android-only and does not support iOS/Apple platforms.');
      console.error('\nPlease remove "ios" from the platforms array in app.json.\n');
      process.exit(1);
    }
  }

  // Check for iCloud configuration in plugins
  if (appJson.expo && appJson.expo.plugins) {
    for (const plugin of appJson.expo.plugins) {
      if (Array.isArray(plugin)) {
        const [pluginName, pluginConfig] = plugin;
        if (pluginConfig && pluginConfig.iCloudContainerEnvironment) {
          console.error('\n❌ ERROR: iCloud configuration detected in plugins!');
          console.error(`Plugin "${pluginName}" has iCloud configuration.`);
          console.error('This project is Android-only and does not support iOS/Apple platforms.');
          console.error('\nPlease remove iCloud-specific configurations from plugins.\n');
          process.exit(1);
        }
      }
    }
  }

  console.log('✅ iOS prevention check passed - Android-only configuration confirmed');
} catch (error) {
  console.error('❌ ERROR: Failed to validate app.json:', error.message);
  process.exit(1);
}
