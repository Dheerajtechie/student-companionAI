# Quick Start Guide

Get Study Companion running in 5 minutes! 🚀

## ⚡ Super Quick Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Set Up Environment
Copy `env.example` to `.env.local` and add your keys:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
```

### 3. Set Up Database
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Open SQL Editor
3. Copy contents of `database-schema.sql`
4. Paste and run the SQL

### 4. Start the App
```bash
npm run dev
```

Visit `http://localhost:5173` and create your account! 🎉

## 🎯 What You Get

- ✅ **Complete Authentication System**
- ✅ **AI-Powered Question Generation**
- ✅ **Pomodoro Study Timer**
- ✅ **Subject Management**
- ✅ **Goal Tracking**
- ✅ **Analytics Dashboard**
- ✅ **Spaced Repetition System**
- ✅ **Responsive Design**
- ✅ **Dark/Light Themes**

## 🚀 Ready to Deploy?

1. **Build the app**: `npm run build`
2. **Deploy to Netlify**: Connect your GitHub repo
3. **Add environment variables** in Netlify dashboard
4. **Deploy!** Your app is live! 🌟

## 📚 Need More Details?

- **Full Setup Guide**: See `SETUP.md`
- **Complete Documentation**: See `README.md`
- **Database Schema**: See `database-schema.sql`

---

**That's it!** You now have a production-ready AI-powered study companion! 🎓