import { supabase } from './supabase'
import type { 
  SpacedRepetitionCard, 
  CreateSpacedRepetitionCardData, 
  UpdateSpacedRepetitionCardData,
  ReviewResult,
  SpacedRepetitionStats
} from '../types/spacedRepetition'
import type { Database } from '../types/database'

type SpacedRepetitionCardRow = Database['public']['Tables']['spaced_repetition_cards']['Row']
type SpacedRepetitionCardInsert = Database['public']['Tables']['spaced_repetition_cards']['Insert']
type SpacedRepetitionCardUpdate = Database['public']['Tables']['spaced_repetition_cards']['Update']
type QuestionAttemptRow = Database['public']['Tables']['question_attempts']['Row']
type QuestionAttemptInsert = Database['public']['Tables']['question_attempts']['Insert']

export class SpacedRepetitionService {
  // SM-2 Algorithm constants
  private static readonly INITIAL_EASE_FACTOR = 2.5
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly INITIAL_INTERVAL = 1
  private static readonly SECOND_INTERVAL = 6

  // Get all spaced repetition cards for a user
  static async getSpacedRepetitionCards(userId: string): Promise<SpacedRepetitionCard[]> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .eq('user_id', userId)
      .order('next_review_date', { ascending: true })

    if (error) {
      console.error('Error fetching spaced repetition cards:', error)
      throw new Error('Failed to fetch spaced repetition cards')
    }

    return data as SpacedRepetitionCard[]
  }

  // Get a single spaced repetition card by ID
  static async getSpacedRepetitionCard(id: string): Promise<SpacedRepetitionCard | null> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching spaced repetition card:', error)
      return null
    }

    return data as SpacedRepetitionCard
  }

  // Create a new spaced repetition card
  static async createSpacedRepetitionCard(userId: string, questionId: string): Promise<SpacedRepetitionCard> {
    const insertData: SpacedRepetitionCardInsert = {
      user_id: userId,
      question_id: questionId,
      ease_factor: this.INITIAL_EASE_FACTOR,
      interval_days: this.INITIAL_INTERVAL,
      repetitions: 0,
      next_review_date: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert(insertData)
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error creating spaced repetition card:', error)
      throw new Error('Failed to create spaced repetition card')
    }

    return data as SpacedRepetitionCard
  }

  // Update a spaced repetition card
  static async updateSpacedRepetitionCard(id: string, updates: UpdateSpacedRepetitionCardData): Promise<SpacedRepetitionCard> {
    const updateData: SpacedRepetitionCardUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .single()

    if (error) {
      console.error('Error updating spaced repetition card:', error)
      throw new Error('Failed to update spaced repetition card')
    }

    return data as SpacedRepetitionCard
  }

  // Delete a spaced repetition card
  static async deleteSpacedRepetitionCard(id: string): Promise<void> {
    const { error } = await supabase
      .from('spaced_repetition_cards')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting spaced repetition card:', error)
      throw new Error('Failed to delete spaced repetition card')
    }
  }

  // Review a card with SM-2 algorithm
  static async reviewCard(cardId: string, quality: number): Promise<ReviewResult> {
    const currentCard = await this.getSpacedRepetitionCard(cardId)
    if (!currentCard) {
      throw new Error('Card not found')
    }

    const sm2Result = this.calculateSM2(
      currentCard.ease_factor,
      currentCard.interval_days,
      currentCard.repetitions,
      quality
    )

    // Update the card
    const updatedCard = await this.updateSpacedRepetitionCard(cardId, {
      ease_factor: sm2Result.ease_factor,
      interval_days: sm2Result.interval_days,
      repetitions: sm2Result.repetitions,
      next_review_date: sm2Result.next_review_date,
      last_reviewed_at: new Date().toISOString()
    })

    // Record the attempt
    const attemptData: QuestionAttemptInsert = {
      user_id: currentCard.user_id,
      question_id: currentCard.question_id,
      user_answer: quality.toString(),
      is_correct: quality >= 3,
      time_spent_seconds: 0,
      confidence_level: quality
    }

    await supabase
      .from('question_attempts')
      .insert(attemptData)

    return {
      card: updatedCard,
      next_review_date: sm2Result.next_review_date,
      interval_days: sm2Result.interval_days,
      ease_factor: sm2Result.ease_factor
    }
  }

  // SM-2 Algorithm implementation
  private static calculateSM2(
    easeFactor: number,
    interval: number,
    repetitions: number,
    quality: number
  ): {
    ease_factor: number
    interval_days: number
    repetitions: number
    next_review_date: string
  } {
    let newEaseFactor = easeFactor
    let newInterval = interval
    let newRepetitions = repetitions

    if (quality >= 3) {
      if (repetitions === 0) {
        newInterval = 1
      } else if (repetitions === 1) {
        newInterval = 6
      } else {
        newInterval = Math.round(interval * easeFactor)
      }
      newRepetitions = repetitions + 1
    } else {
      newRepetitions = 0
      newInterval = 1
    }

    newEaseFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    newEaseFactor = Math.max(newEaseFactor, this.MIN_EASE_FACTOR)

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    return {
      ease_factor: newEaseFactor,
      interval_days: newInterval,
      repetitions: newRepetitions,
      next_review_date: nextReviewDate.toISOString()
    }
  }

  // Get cards due for review
  static async getCardsDueForReview(userId: string): Promise<SpacedRepetitionCard[]> {
    const now = new Date().toISOString()
    
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_review_date', now)
      .order('next_review_date', { ascending: true })

    if (error) {
      console.error('Error fetching cards due for review:', error)
      return []
    }

    return data as SpacedRepetitionCard[]
  }

  // Get spaced repetition statistics
  static async getSpacedRepetitionStats(userId: string): Promise<SpacedRepetitionStats> {
    const [cards, attempts] = await Promise.all([
      this.getSpacedRepetitionCards(userId),
      this.getAttempts(userId)
    ])

    const totalCards = cards?.length || 0
    const activeCards = cards?.filter(c => c.is_active).length || 0
    const now = new Date()
    
    const cardsDueToday = cards?.filter(c => 
      c.is_active && new Date(c.next_review_date) <= now
    ).length || 0

    const overdueCards = cards?.filter(c => 
      c.is_active && new Date(c.next_review_date) < now
    ).length || 0

    const averageEaseFactor = activeCards > 0
      ? cards?.filter(c => c.is_active).reduce((sum, c) => sum + c.ease_factor, 0) / activeCards
      : 0

    // Calculate recent performance (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAttempts = attempts?.filter(a => 
      new Date(a.created_at) >= thirtyDaysAgo
    ) || []

    const recentAccuracy = recentAttempts.length > 0
      ? (recentAttempts.filter(a => a.is_correct).length / recentAttempts.length) * 100
      : 0

    // Calculate review streak
    const sortedAttempts = attempts?.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    ) || []

    let reviewStreak = 0
    let currentDate = new Date()
    
    for (const attempt of sortedAttempts) {
      const attemptDate = new Date(attempt.created_at)
      const daysDiff = Math.floor((currentDate.getTime() - attemptDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff <= 1) {
        reviewStreak++
        currentDate = attemptDate
      } else {
        break
      }
    }

    // Calculate daily review count
    const today = new Date().toISOString().split('T')[0]
    const reviewsToday = attempts?.filter(a => 
      a.created_at.startsWith(today)
    ).length || 0

    return {
      total_cards: totalCards,
      active_cards: activeCards,
      cards_due_today: cardsDueToday,
      overdue_cards: overdueCards,
      average_ease_factor: Math.round(averageEaseFactor * 100) / 100,
      recent_accuracy: Math.round(recentAccuracy),
      review_streak: reviewStreak,
      reviews_today: reviewsToday
    }
  }

  // Get attempts for a user
  private static async getAttempts(userId: string): Promise<QuestionAttemptRow[]> {
    const { data, error } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching attempts:', error)
      return []
    }

    return data as QuestionAttemptRow[]
  }

  // Bulk create cards from questions
  static async createCardsFromQuestions(userId: string, questionIds: string[]): Promise<SpacedRepetitionCard[]> {
    const cards = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      ease_factor: this.INITIAL_EASE_FACTOR,
      interval_days: this.INITIAL_INTERVAL,
      repetitions: 0,
      next_review_date: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert(cards)
      .select(`
        *,
        questions (
          id,
          question_text,
          question_type,
          options,
          correct_answer,
          explanation,
          difficulty,
          tags,
          subjects (
            id,
            name,
            color,
            icon
          )
        )
      `)

    if (error) {
      console.error('Error creating cards from questions:', error)
      throw new Error('Failed to create cards from questions')
    }

    return data as SpacedRepetitionCard[]
  }

  // Reset card progress
  static async resetCard(cardId: string): Promise<SpacedRepetitionCard> {
    return this.updateSpacedRepetitionCard(cardId, {
      ease_factor: this.INITIAL_EASE_FACTOR,
      interval_days: this.INITIAL_INTERVAL,
      repetitions: 0,
      next_review_date: new Date().toISOString(),
      last_reviewed_at: null
    })
  }

  // Suspend a card
  static async suspendCard(cardId: string): Promise<SpacedRepetitionCard> {
    return this.updateSpacedRepetitionCard(cardId, {
      is_active: false
    })
  }

  // Activate a card
  static async activateCard(cardId: string): Promise<SpacedRepetitionCard> {
    return this.updateSpacedRepetitionCard(cardId, {
      is_active: true
    })
  }
}