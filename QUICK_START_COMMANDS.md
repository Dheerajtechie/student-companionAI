# Quick Start Commands - Study Companion

## 🚀 Run These Commands to Get Started

### 1. Navigate to Project Directory
```bash
cd "D:\projects practical application\Product amangement projects\study-companion"
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment (Automatic)
```bash
npm run setup
```

### 4. Configure Environment Variables
Edit `.env.local` with your actual API keys:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# AI API Keys
OPENAI_API_KEY=sk-proj-your_openai_api_key_here
GROQ_API_KEY=gsk_your_groq_api_key_here
GEMINI_API_KEY=your_google_gemini_key_here
```

### 5. Set Up Supabase Database
1. Go to [supabase.com](https://supabase.com) and create a new project
2. Copy your Project URL and anon key to `.env.local`
3. Go to SQL Editor in Supabase dashboard
4. Copy and paste the entire contents of `database-schema.sql`
5. Click "Run" to execute

### 6. Start the Application
```bash
npm run dev
```

### 7. Open in Browser
Visit: `http://localhost:5173`

## 🎯 What You'll See

1. **Login/Register Page** - Create your account
2. **Dashboard** - Overview of your study progress
3. **Subjects** - Manage your study subjects
4. **Study** - Pomodoro timer for focused study sessions
5. **Questions** - AI-generated questions for practice
6. **Analytics** - Study insights and performance metrics
7. **Spaced Repetition** - Flashcard review system
8. **Goals** - Set and track your study goals

## 🔧 Troubleshooting Commands

### If you get dependency errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### If you get build errors:
```bash
npm run build
```

### If you get linting errors:
```bash
npm run lint
```

### Check if everything is working:
```bash
npm run test
```

## 📱 Mobile Testing

The app is fully responsive. Test on mobile by:
1. Opening `http://localhost:5173` on your phone
2. Or use browser dev tools to simulate mobile devices

## 🚀 Production Deployment

### Deploy to Netlify:
1. Push your code to GitHub
2. Connect GitHub repo to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy automatically

### Build for production:
```bash
npm run build
```

## ✅ Success Checklist

- [ ] App loads at `http://localhost:5173`
- [ ] Can create account and log in
- [ ] Can create subjects
- [ ] Pomodoro timer works
- [ ] AI question generation works
- [ ] Analytics show data
- [ ] Goals can be created
- [ ] Dark/light theme toggle works
- [ ] Mobile responsive design works

## 🆘 Need Help?

1. Check `COMPLETE_SETUP_GUIDE.md` for detailed instructions
2. Check browser console for errors
3. Verify all environment variables are set
4. Ensure database schema was applied successfully

---

**🎉 Your Study Companion app is now running with full frontend, backend, and database functionality!**
