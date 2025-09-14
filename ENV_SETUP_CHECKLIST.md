# Environment Setup Checklist

## ✅ Required API Keys Checklist

### 1. Supabase (Backend & Database) - REQUIRED
- [ ] Go to [supabase.com](https://supabase.com)
- [ ] Create new project
- [ ] Copy Project URL to `VITE_SUPABASE_URL`
- [ ] Copy anon key to `VITE_SUPABASE_ANON_KEY`
- [ ] Apply database schema from `database-schema.sql`

### 2. OpenAI (Primary AI) - REQUIRED
- [ ] Go to [platform.openai.com](https://platform.openai.com)
- [ ] Create API key
- [ ] Copy key to `OPENAI_API_KEY`
- [ ] Add billing information (required for API usage)

### 3. Groq (Fast AI Fallback) - OPTIONAL
- [ ] Go to [console.groq.com](https://console.groq.com)
- [ ] Create API key
- [ ] Copy key to `GROQ_API_KEY`

### 4. Google Gemini (Alternative AI) - OPTIONAL
- [ ] Go to [makersuite.google.com](https://makersuite.google.com)
- [ ] Create API key
- [ ] Copy key to `GEMINI_API_KEY`

## 📝 Your .env.local File Should Look Like:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI API Keys
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_google_gemini_key_here

# Optional Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🚀 Quick Setup Commands:

```bash
# 1. Navigate to project
cd "D:\projects practical application\Product amangement projects\study-companion"

# 2. Install dependencies
npm install

# 3. Create environment file
cp env.example .env.local

# 4. Edit .env.local with your API keys
# (Open the file and replace placeholder values)

# 5. Start the app
npm run dev
```

## 🎯 Minimum for Basic Functionality:

You need **at least** these 3 keys:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY` 
- `OPENAI_API_KEY`

## 💰 Cost Estimate:

- **Supabase:** FREE (50k users, 500MB DB)
- **OpenAI:** $5-15/month (100 active users)
- **Groq:** FREE (14k requests/day)
- **Gemini:** FREE (1.5k requests/day)

**Total: $5-15/month for full functionality**
