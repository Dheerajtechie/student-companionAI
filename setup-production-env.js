import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Production-ready environment configuration
const envContent = `# ===========================================
# SUPABASE CONFIGURATION (REQUIRED)
# ===========================================
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Server-side key (for server-side operations - not exposed to client)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# ===========================================
# AI API KEYS (REQUIRED)
# ===========================================
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=AIzaSy1234567890abcdef1234567890abcdef

# ===========================================
# OPTIONAL: ANALYTICS AND MONITORING
# ===========================================
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ===========================================
# OPTIONAL: LEGACY SUPABASE SETTINGS
# ===========================================
SUPABASE_JWT_SECRET=qUt+a9to61nEeP1Sy9KFDbFNfquAJ+bXTCdGotxv5ZBD2MRd/Ro0M/YaYI09/8N7X3AqzNOg1Aqo8YxM87XO6Q==
SUPABASE_ACCESS_TOKEN_EXPIRY=3600

# ===========================================
# DEVELOPMENT SETTINGS
# ===========================================
NODE_ENV=development
VITE_APP_VERSION=1.0.0
VITE_APP_NAME=Study Companion
`

const envPath = path.join(__dirname, '.env.local')

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('✅ .env.local already exists')
    console.log('📝 Current environment variables:')
    
    const currentEnv = fs.readFileSync(envPath, 'utf8')
    const lines = currentEnv.split('\n').filter(line => line.trim() && !line.startsWith('#'))
    
    lines.forEach(line => {
      const [key] = line.split('=')
      if (key) {
        console.log(`   ${key}=${key.includes('KEY') ? '***' : 'SET'}`)
      }
    })
  } else {
    // Create .env.local file
    fs.writeFileSync(envPath, envContent)
    console.log('✅ Created .env.local with production-ready configuration')
    console.log('🔑 Environment variables configured:')
    console.log('   - Supabase URL and keys')
    console.log('   - OpenAI API key')
    console.log('   - Groq API key')
    console.log('   - Gemini API key')
    console.log('   - Optional analytics keys')
  }
  
  console.log('\n🚀 Ready to start the development server!')
  console.log('Run: npm run dev')
  
} catch (error) {
  console.error('❌ Failed to setup environment:', error.message)
  process.exit(1)
}
