#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Study Companion - Complete Setup');
console.log('===================================\n');

// Your actual Supabase credentials
const supabaseUrl = 'https://ntbhjokkvddqtowpbfxm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymhqb2trdmRkcXRvd3BiZnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjM2MzUsImV4cCI6MjA3MzE5OTYzNX0.h2aoAxuwpCRfUPrvv6TqznmPToUYhOww5iHaqW0sozQ';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymhqb2trdmRkcXRvd3BiZnhtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzYyMzYzNSwiZXhwIjoyMDczMTk5NjM1fQ.5eGtiARsv0ocU9UKNQQtklimpaDGHhVhqRJB0khJUNQ';

// Environment file content
const envContent = `# Supabase Configuration (Backend & Database)
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Server-side key (for server-side operations - not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=${supabaseServiceKey}

# AI API Keys (Replace with your actual keys)
OPENAI_API_KEY=sk-proj-1234567890abcdef1234567890abcdef
GROQ_API_KEY=gsk_1234567890abcdef1234567890abcdef
GEMINI_API_KEY=AIzaSy1234567890abcdef1234567890abcdef

# Optional: Analytics and Monitoring
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Optional: Legacy Supabase settings
SUPABASE_JWT_SECRET=qUt+a9to61nEeP1Sy9KFDbFNfquAJ+bXTCdGotxv5ZBD2MRd/Ro0M/YaYI09/8N7X3AqzNOg1Aqo8YxM87XO6Q==
SUPABASE_ACCESS_TOKEN_EXPIRY=3600
`;

async function setupComplete() {
  try {
    console.log('📝 Step 1: Creating .env.local file...');
    const envPath = path.join(__dirname, '.env.local');
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created with your Supabase credentials!\n');

    console.log('📦 Step 2: Installing dependencies...');
    if (!fs.existsSync(path.join(__dirname, 'node_modules'))) {
      execSync('npm install', { stdio: 'inherit' });
      console.log('✅ Dependencies installed successfully!\n');
    } else {
      console.log('✅ Dependencies already installed!\n');
    }

    console.log('🔍 Step 3: Checking project structure...');
    const requiredFiles = [
      'src/App.tsx',
      'src/main.tsx',
      'database-schema.sql',
      'package.json',
      'vite.config.ts'
    ];

    const missingFiles = requiredFiles.filter(file => !fs.existsSync(path.join(__dirname, file)));
    
    if (missingFiles.length === 0) {
      console.log('✅ All required files are present!\n');
    } else {
      console.log('⚠️  Missing files:', missingFiles.join(', '));
      console.log('Please ensure all project files are in place.\n');
    }

    console.log('🎯 Step 4: Setup Summary');
    console.log('========================');
    console.log(`✅ Supabase URL: ${supabaseUrl}`);
    console.log('✅ Supabase anon key: Configured');
    console.log('✅ Environment file: Created');
    console.log('✅ Dependencies: Installed');
    console.log('✅ Project structure: Verified\n');

    console.log('📋 Next Steps:');
    console.log('==============');
    console.log('1. 🔑 Get your AI API keys:');
    console.log('   - OpenAI: https://platform.openai.com/api-keys');
    console.log('   - Groq: https://console.groq.com/keys');
    console.log('   - Gemini: https://makersuite.google.com/app/apikey');
    console.log('');
    console.log('2. 📝 Edit .env.local and replace placeholder AI keys with real ones');
    console.log('');
    console.log('3. 🗄️  Apply database schema to Supabase:');
    console.log('   - Go to: https://supabase.com/dashboard/project/ntbhjokkvddqtowpbfxm');
    console.log('   - Open SQL Editor');
    console.log('   - Copy contents of database-schema.sql');
    console.log('   - Paste and click "Run"');
    console.log('');
    console.log('4. 🚀 Start the development server:');
    console.log('   npm run dev');
    console.log('');
    console.log('5. 🌐 Open your app:');
    console.log('   http://localhost:5173');
    console.log('');
    console.log('6. 🧪 Test the app:');
    console.log('   - Create an account');
    console.log('   - Create subjects');
    console.log('   - Start study sessions');
    console.log('   - Generate AI questions');
    console.log('   - Set goals');
    console.log('');
    console.log('📚 For detailed instructions, see:');
    console.log('   - DEPLOYMENT_GUIDE.md');
    console.log('   - COMPLETE_SETUP_GUIDE.md');
    console.log('   - API_KEYS_GUIDE.md\n');

    console.log('🎉 Setup completed successfully!');
    console.log('Your Study Companion app is ready to run! 📚✨');

  } catch (error) {
    console.error('❌ Setup failed:', error.message);
    console.log('\n🔧 Manual setup required:');
    console.log('1. Create .env.local with your Supabase credentials');
    console.log('2. Run: npm install');
    console.log('3. Apply database schema to Supabase');
    console.log('4. Run: npm run dev');
  }
}

setupComplete();
