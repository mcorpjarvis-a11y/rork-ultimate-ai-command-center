#!/usr/bin/env node
/**
 * Documentation Consolidation Analyzer
 * 
 * Analyzes all documentation files and identifies:
 * 1. Duplicate content
 * 2. Unique information not yet in MASTER_CHECKLIST.md
 * 3. Files that can be safely removed
 * 4. Content that needs to be merged
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');
const DOCS_DIR = path.join(PROJECT_ROOT, 'docs');
const MASTER_CHECKLIST = path.join(PROJECT_ROOT, 'MASTER_CHECKLIST.md');

// Read master checklist
const masterContent = fs.readFileSync(MASTER_CHECKLIST, 'utf8');

// Find all doc files
function findDocFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      findDocFiles(filePath, fileList);
    } else if (file.endsWith('.md') || file.endsWith('.txt')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// Extract key topics/sections from content
function extractKeyTopics(content) {
  const topics = [];
  const lines = content.split('\n');
  
  lines.forEach(line => {
    // Look for headings
    if (line.startsWith('#')) {
      const heading = line.replace(/^#+\s*/, '').trim();
      topics.push(heading);
    }
    
    // Look for key phrases
    const keyPhrases = [
      'oauth', 'authentication', 'ai provider', 'voice', 'tts', 'stt',
      'social media', 'monetization', 'iot', 'analytics', 'media',
      'upload', 'storage', 'metro', 'testing', 'ci/cd', 'deployment'
    ];
    
    keyPhrases.forEach(phrase => {
      if (line.toLowerCase().includes(phrase)) {
        if (!topics.includes(phrase)) {
          topics.push(phrase);
        }
      }
    });
  });
  
  return [...new Set(topics)];
}

// Check if topic is covered in master checklist
function isTopicInMaster(topic, masterContent) {
  const lowerTopic = topic.toLowerCase();
  const lowerMaster = masterContent.toLowerCase();
  return lowerMaster.includes(lowerTopic);
}

// Main analysis
console.log('📚 Documentation Consolidation Analyzer\n');
console.log('Scanning documentation files...\n');

const docFiles = findDocFiles(DOCS_DIR);
console.log(`Found ${docFiles.length} documentation files\n`);

const analysis = {
  totalFiles: docFiles.length,
  archiveFiles: [],
  setupFiles: [],
  guideFiles: [],
  developmentFiles: [],
  uniqueContent: [],
  duplicateContent: [],
};

docFiles.forEach(filePath => {
  const relativePath = path.relative(PROJECT_ROOT, filePath);
  const content = fs.readFileSync(filePath, 'utf8');
  const topics = extractKeyTopics(content);
  
  const fileInfo = {
    path: relativePath,
    size: content.length,
    topics: topics,
    coveredInMaster: topics.filter(t => isTopicInMaster(t, masterContent)).length,
    uniqueTopics: topics.filter(t => !isTopicInMaster(t, masterContent)),
  };
  
  // Categorize by directory
  if (relativePath.includes('archive/')) {
    analysis.archiveFiles.push(fileInfo);
  } else if (relativePath.includes('setup/')) {
    analysis.setupFiles.push(fileInfo);
  } else if (relativePath.includes('guides/')) {
    analysis.guideFiles.push(fileInfo);
  } else if (relativePath.includes('development/')) {
    analysis.developmentFiles.push(fileInfo);
  }
  
  // Track unique vs duplicate
  if (fileInfo.uniqueTopics.length > 0) {
    analysis.uniqueContent.push(fileInfo);
  } else {
    analysis.duplicateContent.push(fileInfo);
  }
});

// Print analysis results
console.log('═══════════════════════════════════════════════════════════\n');
console.log('📊 ANALYSIS RESULTS\n');
console.log('═══════════════════════════════════════════════════════════\n');

console.log(`Total Documentation Files: ${analysis.totalFiles}`);
console.log(`  - Archive files: ${analysis.archiveFiles.length}`);
console.log(`  - Setup files: ${analysis.setupFiles.length}`);
console.log(`  - Guide files: ${analysis.guideFiles.length}`);
console.log(`  - Development files: ${analysis.developmentFiles.length}\n`);

console.log(`Files with UNIQUE content not in MASTER_CHECKLIST: ${analysis.uniqueContent.length}`);
console.log(`Files with DUPLICATE content (safe to remove): ${analysis.duplicateContent.length}\n`);

console.log('═══════════════════════════════════════════════════════════\n');
console.log('📝 FILES WITH UNIQUE CONTENT (Need to merge)\n');
console.log('═══════════════════════════════════════════════════════════\n');

analysis.uniqueContent
  .sort((a, b) => b.uniqueTopics.length - a.uniqueTopics.length)
  .forEach((file, idx) => {
    console.log(`${idx + 1}. ${file.path}`);
    console.log(`   Size: ${file.size} bytes`);
    console.log(`   Unique topics: ${file.uniqueTopics.length}`);
    if (file.uniqueTopics.length > 0) {
      console.log(`   Topics: ${file.uniqueTopics.slice(0, 5).join(', ')}${file.uniqueTopics.length > 5 ? '...' : ''}`);
    }
    console.log('');
  });

console.log('═══════════════════════════════════════════════════════════\n');
console.log('🗑️  FILES LIKELY SAFE TO REMOVE (Duplicate content)\n');
console.log('═══════════════════════════════════════════════════════════\n');

analysis.duplicateContent.forEach((file, idx) => {
  console.log(`${idx + 1}. ${file.path} (${file.size} bytes)`);
});

console.log('\n═══════════════════════════════════════════════════════════\n');
console.log('✅ NEXT STEPS\n');
console.log('═══════════════════════════════════════════════════════════\n');
console.log('1. Review files with unique content above');
console.log('2. Extract unique information and add to MASTER_CHECKLIST.md');
console.log('3. After consolidation, safely remove duplicate files');
console.log('4. Keep archive/ directory for historical reference if desired');
console.log('5. Update all internal doc references to point to MASTER_CHECKLIST.md\n');

// Save analysis to file
const analysisOutput = path.join(PROJECT_ROOT, '/tmp/doc-consolidation-analysis.json');
fs.mkdirSync(path.dirname(analysisOutput), { recursive: true });
fs.writeFileSync(analysisOutput, JSON.stringify(analysis, null, 2));
console.log(`📄 Detailed analysis saved to: ${analysisOutput}\n`);
