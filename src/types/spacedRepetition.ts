export interface SpacedRepetitionCard {
  id: string
  user_id: string
  question_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_date: string
  last_reviewed_at?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ReviewResult {
  card_id: string
  question_id: string
  quality: number // 0-5 scale
  response_time: number // in seconds
  is_correct: boolean
}

export interface CreateSpacedRepetitionCardData {
  question_id: string
}

export interface UpdateSpacedRepetitionCardData {
  ease_factor?: number
  interval_days?: number
  repetitions?: number
  next_review_date?: string
  last_reviewed_at?: string
  is_active?: boolean
}

export interface SpacedRepetitionStats {
  total_cards: number
  active_cards: number
  cards_due_today: number
  cards_overdue: number
  average_ease_factor: number
  retention_rate: number
  cards_reviewed_today: number
  streak_days: number
}

export interface ReviewSession {
  id: string
  user_id: string
  subject_id?: string
  cards_reviewed: number
  correct_answers: number
  total_time: number
  started_at: string
  ended_at: string
}

export interface SM2Algorithm {
  ease_factor: number
  interval: number
  repetitions: number
}

export interface ReviewQuality {
  value: number // 0-5
  label: string
  description: string
  color: string
}

export const REVIEW_QUALITIES: ReviewQuality[] = [
  {
    value: 0,
    label: 'Blackout',
    description: 'Complete failure to recall',
    color: 'bg-red-500'
  },
  {
    value: 1,
    label: 'Incorrect',
    description: 'Incorrect response; correct one remembered',
    color: 'bg-orange-500'
  },
  {
    value: 2,
    label: 'Incorrect',
    description: 'Incorrect response; where the correct one seemed easy to recall',
    color: 'bg-yellow-500'
  },
  {
    value: 3,
    label: 'Correct',
    description: 'Correct response after a hesitation',
    color: 'bg-blue-500'
  },
  {
    value: 4,
    label: 'Correct',
    description: 'Correct response after a short delay',
    color: 'bg-green-500'
  },
  {
    value: 5,
    label: 'Perfect',
    description: 'Perfect response',
    color: 'bg-emerald-500'
  }
]
