export interface StudyAnalytics {
  total_study_time: number
  total_sessions: number
  average_session_duration: number
  study_streak: number
  longest_streak: number
  study_time_today: number
  study_time_this_week: number
  study_time_this_month: number
  most_productive_day: string
  most_productive_hour: number
  focus_rating_average: number
}

export interface SubjectAnalytics {
  subject_id: string
  subject_name: string
  total_study_time: number
  sessions_count: number
  average_session_duration: number
  progress_percentage: number
  last_studied: string | null
  difficulty_level: string
  focus_rating_average: number
}

export interface QuestionAnalytics {
  total_questions: number
  questions_answered: number
  accuracy_rate: number
  average_response_time: number
  questions_by_difficulty: Record<string, number>
  questions_by_type: Record<string, number>
  improvement_trend: number
  weak_areas: string[]
  strong_areas: string[]
}

export interface SpacedRepetitionAnalytics {
  total_cards: number
  active_cards: number
  cards_reviewed_today: number
  retention_rate: number
  average_ease_factor: number
  review_streak: number
  cards_due_today: number
  overdue_cards: number
}

export interface GoalAnalytics {
  total_goals: number
  active_goals: number
  completed_goals: number
  completion_rate: number
  average_progress: number
  goals_on_track: number
  goals_behind: number
  overdue_goals: number
}

export interface TimeSeriesData {
  date: string
  value: number
  label?: string
}

export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

export interface PerformanceMetrics {
  study_efficiency: number
  consistency_score: number
  improvement_rate: number
  focus_quality: number
  overall_score: number
}

export interface ExportOptions {
  format: 'pdf' | 'csv' | 'json'
  date_range: {
    start: string
    end: string
  }
  include_charts: boolean
  include_details: boolean
  sections: ('study' | 'questions' | 'goals' | 'spaced_repetition')[]
}

export interface AnalyticsFilters {
  date_range?: {
    start: string
    end: string
  }
  subject_ids?: string[]
  goal_types?: string[]
  difficulty_levels?: string[]
  question_types?: string[]
}

export interface DashboardWidget {
  id: string
  type: 'chart' | 'metric' | 'list' | 'progress'
  title: string
  size: 'small' | 'medium' | 'large'
  position: { x: number; y: number }
  config: Record<string, any>
  is_visible: boolean
}