# Study Companion - AI-Powered Learning Platform

A comprehensive, production-ready SaaS application that enhances learning through AI-powered study tools, spaced repetition, and personalized analytics.

## 🚀 Features

### Core Functionality
- **AI-Powered Question Generation** - Generate questions using OpenAI, Groq, or Google Gemini
- **Spaced Repetition System** - SM-2 algorithm for optimal learning retention
- **Pomodoro Study Timer** - Focused study sessions with break management
- **Subject Management** - Organize and track multiple study subjects
- **Goal Setting & Tracking** - SMART goals with progress monitoring
- **Analytics Dashboard** - Comprehensive study insights and performance metrics

### Technical Features
- **Multi-Provider AI Support** - Fallback system across OpenAI, Groq, and Gemini
- **Real-time Authentication** - Supabase Auth with session persistence
- **Responsive Design** - Mobile-first approach with dark/light themes
- **PWA Support** - Installable app with offline capabilities
- **Type Safety** - Full TypeScript implementation
- **State Management** - Zustand for efficient state handling

## 🛠 Tech Stack

### Frontend
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - Lightweight state management
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **Lucide React** - Beautiful icons
- **Framer Motion** - Smooth animations
- **Recharts** - Data visualization

### Backend & Services
- **Supabase** - Backend-as-a-Service (Auth, Database, Storage)
- **PostgreSQL** - Relational database with RLS
- **OpenAI GPT-4** - AI question generation
- **Groq** - Fast AI inference
- **Google Gemini** - Alternative AI provider

### Development & Deployment
- **ESLint & Prettier** - Code quality and formatting
- **Vitest** - Unit testing
- **Netlify** - Hosting and deployment
- **PWA** - Progressive Web App features

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account
- OpenAI API key
- Groq API key (optional)
- Google Gemini API key (optional)

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone <repository-url>
cd study-companion
npm install
```

### 2. Environment Setup

Copy the example environment file and add your API keys:

```bash
cp env.example .env.local
```

Edit `.env.local` with your credentials:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI API Keys
OPENAI_API_KEY=your_openai_api_key
GROQ_API_KEY=your_groq_api_key
GEMINI_API_KEY=your_google_gemini_key
```

### 3. Database Setup

1. Create a new Supabase project
2. Go to the SQL Editor in your Supabase dashboard
3. Copy and paste the contents of `database-schema.sql`
4. Execute the SQL to create all tables, policies, and functions

### 4. Start Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## 📁 Project Structure

```
study-companion/
├── public/                 # Static assets
├── src/
│   ├── components/         # Reusable UI components
│   │   ├── auth/          # Authentication components
│   │   ├── common/        # Shared components
│   │   ├── dashboard/     # Dashboard layout
│   │   ├── subjects/      # Subject management
│   │   ├── study/         # Study session components
│   │   ├── questions/     # Question components
│   │   ├── analytics/     # Analytics components
│   │   ├── spaced-repetition/ # Spaced repetition
│   │   ├── goals/         # Goal management
│   │   └── common/        # Common components
│   ├── pages/             # Page components
│   ├── hooks/             # Custom React hooks
│   ├── services/          # API and external services
│   ├── stores/            # Zustand state stores
│   ├── types/             # TypeScript type definitions
│   ├── utils/             # Utility functions
│   ├── App.tsx            # Main app component
│   └── main.tsx           # App entry point
├── database-schema.sql    # Database schema
├── netlify.toml          # Netlify configuration
└── package.json          # Dependencies and scripts
```

## 🎯 Key Features Implementation

### AI Question Generation
- Multi-provider support with automatic fallback
- Question types: Multiple choice, short answer, essay, true/false
- Difficulty levels and topic-based generation
- Bulk generation with explanations

### Spaced Repetition
- SM-2 algorithm implementation
- Card scheduling and review management
- Confidence-based interval adjustment
- Progress tracking and analytics

### Study Sessions
- Pomodoro timer with customizable durations
- Session tracking and focus rating
- Break reminders and auto-start options
- Study streak calculation

### Analytics
- Study time tracking and trends
- Performance metrics and insights
- Goal progress visualization
- Export functionality (PDF/CSV)

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage
```

## 🚀 Deployment

### Netlify (Recommended)

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

### Manual Deployment

```bash
npm run build
# Upload dist/ folder to your hosting provider
```

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_SUPABASE_URL` | Supabase project URL | Yes |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `GROQ_API_KEY` | Groq API key | No |
| `GEMINI_API_KEY` | Google Gemini API key | No |

## 📊 Database Schema

The application uses PostgreSQL with the following main tables:

- **profiles** - User profile information
- **subjects** - Study subjects and progress
- **study_sessions** - Study session tracking
- **questions** - Generated and custom questions
- **question_attempts** - Question answer tracking
- **spaced_repetition_cards** - Flashcard system
- **goals** - User goals and progress
- **study_plans** - AI-generated study plans
- **notifications** - User notifications

## 🎨 Customization

### Themes
- Light/Dark mode support
- Custom color schemes
- Responsive design system

### AI Providers
- Easy to add new AI providers
- Configurable fallback system
- Rate limiting and cost optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation
- Review the database schema

## 🎉 Acknowledgments

- Supabase for the backend infrastructure
- OpenAI, Groq, and Google for AI services
- The React and TypeScript communities
- All open-source contributors

---

**Built with ❤️ for learners everywhere**