#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Study Companion - Production Setup');
console.log('=====================================\n');

// Check if .env.local exists
const envPath = path.join(__dirname, '.env.local');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ .env.local created from env.example');
  } else {
    // Create a basic .env.local file
    const envContent = `# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_google_gemini_key

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=your_ga_id

# Optional: Sentry for error tracking
VITE_SENTRY_DSN=your_sentry_dsn
`;
    fs.writeFileSync(envPath, envContent);
    console.log('✅ .env.local created with default values');
  }
} else {
  console.log('✅ .env.local already exists');
}

console.log('\n📋 Next Steps:');
console.log('==============');
console.log('1. Edit .env.local with your actual API keys:');
console.log('   - Supabase: https://supabase.com (create project)');
console.log('   - OpenAI: https://platform.openai.com/api-keys');
console.log('   - Groq (optional): https://console.groq.com/keys');
console.log('   - Gemini (optional): https://makersuite.google.com/app/apikey');
console.log('');
console.log('2. Set up your Supabase database:');
console.log('   - Run the database-schema.sql in Supabase SQL Editor');
console.log('   - Enable Row Level Security (RLS)');
console.log('');
console.log('3. Test the app:');
console.log('   npm run dev');
console.log('   Open http://localhost:5173');
console.log('');
console.log('4. Build for production:');
console.log('   npm run build');
console.log('');
console.log('5. Deploy to Netlify:');
console.log('   - Connect your GitHub repository');
console.log('   - Set build command: npm run build');
console.log('   - Set publish directory: dist');
console.log('   - Add environment variables in Netlify dashboard');
console.log('');
console.log('🎉 Your Study Companion app is ready for production!');
console.log('');
console.log('📚 For detailed setup instructions, see:');
console.log('   - COMPLETE_SETUP_GUIDE.md');
console.log('   - DEPLOYMENT_GUIDE.md');
console.log('   - PRODUCTION_READY_GUIDE.md');
