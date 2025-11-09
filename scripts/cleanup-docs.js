#!/usr/bin/env node
/**
 * Documentation Cleanup Script
 * 
 * This script:
 * 1. Creates a backup of all documentation files
 * 2. Archives docs/ directory
 * 3. Keeps only MASTER_CHECKLIST.md and README.md
 * 
 * Run with: node scripts/cleanup-docs.js
 * To execute cleanup: node scripts/cleanup-docs.js --execute
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const BACKUP_DIR = path.join(PROJECT_ROOT, 'docs-backup-' + Date.now());
const ARCHIVE_DIR = path.join(DOCS_DIR, 'archive');

const EXECUTE = process.argv.includes('--execute');

console.log('📚 Documentation Cleanup Script\n');

if (!EXECUTE) {
  console.log('⚠️  DRY RUN MODE - No files will be modified');
  console.log('   Run with --execute to actually perform cleanup\n');
}

// Step 1: Create backup
console.log('📦 Step 1: Creating backup...');
if (EXECUTE) {
  try {
    // Copy entire docs directory to backup
    execSync(`cp -r "${DOCS_DIR}" "${BACKUP_DIR}"`, { stdio: 'inherit' });
    console.log(`   ✓ Backup created at: ${BACKUP_DIR}`);
  } catch (error) {
    console.error('   ✗ Backup failed:', error.message);
    process.exit(1);
  }
} else {
  console.log(`   → Would create backup at: ${BACKUP_DIR}`);
}

// Step 2: List files to be archived/removed
console.log('\n📋 Step 2: Analyzing documentation files...');

const docsToKeep = [
  'README.md', // Keep root README
];

const docsInMain = [
  'README.md',
];

function listFiles(dir, baseDir = dir) {
  const files = [];
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir);
  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const relativePath = path.relative(baseDir, fullPath);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...listFiles(fullPath, baseDir));
    } else if (entry.endsWith('.md') || entry.endsWith('.txt')) {
      files.push(relativePath);
    }
  }
  
  return files;
}

const allDocs = listFiles(DOCS_DIR);
const docsToArchive = allDocs.filter(doc => !docsToKeep.includes(path.basename(doc)));

console.log(`\n   Total documentation files: ${allDocs.length}`);
console.log(`   Files to keep: ${docsToKeep.length}`);
console.log(`   Files to archive/remove: ${docsToArchive.length}`);

// Step 3: Show what will be done
console.log('\n📝 Step 3: Files to be archived/removed:');
docsToArchive.slice(0, 10).forEach(doc => {
  console.log(`   - ${doc}`);
});
if (docsToArchive.length > 10) {
  console.log(`   ... and ${docsToArchive.length - 10} more files`);
}

// Step 4: Execute or show plan
console.log('\n🎯 Step 4: Cleanup plan...');
if (EXECUTE) {
  console.log('   Archiving documentation files...');
  
  try {
    // Create consolidated archive directory
    const consolidatedArchive = path.join(PROJECT_ROOT, 'docs-archive-consolidated');
    if (!fs.existsSync(consolidatedArchive)) {
      fs.mkdirSync(consolidatedArchive, { recursive: true });
    }
    
    // Move docs/ to archive
    execSync(`mv "${DOCS_DIR}" "${consolidatedArchive}/docs-$(date +%Y%m%d)"`, { stdio: 'inherit' });
    console.log(`   ✓ Archived docs/ to: ${consolidatedArchive}`);
    
    // Recreate docs/ with just README.md
    fs.mkdirSync(DOCS_DIR, { recursive: true });
    const readmePath = path.join(DOCS_DIR, 'README.md');
    fs.writeFileSync(readmePath, `# JARVIS Documentation

**Note:** All documentation has been consolidated into \`MASTER_CHECKLIST.md\` in the project root.

This is the single source of truth for the JARVIS Command Center project.

## Quick Links

- [MASTER_CHECKLIST.md](../MASTER_CHECKLIST.md) - Complete project documentation
- [README.md](../README.md) - Project overview

## Archived Documentation

Historical documentation has been archived for reference. See \`docs-archive-consolidated/\` in the project root.

---

**Last Updated:** ${new Date().toISOString().split('T')[0]}
`);
    console.log(`   ✓ Created new docs/README.md`);
    
    console.log('\n✅ Cleanup complete!');
    console.log(`\n📂 Backups:`);
    console.log(`   - Full backup: ${BACKUP_DIR}`);
    console.log(`   - Consolidated archive: ${consolidatedArchive}`);
  } catch (error) {
    console.error('\n❌ Cleanup failed:', error.message);
    console.error('   Your backup is safe at:', BACKUP_DIR);
    process.exit(1);
  }
} else {
  console.log('   → Would archive entire docs/ directory');
  console.log('   → Would create new docs/ with single README.md');
  console.log('   → Would preserve backup at:', BACKUP_DIR);
  console.log('\n💡 To execute this cleanup, run:');
  console.log('   node scripts/cleanup-docs.js --execute');
}

console.log('\n✨ Done!\n');
