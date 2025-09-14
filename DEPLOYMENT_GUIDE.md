# Complete Deployment Guide - Study Companion

## 🎯 Your Supabase Project Details

**Project URL:** `https://ntbhjokkvddqtowpbfxm.supabase.co`
**Project ID:** `ntbhjokkvddqtowpbfxm`

## 🚀 Step-by-Step Deployment Instructions

### Step 1: Set Up Environment Variables

Run the setup script to create your `.env.local` file:

```bash
node setup-env.js
```

This will create `.env.local` with your Supabase credentials. You'll need to replace the placeholder AI API keys with your actual ones.

### Step 2: Apply Database Schema

1. **Go to your Supabase Dashboard:**
   - Visit: https://supabase.com/dashboard/project/ntbhjokkvddqtowpbfxm

2. **Open SQL Editor:**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Apply the Schema:**
   - Copy the entire contents of `database-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

4. **Verify Tables Created:**
   - Go to "Table Editor"
   - You should see these tables:
     - `profiles`
     - `subjects`
     - `study_sessions`
     - `questions`
     - `question_attempts`
     - `spaced_repetition_cards`
     - `goals`
     - `study_plans`
     - `notifications`

### Step 3: Configure Authentication

1. **Go to Authentication Settings:**
   - In Supabase dashboard, go to "Authentication" → "Settings"

2. **Configure Email Settings:**
   - For development: Disable "Enable email confirmations"
   - For production: Enable "Enable email confirmations"

3. **Set Up Email Templates (Optional):**
   - Customize signup, login, and password reset emails

### Step 4: Install Dependencies and Start Development

```bash
# Install all dependencies
npm install

# Start development server
npm run dev
```

### Step 5: Test the Application

1. **Open the app:** `http://localhost:5173`
2. **Create an account** with your email
3. **Test all features:**
   - Create subjects
   - Start study sessions
   - Generate AI questions
   - Set goals
   - View analytics

## 🌐 Production Deployment

### Option 1: Deploy to Netlify (Recommended)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Netlify:**
   - Go to [netlify.com](https://netlify.com)
   - Sign up with GitHub
   - Click "New site from Git"
   - Connect your repository

3. **Configure Build Settings:**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

4. **Add Environment Variables:**
   - Go to Site settings → Environment variables
   - Add all variables from your `.env.local`:
     ```
     VITE_SUPABASE_URL=https://ntbhjokkvddqtowpbfxm.supabase.co
     VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymhqb2trdmRkcXRvd3BiZnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjM2MzUsImV4cCI6MjA3MzE5OTYzNX0.h2aoAxuwpCRfUPrvv6TqznmPToUYhOww5iHaqW0sozQ
     OPENAI_API_KEY=your_actual_openai_key
     GROQ_API_KEY=your_actual_groq_key
     GEMINI_API_KEY=your_actual_gemini_key
     ```

5. **Deploy:**
   - Click "Deploy site"
   - Your app will be live at `https://your-site-name.netlify.app`

### Option 2: Deploy to Vercel

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **Add Environment Variables:**
   - Go to Vercel dashboard
   - Add all environment variables

### Option 3: Deploy to Railway

1. **Connect GitHub:**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Configure:**
   - Build command: `npm run build`
   - Start command: `npm run preview`
   - Add environment variables

## 🔧 Production Configuration

### Supabase Production Settings

1. **Enable Row Level Security:**
   - All tables should have RLS enabled (already in schema)

2. **Set Up Email Templates:**
   - Customize authentication emails
   - Set up custom SMTP if needed

3. **Configure Storage:**
   - Enable file storage for user uploads
   - Set up storage policies

4. **Monitor Usage:**
   - Check API usage in dashboard
   - Set up billing alerts

### Environment Variables for Production

```env
# Production Environment Variables
VITE_SUPABASE_URL=https://ntbhjokkvddqtowpbfxm.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im50Ymhqb2trdmRkcXRvd3BiZnhtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc2MjM2MzUsImV4cCI6MjA3MzE5OTYzNX0.h2aoAxuwpCRfUPrvv6TqznmPToUYhOww5iHaqW0sozQ

# AI API Keys (Replace with actual keys)
OPENAI_API_KEY=sk-proj-your_actual_openai_key
GROQ_API_KEY=gsk_your_actual_groq_key
GEMINI_API_KEY=your_actual_gemini_key

# Optional: Analytics
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
```

## 🧪 Testing Checklist

### Development Testing
- [ ] App loads at `http://localhost:5173`
- [ ] Can create account and log in
- [ ] Can create and manage subjects
- [ ] Pomodoro timer works correctly
- [ ] AI question generation works
- [ ] Spaced repetition system functions
- [ ] Analytics display data
- [ ] Goals can be created and tracked
- [ ] Dark/light theme toggle works
- [ ] Mobile responsive design works

### Production Testing
- [ ] App loads on production URL
- [ ] Authentication works in production
- [ ] All features function correctly
- [ ] Database operations work
- [ ] AI features work with real API keys
- [ ] Error handling works properly
- [ ] Performance is acceptable
- [ ] Mobile experience is good

## 🔍 Troubleshooting

### Common Issues

1. **"Failed to fetch subjects" error:**
   - Check Supabase URL and anon key
   - Ensure database schema was applied
   - Verify RLS policies are in place

2. **"AI provider failed" error:**
   - Check OpenAI API key is valid
   - Ensure you have credits in OpenAI account
   - Try adding Groq as fallback

3. **Build errors:**
   - Check Node.js version (requires 18+)
   - Clear node_modules and reinstall
   - Check for TypeScript errors

4. **Authentication issues:**
   - Check Supabase project settings
   - Verify email confirmation settings
   - Check browser console for errors

### Getting Help

- Check browser console for error messages
- Review Supabase logs in dashboard
- Check Netlify/Vercel build logs
- Verify all environment variables are set

## 📊 Monitoring and Analytics

### Supabase Dashboard
- Monitor database usage
- Check API requests
- View user analytics
- Monitor storage usage

### Application Analytics
- Set up Google Analytics
- Monitor user engagement
- Track feature usage
- Monitor performance

## 🎉 Success Indicators

Your app is successfully deployed when:
- ✅ App loads without errors
- ✅ Users can create accounts
- ✅ All features work correctly
- ✅ Database operations succeed
- ✅ AI features function properly
- ✅ Mobile experience is good
- ✅ Performance is acceptable

---

**🎓 Your Study Companion app is now ready for production deployment with full frontend, backend, and database functionality!**
