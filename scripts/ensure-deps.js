#!/usr/bin/env node
/**
 * ensure-deps.js - Validate core dependency versions
 * Ensures React-related packages are pinned to exact versions
 * Called from postinstall and prestart scripts
 */

const path = require('path');
const fs = require('fs');

const packageJsonPath = path.join(__dirname, '..', 'package.json');
const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

const required = {
  "react": "19.0.0",
  "react-dom": "19.0.0",
  "react-test-renderer": "19.0.0"
};

console.log("[ensure-deps] Validating core dependencies...");
let errors = 0;

for (const [name, version] of Object.entries(required)) {
  const installed = pkg.dependencies?.[name] || pkg.devDependencies?.[name];
  if (installed && installed !== version) {
    console.error(`❌ ${name} mismatch: expected ${version}, found ${installed}`);
    errors++;
  }
}

if (errors === 0) {
  console.log("✅ All core dependencies are correctly pinned.");
} else {
  console.warn("⚠️ Fix versions in package.json before continuing.");
}
