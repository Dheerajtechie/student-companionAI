export type QuestionType = 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
import type { DifficultyLevel } from './subjects'

export interface Question {
  id: string
  user_id: string
  subject_id: string
  question_text: string
  question_type: QuestionType
  options?: string[] // For multiple choice questions
  correct_answer: string
  explanation?: string
  difficulty: DifficultyLevel
  tags: string[]
  is_ai_generated: boolean
  ai_provider?: string
  created_at: string
  updated_at: string
}

export interface QuestionAttempt {
  id: string
  user_id: string
  question_id: string
  user_answer: string
  is_correct: boolean
  time_spent_seconds: number
  confidence_level?: number
  created_at: string
}

export interface CreateQuestionData {
  subject_id: string
  question_text: string
  question_type: QuestionType
  options?: string[]
  correct_answer: string
  explanation?: string
  difficulty?: DifficultyLevel
  tags?: string[]
}

export interface GenerateQuestionsRequest {
  subject_id: string
  topic?: string
  question_type: QuestionType
  difficulty: DifficultyLevel
  count: number
  include_explanations?: boolean
}

export interface GeneratedQuestion {
  question_text: string
  question_type: QuestionType
  options?: string[]
  correct_answer: string
  explanation?: string
  difficulty: DifficultyLevel
  tags?: string[]
}

export interface QuestionFilters {
  subject_id?: string
  question_type?: QuestionType
  difficulty?: DifficultyLevel
  tags?: string[]
  is_ai_generated?: boolean
  search?: string
}

export interface QuestionStats {
  total_questions: number
  questions_by_type: Record<QuestionType, number>
  questions_by_difficulty: Record<DifficultyLevel, number>
  accuracy_rate: number
  average_time_per_question: number
}