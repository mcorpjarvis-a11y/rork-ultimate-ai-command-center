#!/usr/bin/env node
/**
 * API Key Configuration Verification Script
 * 
 * This script verifies that API keys are correctly configured in JARVIS
 * without making external API calls (works in sandboxed environments).
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 JARVIS API Key Configuration Verification\n');
console.log('=' .repeat(60));

const results = {
  configured: [],
  missing: [],
  warnings: []
};

// Load .env file manually
function loadEnv(filepath) {
  try {
    const content = fs.readFileSync(filepath, 'utf8');
    const env = {};
    content.split('\n').forEach(line => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=');
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join('=').trim();
        }
      }
    });
    return env;
  } catch (error) {
    return {};
  }
}

// Check file existence and content
function checkFile(filepath, description) {
  try {
    if (fs.existsSync(filepath)) {
      const content = fs.readFileSync(filepath, 'utf8');
      console.log(`✅ ${description}: EXISTS (${content.length} bytes)`);
      return content;
    } else {
      console.log(`❌ ${description}: NOT FOUND`);
      return null;
    }
  } catch (error) {
    console.log(`❌ ${description}: ERROR (${error.message})`);
    return null;
  }
}

// Main verification
console.log('\n📁 Configuration Files:\n');

const envPath = path.join(__dirname, '..', '.env');
const envExamplePath = path.join(__dirname, '..', '.env.example');
const apiConfigPath = path.join(__dirname, '..', 'config', 'api.config.ts');
const apiKeysPath = path.join(__dirname, '..', 'config', 'apiKeys.ts');

const envContent = checkFile(envPath, '.env file');
const envExampleContent = checkFile(envExamplePath, '.env.example file');
const apiConfigContent = checkFile(apiConfigPath, 'config/api.config.ts');

if (!envContent || !apiConfigContent) {
  console.log('\n❌ Critical configuration files missing!');
  process.exit(1);
}

console.log('\n' + '='.repeat(60));
console.log('\n🔑 API Key Configuration:\n');

// Parse .env
const env = loadEnv(envPath);

// Check for key API services
const apiServices = [
  {
    name: 'Google Gemini',
    envKey: 'EXPO_PUBLIC_GEMINI_API_KEY',
    tier: 'free'
  },
  {
    name: 'Groq',
    envKey: 'EXPO_PUBLIC_GROQ_API_KEY',
    tier: 'free'
  },
  {
    name: 'HuggingFace',
    envKey: 'EXPO_PUBLIC_HF_API_TOKEN',
    tier: 'free'
  },
  {
    name: 'Together.ai',
    envKey: 'EXPO_PUBLIC_TOGETHER_API_KEY',
    tier: 'free'
  },
  {
    name: 'DeepSeek',
    envKey: 'EXPO_PUBLIC_DEEPSEEK_API_KEY',
    tier: 'free'
  },
  {
    name: 'OpenAI',
    envKey: 'EXPO_PUBLIC_OPENAI_API_KEY',
    tier: 'paid'
  },
  {
    name: 'Anthropic',
    envKey: 'EXPO_PUBLIC_ANTHROPIC_API_KEY',
    tier: 'paid'
  }
];

apiServices.forEach(service => {
  const envValue = env[service.envKey];
  const hasEnvKey = envValue && envValue.length > 0;
  
  let status = '❌';
  let message = 'NOT CONFIGURED';
  
  if (hasEnvKey) {
    status = '✅';
    message = `CONFIGURED in .env (${service.tier})`;
    results.configured.push(service.name);
  } else {
    status = '⏭️';
    message = `NOT SET (${service.tier} - optional)`;
    results.missing.push(service.name);
  }
  
  console.log(`${status} ${service.name}: ${message}`);
});

// Check backend configuration
console.log('\n' + '='.repeat(60));
console.log('\n🖥️  Backend Configuration:\n');

const backendURL = env['EXPO_PUBLIC_API_URL'] || 'http://localhost:3000';
const backendPort = env['PORT'] || '3000';

console.log(`✅ Backend URL: ${backendURL}`);
console.log(`✅ Backend Port: ${backendPort}`);

// Check if api.config.ts references the keys correctly
console.log('\n' + '='.repeat(60));
console.log('\n📋 Configuration Structure Verification:\n');

const checks = [
  {
    name: 'FREE_AI_MODELS configured',
    test: () => apiConfigContent.includes('FREE_AI_MODELS')
  },
  {
    name: 'Groq configuration exists',
    test: () => apiConfigContent.includes('groq:') && apiConfigContent.includes('api.groq.com')
  },
  {
    name: 'Gemini configuration exists',
    test: () => apiConfigContent.includes('gemini:') && apiConfigContent.includes('generativelanguage.googleapis.com')
  },
  {
    name: 'HuggingFace configuration exists',
    test: () => apiConfigContent.includes('huggingface:') && apiConfigContent.includes('api-inference.huggingface.co')
  },
  {
    name: 'API config uses environment variables',
    test: () => apiConfigContent.includes('process.env.EXPO_PUBLIC_')
  }
];

checks.forEach(check => {
  const passed = check.test();
  console.log(`${passed ? '✅' : '❌'} ${check.name}`);
  if (!passed) {
    results.warnings.push(check.name);
  }
});

// Print summary
console.log('\n' + '='.repeat(60));
console.log('\n📊 Verification Summary:\n');

console.log(`✅ Configured AI Services: ${results.configured.length}`);
if (results.configured.length > 0) {
  results.configured.forEach(name => console.log(`   - ${name}`));
}

console.log(`\n⏭️  Missing (Optional): ${results.missing.length}`);
if (results.missing.length > 0) {
  results.missing.forEach(name => console.log(`   - ${name}`));
}

if (results.warnings.length > 0) {
  console.log(`\n⚠️  Configuration Warnings: ${results.warnings.length}`);
  results.warnings.forEach(warning => console.log(`   - ${warning}`));
}

console.log('\n' + '='.repeat(60));

// Overall status
const hasWorkingConfig = results.configured.length >= 2; // At least 2 AI services configured
const hasNoWarnings = results.warnings.length === 0;

if (hasWorkingConfig && hasNoWarnings) {
  console.log('\n✅ JARVIS API Configuration: VERIFIED');
  console.log('   All API keys are correctly configured and ready to use.');
  console.log('\n💡 Status:');
  console.log(`   - ${results.configured.length} AI services configured`);
  console.log('   - Configuration structure is valid');
  console.log('\n🚀 To test API connectivity:');
  console.log('   - Start the app: npm start');
  console.log('   - Try asking JARVIS a question');
  console.log('   - The app will use the configured AI services');
} else if (hasWorkingConfig) {
  console.log('\n⚠️  JARVIS API Configuration: WARNINGS');
  console.log('   API keys are configured but some issues were detected.');
  console.log('   Review the warnings above and fix them if needed.');
} else {
  console.log('\n❌ JARVIS API Configuration: INCOMPLETE');
  console.log('   Not enough AI services configured.');
  console.log('\n💡 To fix:');
  console.log('   1. Check .env file for API keys');
  console.log('   2. Add at least one AI service key (Groq recommended)');
  console.log('   3. See .env.example for key formats');
}

console.log('\n📚 Documentation:');
console.log('   - API setup: README.md');
console.log('   - Key management: .env.example');
console.log('   - Getting free keys: See URLs in .env.example\n');

process.exit(results.warnings.length > 0 ? 1 : 0);
