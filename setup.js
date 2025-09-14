#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Study Companion Setup Script');
console.log('================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log('📝 Creating .env.local from env.example...');
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created successfully!');
    console.log('⚠️  Please edit .env.local with your actual API keys before running the app.\n');
  } else {
    console.log('❌ env.example file not found!');
    process.exit(1);
  }
} else {
  console.log('✅ .env.local already exists\n');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Installing dependencies...');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependencies installed successfully!\n');
  } catch (error) {
    console.log('❌ Failed to install dependencies:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependencies already installed\n');
}

// Check environment variables
console.log('🔍 Checking environment variables...');
const envContent = fs.readFileSync(envPath, 'utf8');

const requiredVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
  'OPENAI_API_KEY'
];

const missingVars = [];
const placeholderVars = [];

requiredVars.forEach(varName => {
  if (!envContent.includes(varName)) {
    missingVars.push(varName);
  } else if (envContent.includes(`${varName}=your_`) || envContent.includes(`${varName}=sk-`)) {
    placeholderVars.push(varName);
  }
});

if (missingVars.length > 0) {
  console.log('❌ Missing required environment variables:', missingVars.join(', '));
  console.log('Please add these to your .env.local file.\n');
}

if (placeholderVars.length > 0) {
  console.log('⚠️  Environment variables with placeholder values:', placeholderVars.join(', '));
  console.log('Please replace these with your actual API keys.\n');
}

if (missingVars.length === 0 && placeholderVars.length === 0) {
  console.log('✅ All environment variables are configured!\n');
}

// Display next steps
console.log('📋 Next Steps:');
console.log('==============');
console.log('1. Edit .env.local with your actual API keys');
console.log('2. Set up your Supabase project:');
console.log('   - Create a new project at https://supabase.com');
console.log('   - Copy your Project URL and anon key to .env.local');
console.log('   - Run the database-schema.sql in Supabase SQL Editor');
console.log('3. Get your AI API keys:');
console.log('   - OpenAI: https://platform.openai.com/api-keys');
console.log('   - Groq (optional): https://console.groq.com/keys');
console.log('   - Gemini (optional): https://makersuite.google.com/app/apikey');
console.log('4. Run the app: npm run dev');
console.log('5. Open http://localhost:5173 in your browser\n');

console.log('📚 For detailed setup instructions, see:');
console.log('   - COMPLETE_SETUP_GUIDE.md');
console.log('   - README.md');
console.log('   - SETUP.md\n');

console.log('🎉 Setup script completed!');
console.log('Happy studying! 📚');
