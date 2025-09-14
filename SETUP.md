# Study Companion - Setup Guide

This guide will walk you through setting up the Study Companion application from scratch.

## 📋 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- A **Supabase account** (free tier available)
- **OpenAI API key** (required)
- **Groq API key** (optional, for fallback)
- **Google Gemini API key** (optional, for fallback)

## 🚀 Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd study-companion

# Install dependencies
npm install
```

### Step 2: Set Up Supabase

1. **Create a Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Sign up or log in
   - Click "New Project"
   - Choose your organization
   - Enter project name: "Study Companion"
   - Set a strong database password
   - Choose a region close to you
   - Click "Create new project"

2. **Get Your Supabase Credentials**
   - Go to Settings → API
   - Copy your Project URL
   - Copy your anon/public key

3. **Set Up the Database**
   - Go to the SQL Editor in your Supabase dashboard
   - Click "New Query"
   - Copy the entire contents of `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute the schema

### Step 3: Get AI API Keys

#### OpenAI (Required)
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to API Keys section
4. Click "Create new secret key"
5. Copy the key (starts with `sk-`)

#### Groq (Optional)
1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

#### Google Gemini (Optional)
1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Sign up or log in
3. Go to API Keys section
4. Create a new API key
5. Copy the key

### Step 4: Configure Environment Variables

1. **Copy the example file**
   ```bash
   cp env.example .env.local
   ```

2. **Edit `.env.local` with your credentials**
   ```env
   # Supabase Configuration
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

   # AI API Keys
   OPENAI_API_KEY=sk-your_openai_api_key
   GROQ_API_KEY=gsk_your_groq_api_key
   GEMINI_API_KEY=your_google_gemini_key
   ```

### Step 5: Start the Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 6: Create Your First Account

1. Open the application in your browser
2. Click "Sign up" on the login page
3. Enter your details and create an account
4. You'll be redirected to the dashboard

## 🔧 Configuration Options

### Supabase Configuration

The application uses Supabase for:
- **Authentication** - User sign up, sign in, password reset
- **Database** - All data storage with Row Level Security
- **Real-time** - Live updates for collaborative features

### AI Provider Configuration

The application supports multiple AI providers with automatic fallback:

1. **Primary**: OpenAI GPT-4 (most reliable)
2. **Fallback 1**: Groq (fastest, cost-effective)
3. **Fallback 2**: Google Gemini (alternative option)

If you only have OpenAI, the app will work fine. Additional providers provide redundancy and cost optimization.

## 🗄️ Database Schema Overview

The database includes these main tables:

- **profiles** - User information and preferences
- **subjects** - Study subjects with progress tracking
- **study_sessions** - Pomodoro sessions and focus ratings
- **questions** - AI-generated and custom questions
- **question_attempts** - Answer tracking for analytics
- **spaced_repetition_cards** - SM-2 algorithm implementation
- **goals** - SMART goals with progress tracking
- **study_plans** - AI-generated personalized plans
- **notifications** - User notifications and reminders

## 🚀 Deployment

### Netlify (Recommended)

1. **Connect Repository**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "New site from Git"
   - Connect your repository

2. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

3. **Add Environment Variables**
   - Go to Site settings → Environment variables
   - Add all variables from your `.env.local`

4. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-site.netlify.app`

### Vercel

1. **Connect Repository**
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository

2. **Configure Environment Variables**
   - Add all variables from your `.env.local`

3. **Deploy**
   - Click "Deploy"
   - Your app will be live at `https://your-site.vercel.app`

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to fetch subjects" error**
   - Check your Supabase URL and anon key
   - Ensure the database schema was executed successfully
   - Verify RLS policies are in place

2. **"AI provider failed" error**
   - Check your OpenAI API key
   - Ensure you have credits in your OpenAI account
   - Try adding Groq as a fallback

3. **Build errors**
   - Run `npm install` to ensure all dependencies are installed
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall if needed

4. **Authentication issues**
   - Check Supabase project settings
   - Verify email confirmation is disabled for development
   - Check browser console for detailed error messages

### Getting Help

- Check the browser console for error messages
- Review the Supabase logs in your dashboard
- Ensure all environment variables are set correctly
- Verify the database schema was applied successfully

## 📚 Next Steps

After setup, you can:

1. **Create Subjects** - Add your study topics
2. **Generate Questions** - Use AI to create practice questions
3. **Set Goals** - Define your learning objectives
4. **Start Studying** - Use the Pomodoro timer
5. **Track Progress** - View analytics and insights

## 🎯 Production Considerations

For production deployment:

1. **Enable Email Confirmation** in Supabase
2. **Set up Custom Domain** in Netlify/Vercel
3. **Configure Analytics** (Google Analytics, etc.)
4. **Set up Monitoring** (Sentry, LogRocket, etc.)
5. **Enable Backup** for your Supabase database
6. **Set up CDN** for better performance

---

**Need help?** Create an issue on GitHub or check the documentation!