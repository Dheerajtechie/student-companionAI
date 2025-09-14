export type StudySessionStatus = 'active' | 'completed' | 'paused' | 'cancelled'

export interface StudySession {
  id: string
  user_id: string
  subject_id: string
  title: string
  description?: string
  duration_minutes: number
  focus_rating?: number
  notes?: string
  status: StudySessionStatus
  started_at: string
  ended_at?: string
  created_at: string
  updated_at: string
}

export interface CreateStudySessionData {
  subject_id: string
  title: string
  description?: string
  duration_minutes: number
  focus_rating?: number
  notes?: string
}

export interface UpdateStudySessionData {
  title?: string
  description?: string
  duration_minutes?: number
  focus_rating?: number
  notes?: string
  status?: StudySessionStatus
  ended_at?: string
}

export interface StudyTimer {
  isRunning: boolean
  isPaused: boolean
  timeRemaining: number
  sessionType: 'study' | 'short_break' | 'long_break'
  currentSession: StudySession | null
  completedSessions: number
  totalStudyTime: number
}

export interface PomodoroSettings {
  study_duration: number // in minutes
  short_break_duration: number // in minutes
  long_break_duration: number // in minutes
  sessions_until_long_break: number
  auto_start_breaks: boolean
  auto_start_sessions: boolean
  sound_enabled: boolean
}

export interface StudySessionStats {
  total_sessions: number
  total_study_time: number
  average_session_duration: number
  average_focus_rating: number
  sessions_today: number
  study_time_today: number
  longest_streak: number
  current_streak: number
}

export interface StudyPlan {
  id: string
  user_id: string
  subject_id: string
  title: string
  description?: string
  plan_data: StudyPlanData
  is_ai_generated: boolean
  ai_provider?: string
  start_date: string
  end_date?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StudyPlanData {
  topics: StudyTopic[]
  schedule: StudySchedule
  milestones: StudyMilestone[]
  estimated_duration: number
  difficulty_progression: string[]
}

export interface StudyTopic {
  id: string
  name: string
  description: string
  estimated_hours: number
  prerequisites: string[]
  resources: StudyResource[]
}

export interface StudyResource {
  type: 'video' | 'article' | 'book' | 'practice' | 'other'
  title: string
  url?: string
  description?: string
}

export interface StudySchedule {
  daily_hours: number
  weekly_schedule: {
    [key: string]: string[] // day of week -> topics
  }
  review_sessions: {
    frequency: 'daily' | 'weekly' | 'biweekly'
    topics: string[]
  }
}

export interface StudyMilestone {
  id: string
  name: string
  description: string
  target_date: string
  topics: string[]
  is_completed: boolean
}