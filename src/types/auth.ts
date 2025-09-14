export interface User {
  id: string
  email: string
  full_name?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  user_id: string
  email: string
  full_name?: string
  avatar_url?: string
  timezone: string
  study_preferences: StudyPreferences
  created_at: string
  updated_at: string
}

export interface StudyPreferences {
  daily_goal_hours?: number
  preferred_study_times?: string[]
  break_reminder_minutes?: number
  focus_mode_enabled?: boolean
  dark_mode_enabled?: boolean
  notifications_enabled?: boolean
  pomodoro_duration?: number
  short_break_duration?: number
  long_break_duration?: number
}

export interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterCredentials {
  email: string
  password: string
  full_name: string
}

export interface PasswordResetRequest {
  email: string
}

export interface PasswordResetConfirm {
  access_token: string
  refresh_token: string
  password: string
}