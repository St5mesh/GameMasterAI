#!/usr/bin/env node
/**
 * Test script to verify API configuration
 * Tests both OpenAI and LM Studio configurations
 */

require('dotenv').config();

const API_BASE_URL = process.env.LM_STUDIO_BASE_URL || 'https://api.openai.com/v1';
const API_KEY = process.env.OPENAI_API_KEY || '';

console.log('=== API Configuration Test ===\n');
console.log('Configuration:');
console.log('  API Base URL:', API_BASE_URL);
console.log('  API Key:', API_KEY ? '✓ Set (hidden)' : '✗ Not set');
console.log();

if (API_BASE_URL.includes('localhost') || API_BASE_URL.includes('127.0.0.1')) {
    console.log('Mode: LM Studio (Local)');
    console.log('Expected: LM Studio server should be running at', API_BASE_URL);
    console.log('Note: API key is optional for LM Studio');
} else {
    console.log('Mode: OpenAI (Cloud)');
    if (!API_KEY) {
        console.warn('⚠ WARNING: OPENAI_API_KEY is not set. OpenAI API calls will fail.');
    }
}

console.log('\n=== Configuration Summary ===');
console.log('To use OpenAI:');
console.log('  - Set OPENAI_API_KEY in .env');
console.log('  - Do NOT set LM_STUDIO_BASE_URL (or comment it out)');
console.log();
console.log('To use LM Studio:');
console.log('  - Set LM_STUDIO_BASE_URL=http://localhost:1234/v1 in .env');
console.log('  - OPENAI_API_KEY can be empty or removed');
console.log('  - Ensure LM Studio server is running');
console.log();
