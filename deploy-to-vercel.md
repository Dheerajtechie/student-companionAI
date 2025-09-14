# ⚡ Quick Vercel Deployment

## 🚀 **One-Click Deployment**

### **Option 1: Deploy with Vercel Button**
Click the button below to deploy instantly:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/Dheerajtechie/student-companionAI)

### **Option 2: Manual Deployment**
1. Go to [vercel.com/new](https://vercel.com/new)
2. Import from GitHub: `Dheerajtechie/student-companionAI`
3. Add environment variables (see below)
4. Click Deploy

---

## 🔑 **Required Environment Variables**

Add these in Vercel dashboard under **Environment Variables**:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

**Optional but recommended:**
```env
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_gemini_api_key
```

---

## 📋 **Quick Setup Checklist**

- [ ] Vercel account created
- [ ] GitHub repository connected
- [ ] Environment variables added
- [ ] Supabase project created
- [ ] Database schema applied
- [ ] API keys obtained
- [ ] App deployed successfully
- [ ] Live URL tested

---

## 🎯 **Get Your Keys**

### **Supabase (Required)**
1. [Create Supabase Project](https://supabase.com)
2. Copy Project URL and anon key
3. Run `database-schema.sql` in SQL Editor

### **OpenAI (Required)**
1. [Get OpenAI API Key](https://platform.openai.com/api-keys)
2. Create new secret key
3. Add to environment variables

### **Groq (Optional)**
1. [Get Groq API Key](https://console.groq.com/keys)
2. Create new API key
3. Add to environment variables

---

## 🎉 **You're Done!**

Your Study Companion AI will be live at:
`https://your-app-name.vercel.app`

**Total deployment time: 5-10 minutes** ⚡
