#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Setting up environment variables for Study Companion...\n');

// Your actual API keys - Replace with your real keys
const envContent = `# Supabase Configuration (Backend & Database)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side key (for server-side operations - not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key

# Optional: Analytics and Monitoring
VITE_GOOGLE_ANALYTICS_ID=your_ga_id
VITE_SENTRY_DSN=your_sentry_dsn

# Optional: Legacy Supabase settings
SUPABASE_JWT_SECRET=your_jwt_secret
SUPABASE_ACCESS_TOKEN_EXPIRY=3600
`;

const envPath = path.join(__dirname, '.env.local');

try {
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!');
  console.log('🔑 Your Supabase and AI API keys are configured.');
  console.log('⚠️  Note: Replace the placeholder AI API keys with your actual keys:\n');
  console.log('   - OPENAI_API_KEY: Get from https://platform.openai.com/api-keys');
  console.log('   - GROQ_API_KEY: Get from https://console.groq.com/keys');
  console.log('   - GEMINI_API_KEY: Get from https://makersuite.google.com/app/apikey\n');
  console.log('🚀 Next steps:');
  console.log('   1. Edit .env.local and replace placeholder AI keys with real ones');
  console.log('   2. Apply database schema to your Supabase project');
  console.log('   3. Run: npm run dev');
  console.log('   4. Open: http://localhost:5173\n');
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Please manually create .env.local with the following content:\n');
  console.log(envContent);
}
