# Complete Setup Guide - Study Companion App

This guide will walk you through setting up and running the complete Study Companion application with frontend, backend, and database.

## 🚀 Prerequisites

Before you begin, ensure you have:

- **Node.js 18+** and npm installed
- A **Supabase account** (free tier available)
- **OpenAI API key** (required)
- **Groq API key** (optional, for fallback)
- **Google Gemini API key** (optional, for fallback)

## 📋 Step-by-Step Setup

### Step 1: Clone and Install Dependencies

```bash
# Navigate to your project directory
cd "D:\projects practical application\Product amangement projects\study-companion"

# Install all dependencies
npm install
```

### Step 2: Set Up Supabase (Backend & Database)

#### 2.1 Create a Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Choose your organization
5. Enter project name: "Study Companion"
6. Set a strong database password (save this!)
7. Choose a region close to you
8. Click "Create new project"

#### 2.2 Get Your Supabase Credentials

1. Go to **Settings** → **API** in your Supabase dashboard
2. Copy your **Project URL** (looks like: `https://your-project-id.supabase.co`)
3. Copy your **anon/public key** (starts with `eyJ...`)

#### 2.3 Set Up the Database Schema

1. Go to the **SQL Editor** in your Supabase dashboard
2. Click **"New Query"**
3. Copy the **entire contents** of `database-schema.sql` from your project
4. Paste it into the SQL editor
5. Click **"Run"** to execute the schema

**Important:** This creates all tables, policies, triggers, and functions needed for the app.

### Step 3: Get AI API Keys

#### 3.1 OpenAI API Key (Required)

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Click **"Create new secret key"**
5. Copy the key (starts with `sk-`)

#### 3.2 Groq API Key (Optional - for fallback)

1. Go to [console.groq.com](https://console.groq.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key (starts with `gsk_`)

#### 3.3 Google Gemini API Key (Optional - for fallback)

1. Go to [makersuite.google.com](https://makersuite.google.com)
2. Sign up or log in
3. Go to **API Keys** section
4. Create a new API key
5. Copy the key

### Step 4: Configure Environment Variables

#### 4.1 Create Environment File

```bash
# Copy the example environment file
cp env.example .env.local
```

#### 4.2 Edit .env.local

Open `.env.local` and add your credentials:

```env
# Supabase Configuration (Backend & Database)
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI API Keys
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_google_gemini_key_here
```

**Replace the values with your actual keys!**

### Step 5: Start the Development Server

```bash
# Start the development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Step 6: Create Your First Account

1. Open `http://localhost:5173` in your browser
2. Click **"Sign up"** on the login page
3. Enter your details and create an account
4. You'll be redirected to the dashboard

## 🔧 Verification Steps

### Check Database Connection

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. You should see all tables: `profiles`, `subjects`, `study_sessions`, `questions`, etc.

### Check Authentication

1. Try logging in/out
2. Check if your profile is created in the `profiles` table
3. Verify protected routes work

### Test AI Features

1. Go to **Subjects** page and create a subject
2. Go to **Questions** page and try generating AI questions
3. Check browser console for any errors

## 🚀 Production Deployment

### Deploy to Netlify

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
   - Go to **Site settings** → **Environment variables**
   - Add all variables from your `.env.local`

4. **Deploy**
   - Click "Deploy site"
   - Your app will be live at `https://your-site.netlify.app`

## 🔍 Troubleshooting

### Common Issues

#### 1. "Failed to fetch subjects" error
- Check your Supabase URL and anon key in `.env.local`
- Ensure the database schema was executed successfully
- Verify RLS policies are in place

#### 2. "AI provider failed" error
- Check your OpenAI API key
- Ensure you have credits in your OpenAI account
- Try adding Groq as a fallback

#### 3. Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (requires 18+)
- Clear node_modules and reinstall if needed

#### 4. Authentication issues
- Check Supabase project settings
- Verify email confirmation is disabled for development
- Check browser console for detailed error messages

### Getting Help

- Check the browser console for error messages
- Review the Supabase logs in your dashboard
- Ensure all environment variables are set correctly
- Verify the database schema was applied successfully

## 📊 Database Schema Overview

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

## 🎯 Testing the Application

### 1. Authentication Flow
- [ ] Sign up with email/password
- [ ] Sign in/out functionality
- [ ] Password reset (if configured)

### 2. Subject Management
- [ ] Create a new subject
- [ ] Edit subject details
- [ ] Delete subjects
- [ ] View subject progress

### 3. Study Sessions
- [ ] Start a Pomodoro timer
- [ ] Pause/resume functionality
- [ ] Complete sessions with focus rating
- [ ] View session history

### 4. AI Question Generation
- [ ] Generate questions for a subject
- [ ] Different question types (MCQ, short answer, etc.)
- [ ] View generated questions
- [ ] Add questions to question bank

### 5. Spaced Repetition
- [ ] Create flashcards
- [ ] Review cards with SM-2 algorithm
- [ ] Track review progress
- [ ] View spaced repetition analytics

### 6. Analytics
- [ ] View study time charts
- [ ] Check performance metrics
- [ ] Export data (PDF/CSV)
- [ ] Filter by date ranges

### 7. Goal Management
- [ ] Create SMART goals
- [ ] Track goal progress
- [ ] Set deadlines and priorities
- [ ] Mark goals as complete

## 🎉 Success Indicators

Your app is working correctly when:

✅ You can sign up and log in
✅ You can create and manage subjects
✅ The Pomodoro timer works
✅ AI question generation works
✅ Spaced repetition system functions
✅ Analytics show data
✅ Goals can be created and tracked
✅ All pages load without errors
✅ Dark/light theme toggle works
✅ Mobile responsiveness works

## 📚 Next Steps

After successful setup:

1. **Explore Features** - Try all the app features
2. **Customize Settings** - Adjust Pomodoro timer, themes, etc.
3. **Add Real Data** - Create subjects, generate questions, set goals
4. **Deploy to Production** - Use Netlify for hosting
5. **Monitor Usage** - Check Supabase analytics
6. **Scale Up** - Add more AI providers, features, etc.

---

**🎓 Your Study Companion app is now fully functional with frontend, backend, and database!**

**Need help?** Check the troubleshooting section or create an issue on GitHub.
