#!/usr/bin/env node
/**
 * API Key Connection Test Script
 * 
 * This script tests all configured API keys to ensure they are correctly
 * connected to JARVIS and functioning properly.
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

// Import API keys from config
const API_KEYS = {
  GOOGLE_GEMINI: process.env.EXPO_PUBLIC_GEMINI_API_KEY || 'AIzaSyD8XihT8YcI3ycp0rNkzYpFq61vPoLWJTA',
  GROQ: process.env.EXPO_PUBLIC_GROQ_API_KEY || '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',
  HUGGING_FACE: process.env.EXPO_PUBLIC_HF_API_TOKEN || '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',
  TOGETHER_AI: process.env.EXPO_PUBLIC_TOGETHER_API_KEY || '',
  DEEPSEEK: process.env.EXPO_PUBLIC_DEEPSEEK_API_KEY || '',
  OPENAI: process.env.EXPO_PUBLIC_OPENAI_API_KEY || '',
  ANTHROPIC: process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '',
  REPLICATE: process.env.EXPO_PUBLIC_REPLICATE_API_KEY || '',
};

const testResults = {
  passed: [],
  failed: [],
  skipped: []
};

console.log('\n🧪 JARVIS API Key Connection Test\n');
console.log('=' .repeat(60));

// Helper function to make HTTP requests
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const lib = urlObj.protocol === 'https:' ? https : http;
    
    const req = lib.request(url, options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });
    
    req.on('error', reject);
    req.setTimeout(10000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(options.body);
    }
    
    req.end();
  });
}

// Test Google Gemini API
async function testGemini() {
  if (!API_KEYS.GOOGLE_GEMINI) {
    testResults.skipped.push('Google Gemini');
    console.log('⏭️  Google Gemini: SKIPPED (no API key)');
    return;
  }
  
  try {
    console.log('🔍 Testing Google Gemini...');
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEYS.GOOGLE_GEMINI}`;
    
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: 'Hello' }]
        }]
      })
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      if (data.candidates && data.candidates.length > 0) {
        testResults.passed.push('Google Gemini');
        console.log('✅ Google Gemini: CONNECTED');
      } else {
        testResults.failed.push('Google Gemini');
        console.log('❌ Google Gemini: FAILED (unexpected response)');
      }
    } else {
      testResults.failed.push('Google Gemini');
      console.log(`❌ Google Gemini: FAILED (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    testResults.failed.push('Google Gemini');
    console.log(`❌ Google Gemini: FAILED (${error.message})`);
  }
}

// Test Groq API
async function testGroq() {
  if (!API_KEYS.GROQ) {
    testResults.skipped.push('Groq');
    console.log('⏭️  Groq: SKIPPED (no API key)');
    return;
  }
  
  try {
    console.log('🔍 Testing Groq...');
    const url = 'https://api.groq.com/openai/v1/chat/completions';
    
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.GROQ}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    if (response.statusCode === 200) {
      const data = JSON.parse(response.body);
      if (data.choices && data.choices.length > 0) {
        testResults.passed.push('Groq');
        console.log('✅ Groq: CONNECTED');
      } else {
        testResults.failed.push('Groq');
        console.log('❌ Groq: FAILED (unexpected response)');
      }
    } else {
      testResults.failed.push('Groq');
      console.log(`❌ Groq: FAILED (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    testResults.failed.push('Groq');
    console.log(`❌ Groq: FAILED (${error.message})`);
  }
}

// Test HuggingFace API
async function testHuggingFace() {
  if (!API_KEYS.HUGGING_FACE) {
    testResults.skipped.push('HuggingFace');
    console.log('⏭️  HuggingFace: SKIPPED (no API key)');
    return;
  }
  
  try {
    console.log('🔍 Testing HuggingFace...');
    const url = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
    
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.HUGGING_FACE}`
      },
      body: JSON.stringify({
        inputs: 'Hello',
        parameters: { max_new_tokens: 10 }
      })
    });
    
    if (response.statusCode === 200) {
      testResults.passed.push('HuggingFace');
      console.log('✅ HuggingFace: CONNECTED');
    } else if (response.statusCode === 503) {
      // Model loading
      testResults.passed.push('HuggingFace');
      console.log('✅ HuggingFace: CONNECTED (model loading, key valid)');
    } else {
      testResults.failed.push('HuggingFace');
      console.log(`❌ HuggingFace: FAILED (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    testResults.failed.push('HuggingFace');
    console.log(`❌ HuggingFace: FAILED (${error.message})`);
  }
}

// Test OpenAI API (if configured)
async function testOpenAI() {
  if (!API_KEYS.OPENAI) {
    testResults.skipped.push('OpenAI');
    console.log('⏭️  OpenAI: SKIPPED (no API key)');
    return;
  }
  
  try {
    console.log('🔍 Testing OpenAI...');
    const url = 'https://api.openai.com/v1/chat/completions';
    
    const response = await makeRequest(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEYS.OPENAI}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: 'Hello' }],
        max_tokens: 10
      })
    });
    
    if (response.statusCode === 200) {
      testResults.passed.push('OpenAI');
      console.log('✅ OpenAI: CONNECTED');
    } else {
      testResults.failed.push('OpenAI');
      console.log(`❌ OpenAI: FAILED (HTTP ${response.statusCode})`);
    }
  } catch (error) {
    testResults.failed.push('OpenAI');
    console.log(`❌ OpenAI: FAILED (${error.message})`);
  }
}

// Test Backend API
async function testBackendAPI() {
  const backendURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
  
  try {
    console.log('🔍 Testing Backend API...');
    const response = await makeRequest(backendURL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.statusCode === 200 || response.statusCode === 404) {
      testResults.passed.push('Backend API');
      console.log(`✅ Backend API: CONNECTED (${backendURL})`);
    } else {
      testResults.failed.push('Backend API');
      console.log(`⚠️  Backend API: UNREACHABLE (${backendURL}) - Start with 'npm run start:backend'`);
    }
  } catch (error) {
    testResults.failed.push('Backend API');
    console.log(`⚠️  Backend API: OFFLINE (${backendURL}) - Start with 'npm run start:backend'`);
  }
}

// Run all tests
async function runAllTests() {
  console.log('Starting API key tests...\n');
  
  await testGemini();
  await testGroq();
  await testHuggingFace();
  await testOpenAI();
  await testBackendAPI();
  
  // Print summary
  console.log('\n' + '='.repeat(60));
  console.log('\n📊 Test Summary:\n');
  console.log(`✅ Passed:  ${testResults.passed.length}`);
  if (testResults.passed.length > 0) {
    testResults.passed.forEach(name => console.log(`   - ${name}`));
  }
  
  console.log(`\n❌ Failed:  ${testResults.failed.length}`);
  if (testResults.failed.length > 0) {
    testResults.failed.forEach(name => console.log(`   - ${name}`));
  }
  
  console.log(`\n⏭️  Skipped: ${testResults.skipped.length}`);
  if (testResults.skipped.length > 0) {
    testResults.skipped.forEach(name => console.log(`   - ${name}`));
  }
  
  console.log('\n' + '='.repeat(60));
  
  if (testResults.passed.length > 0) {
    console.log('\n✅ JARVIS has working API connections!');
    if (testResults.failed.length > 0) {
      console.log('⚠️  Some services failed - check the details above.');
    }
  } else {
    console.log('\n❌ No working API connections found!');
    console.log('   Please check your API keys in .env file.');
  }
  
  console.log('\n💡 To add or update API keys:');
  console.log('   1. Edit the .env file in the project root');
  console.log('   2. Add your API keys (see .env.example for reference)');
  console.log('   3. Restart the development server\n');
  
  // Exit with appropriate code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// Run the tests
runAllTests().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
