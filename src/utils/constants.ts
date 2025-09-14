/**
 * Application constants
 */

export const APP_CONFIG = {
  name: 'Study Companion',
  version: '1.0.0',
  description: 'AI-powered study companion for optimized learning',
} as const;

export const DIFFICULTY_LEVELS = [
  { value: 1, label: 'Very Easy', color: '#22c55e' },
  { value: 2, label: 'Easy', color: '#84cc16' },
  { value: 3, label: 'Medium', color: '#eab308' },
  { value: 4, label: 'Hard', color: '#f97316' },
  { value: 5, label: 'Very Hard', color: '#ef4444' },
] as const;

export const PRIORITY_LEVELS = [
  { value: 'high', label: 'High', color: '#ef4444', icon: '🔴' },
  { value: 'medium', label: 'Medium', color: '#f59e0b', icon: '🟡' },
  { value: 'low', label: 'Low', color: '#22c55e', icon: '🟢' },
] as const;

export const QUESTION_TYPES = [
  { value: 'mcq', label: 'Multiple Choice', icon: '📝' },
  { value: 'short_answer', label: 'Short Answer', icon: '✏️' },
  { value: 'essay', label: 'Essay', icon: '📄' },
] as const;

export const DIFFICULTY_OPTIONS = [
  { value: 'beginner', label: 'Beginner', color: '#22c55e' },
  { value: 'intermediate', label: 'Intermediate', color: '#f59e0b' },
  { value: 'advanced', label: 'Advanced', color: '#ef4444' },
] as const;

export const SESSION_TYPES = [
  { value: 'study', label: 'Study', icon: '📚', color: '#3b82f6' },
  { value: 'review', label: 'Review', icon: '🔄', color: '#8b5cf6' },
  { value: 'practice', label: 'Practice', icon: '💪', color: '#10b981' },
] as const;

export const SUBJECT_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#14b8a6', // Teal
  '#a855f7', // Violet
] as const;

export const FOCUS_RATINGS = [
  { value: 1, label: 'Very Low', color: '#ef4444', description: 'Distracted most of the time' },
  { value: 2, label: 'Low', color: '#f97316', description: 'Somewhat distracted' },
  { value: 3, label: 'Medium', color: '#f59e0b', description: 'Moderately focused' },
  { value: 4, label: 'High', color: '#22c55e', description: 'Mostly focused' },
  { value: 5, label: 'Very High', color: '#16a34a', description: 'Completely focused' },
] as const;

export const CONFIDENCE_LEVELS = [
  { value: 1, label: 'Very Low', color: '#ef4444', description: 'Guessed' },
  { value: 2, label: 'Low', color: '#f97316', description: 'Not sure' },
  { value: 3, label: 'Medium', color: '#f59e0b', description: 'Somewhat confident' },
  { value: 4, label: 'High', color: '#22c55e', description: 'Confident' },
  { value: 5, label: 'Very High', color: '#16a34a', description: 'Very confident' },
] as const;

export const GOAL_UNITS = [
  { value: 'hours', label: 'Hours', icon: '⏰' },
  { value: 'questions', label: 'Questions', icon: '❓' },
  { value: 'sessions', label: 'Sessions', icon: '📚' },
] as const;

export const POMODORO_DEFAULTS = {
  work_duration: 25, // minutes
  short_break: 5, // minutes
  long_break: 15, // minutes
  sessions_before_long_break: 4,
} as const;

export const STUDY_REMINDERS = {
  morning: { time: '09:00', message: 'Good morning! Ready to start studying?' },
  afternoon: { time: '14:00', message: 'Afternoon study session time!' },
  evening: { time: '19:00', message: 'Evening review session?' },
} as const;

export const BREAK_REMINDERS = {
  short: { duration: 5, message: 'Take a 5-minute break!' },
  long: { duration: 15, message: 'Time for a longer break!' },
  meal: { duration: 30, message: 'Take a meal break!' },
} as const;

export const ACHIEVEMENTS = {
  first_session: {
    title: 'First Steps',
    description: 'Completed your first study session',
    icon: '🎯',
    category: 'milestone',
  },
  week_streak: {
    title: 'Week Warrior',
    description: 'Studied for 7 days in a row',
    icon: '🔥',
    category: 'streak',
  },
  month_streak: {
    title: 'Monthly Master',
    description: 'Studied for 30 days in a row',
    icon: '👑',
    category: 'streak',
  },
  question_master: {
    title: 'Question Master',
    description: 'Answered 100 questions correctly',
    icon: '🧠',
    category: 'questions',
  },
  speed_demon: {
    title: 'Speed Demon',
    description: 'Answered 10 questions in under 5 minutes',
    icon: '⚡',
    category: 'performance',
  },
  perfectionist: {
    title: 'Perfectionist',
    description: 'Got 100% accuracy in a study session',
    icon: '💯',
    category: 'accuracy',
  },
} as const;

export const CHART_COLORS = [
  '#3b82f6', // Blue
  '#ef4444', // Red
  '#10b981', // Green
  '#f59e0b', // Yellow
  '#8b5cf6', // Purple
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#84cc16', // Lime
  '#f97316', // Orange
  '#6366f1', // Indigo
] as const;

export const API_LIMITS = {
  openai: {
    monthly_requests: 100,
    daily_requests: 10,
  },
  groq: {
    monthly_requests: 1000,
    daily_requests: 100,
  },
} as const;

export const STORAGE_KEYS = {
  auth: 'auth-storage',
  settings: 'settings-storage',
  subjects: 'subjects-storage',
  study_sessions: 'study-sessions-storage',
  questions: 'questions-storage',
} as const;

export const ROUTES = {
  home: '/',
  dashboard: '/dashboard',
  subjects: '/subjects',
  study: '/study',
  questions: '/questions',
  analytics: '/analytics',
  profile: '/profile',
  settings: '/settings',
  login: '/login',
  register: '/register',
  forgot_password: '/forgot-password',
  reset_password: '/reset-password',
} as const;

export const VALIDATION_RULES = {
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Please enter a valid email address',
  },
  password: {
    required: true,
    minLength: 8,
    message: 'Password must be at least 8 characters long',
  },
  name: {
    required: true,
    minLength: 2,
    message: 'Name must be at least 2 characters long',
  },
  subject_name: {
    required: true,
    minLength: 1,
    maxLength: 100,
    message: 'Subject name must be between 1 and 100 characters',
  },
} as const;
