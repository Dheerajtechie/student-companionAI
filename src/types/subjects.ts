export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced'

export interface Subject {
  id: string
  user_id: string
  name: string
  description?: string
  color: string
  icon: string
  difficulty: DifficultyLevel
  target_hours: number
  completed_hours: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface CreateSubjectData {
  name: string
  description?: string
  color?: string
  icon?: string
  difficulty?: DifficultyLevel
  target_hours?: number
}

export interface UpdateSubjectData {
  name?: string
  description?: string
  color?: string
  icon?: string
  difficulty?: DifficultyLevel
  target_hours?: number
  is_active?: boolean
}

export interface SubjectStats {
  total_subjects: number
  active_subjects: number
  total_study_hours: number
  average_difficulty: number
  completion_rate: number
}

export interface SubjectProgress {
  subject_id: string
  subject_name: string
  target_hours: number
  completed_hours: number
  progress_percentage: number
  sessions_count: number
  last_studied: string | null
}