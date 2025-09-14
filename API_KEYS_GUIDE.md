# Complete API Keys Guide - Study Companion

## 🔑 Required Environment Variables

Here's exactly what you need to add to your `.env.local` file for the full app to work:

```env
# ===========================================
# SUPABASE CONFIGURATION (REQUIRED)
# ===========================================
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ===========================================
# AI API KEYS (REQUIRED)
# ===========================================
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_google_gemini_key_here

# ===========================================
# OPTIONAL ANALYTICS & MONITORING
# ===========================================
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🎯 How to Get Each API Key

### 1. Supabase Keys (REQUIRED - Backend & Database)

**What it's used for:**
- User authentication (login/register)
- Database operations (subjects, sessions, questions, etc.)
- Real-time data synchronization
- File storage for user uploads

**How to get:**
1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose organization and enter project name
5. Set a strong database password
6. Choose region and click "Create new project"
7. Wait for project to be ready
8. Go to **Settings** → **API**
9. Copy:
   - **Project URL** (looks like: `https://abcdefghijklmnop.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

**Cost:** FREE tier includes 50,000 monthly active users, 500MB database, 1GB file storage

---

### 2. OpenAI API Key (REQUIRED - Primary AI)

**What it's used for:**
- AI question generation (MCQ, short answer, essay questions)
- Study plan generation
- Performance analysis
- Content explanations and hints

**How to get:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click "Create new secret key"
5. Give it a name (e.g., "Study Companion")
6. Copy the key (starts with `sk-proj-` or `sk-`)

**Cost:** Pay-per-use, approximately $0.002-0.02 per question generated
**Free tier:** $5 credit for new accounts

---

### 3. Groq API Key (OPTIONAL - Fast AI Fallback)

**What it's used for:**
- Fast AI question generation as fallback
- Quick responses when OpenAI is slow
- Cost-effective alternative for simple questions

**How to get:**
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click "Create API Key"
5. Copy the key (starts with `gsk_`)

**Cost:** FREE tier includes 14,400 requests per day
**Speed:** Much faster than OpenAI (up to 10x faster)

---

### 4. Google Gemini API Key (OPTIONAL - Alternative AI)

**What it's used for:**
- Alternative AI provider for question generation
- Multimodal content generation
- Fallback when other providers fail

**How to get:**
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click "Create API Key"
5. Copy the key

**Cost:** FREE tier includes 1,500 requests per day
**Features:** Supports text, images, and code generation

---

### 5. Google Analytics (OPTIONAL - Usage Tracking)

**What it's used for:**
- Track user engagement
- Monitor app performance
- Understand user behavior

**How to get:**
1. Go to [analytics.google.com](https://analytics.google.com)
2. Create a new property
3. Get your Measurement ID (starts with `G-`)

**Cost:** FREE

---

### 6. Sentry (OPTIONAL - Error Tracking)

**What it's used for:**
- Monitor app errors and crashes
- Performance monitoring
- User feedback collection

**How to get:**
1. Go to [sentry.io](https://sentry.io)
2. Create a new project
3. Get your DSN from project settings

**Cost:** FREE tier includes 5,000 errors per month

## 🚀 Minimum Required Setup

For the app to work, you need **at least**:

```env
# Minimum required for basic functionality
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
```

## 💰 Cost Breakdown

### Free Tier Limits:
- **Supabase:** 50,000 users, 500MB database, 1GB storage
- **OpenAI:** $5 free credit (≈2,500 questions)
- **Groq:** 14,400 requests/day (≈14,400 questions)
- **Gemini:** 1,500 requests/day (≈1,500 questions)

### Estimated Monthly Costs (100 active users):
- **Supabase:** $0 (free tier)
- **OpenAI:** $5-15 (depending on usage)
- **Groq:** $0 (free tier)
- **Gemini:** $0 (free tier)
- **Total:** $5-15/month

## 🔧 Step-by-Step Setup

### 1. Create .env.local file:
```bash
# Copy the example file
cp env.example .env.local
```

### 2. Edit .env.local with your keys:
```env
# Replace with your actual values
VITE_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTY5ODc2MDAwMCwiZXhwIjoyMDE0MzM2MDAwfQ.example_signature_here
OPENAI_API_KEY=sk-proj-1234567890abcdef1234567890abcdef1234567890abcdef
GROQ_API_KEY=gsk_1234567890abcdef1234567890abcdef1234567890abcdef
GEMINI_API_KEY=AIzaSy1234567890abcdef1234567890abcdef1234567890
```

### 3. Test your setup:
```bash
npm run dev
```

## 🎯 What Each Key Enables

| API Key | Features Enabled |
|---------|------------------|
| **Supabase** | ✅ User auth, database, real-time sync |
| **OpenAI** | ✅ AI questions, study plans, explanations |
| **Groq** | ✅ Fast AI fallback, cost-effective questions |
| **Gemini** | ✅ Alternative AI, multimodal content |
| **Analytics** | ✅ Usage tracking, performance monitoring |
| **Sentry** | ✅ Error tracking, crash reporting |

## 🚨 Important Security Notes

1. **Never commit .env.local to git** (it's in .gitignore)
2. **Keep your API keys secret** - don't share them
3. **Use environment variables in production** - don't hardcode keys
4. **Monitor your API usage** - set up billing alerts
5. **Rotate keys regularly** - especially if compromised

## 🔍 Troubleshooting

### "Failed to fetch subjects" error:
- Check Supabase URL and anon key
- Ensure database schema is applied
- Verify RLS policies are in place

### "AI provider failed" error:
- Check OpenAI API key is valid
- Ensure you have credits in OpenAI account
- Try adding Groq as fallback

### "Authentication failed" error:
- Verify Supabase project is active
- Check anon key is correct
- Ensure email confirmation is disabled for development

## 🎉 Success Indicators

Your app is fully configured when:
- ✅ Can create account and log in
- ✅ Can create subjects
- ✅ AI question generation works
- ✅ Pomodoro timer functions
- ✅ Analytics show data
- ✅ Goals can be created and tracked

---

**🎓 With these API keys, your Study Companion app will have full frontend, backend, database, and AI functionality!**
