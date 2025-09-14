export type GoalType = 'study_time' | 'questions_solved' | 'subjects_mastered' | 'exam_score' | 'custom'
export type GoalStatus = 'active' | 'completed' | 'paused' | 'cancelled'
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent'

export interface Goal {
  id: string
  user_id: string
  subject_id?: string
  title: string
  description?: string
  goal_type: GoalType
  target_value: number
  current_value: number
  unit: string
  deadline?: string
  priority: PriorityLevel
  status: GoalStatus
  is_smart_goal: boolean
  smart_criteria: SmartGoalCriteria
  created_at: string
  updated_at: string
}

export interface SmartGoalCriteria {
  specific?: string
  measurable?: string
  achievable?: string
  relevant?: string
  time_bound?: string
}

export interface CreateGoalData {
  subject_id?: string
  title: string
  description?: string
  goal_type: GoalType
  target_value: number
  unit: string
  deadline?: string
  priority?: PriorityLevel
  is_smart_goal?: boolean
  smart_criteria?: SmartGoalCriteria
}

export interface UpdateGoalData {
  title?: string
  description?: string
  target_value?: number
  current_value?: number
  unit?: string
  deadline?: string
  priority?: PriorityLevel
  status?: GoalStatus
  smart_criteria?: SmartGoalCriteria
}

export interface GoalProgress {
  goal_id: string
  goal_title: string
  target_value: number
  current_value: number
  progress_percentage: number
  days_remaining?: number
  is_on_track: boolean
  estimated_completion_date?: string
}

export interface GoalStats {
  total_goals: number
  active_goals: number
  completed_goals: number
  overdue_goals: number
  completion_rate: number
  average_progress: number
  goals_by_type: Record<GoalType, number>
  goals_by_priority: Record<PriorityLevel, number>
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  category: 'study' | 'goal' | 'streak' | 'milestone'
  unlocked_at: string
  progress?: number
  max_progress?: number
}

export interface GoalTemplate {
  id: string
  title: string
  description: string
  goal_type: GoalType
  target_value: number
  unit: string
  suggested_deadline_days: number
  category: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

export interface GoalFilters {
  status?: GoalStatus
  goal_type?: GoalType
  priority?: PriorityLevel
  subject_id?: string
  date_range?: {
    start: string
    end: string
  }
}