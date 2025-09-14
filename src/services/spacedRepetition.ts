import { supabase } from './supabase'
import type { 
  SpacedRepetitionCard, 
  CreateSpacedRepetitionCardData, 
  UpdateSpacedRepetitionCardData,
  SpacedRepetitionStats,
  ReviewResult
} from '../types/spacedRepetition'

const INITIAL_EASE_FACTOR = 2.5
const INITIAL_INTERVAL = 1
const MINIMUM_EASE_FACTOR = 1.3
const MAXIMUM_EASE_FACTOR = 5.0

export class SpacedRepetitionService {
  // Create a new spaced repetition card
  static async createCard(userId: string, cardData: CreateSpacedRepetitionCardData): Promise<SpacedRepetitionCard> {
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + INITIAL_INTERVAL)

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert({
        user_id: userId,
        question_id: cardData.question_id,
        ease_factor: INITIAL_EASE_FACTOR,
        interval_days: INITIAL_INTERVAL,
        repetitions: 0,
        next_review_date: nextReviewDate.toISOString(),
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create spaced repetition card: ${error.message}`)
    }

    return data
  }

  // Get cards due for review
  static async getCardsDueForReview(userId: string): Promise<SpacedRepetitionCard[]> {
    const today = new Date().toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select(`
        *,
        questions (
          question_text,
          correct_answer,
          explanation
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_review_date', today)
      .order('next_review_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch cards due for review: ${error.message}`)
    }

    return data || []
  }

  // Update a card after review
  static async updateCardAfterReview(cardId: string, quality: number): Promise<ReviewResult> {
    const { data: card, error: fetchError } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch card: ${fetchError.message}`)
    }

    const isCorrect = quality >= 3
    const newEaseFactor = this.calculateNewEaseFactor(card.ease_factor, quality)
    const newInterval = this.calculateNewInterval(card.interval_days, newEaseFactor, card.repetitions, isCorrect)
    const newRepetitions = isCorrect ? card.repetitions + 1 : 0

    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    const { data: updatedCard, error: updateError } = await supabase
      .from('spaced_repetition_cards')
      .update({
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        repetitions: newRepetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update card: ${updateError.message}`)
    }

    // Record the attempt
    await supabase
      .from('question_attempts')
      .insert({
        user_id: card.user_id,
        question_id: card.question_id,
        user_answer: isCorrect ? 'correct' : 'incorrect',
        is_correct: isCorrect,
        time_spent_seconds: 0,
        confidence_level: quality
      })

    return {
      card_id: cardId,
      question_id: card.question_id,
      quality,
      response_time: 0,
      is_correct: isCorrect,
      card: updatedCard
    }
  }

  // Calculate new ease factor based on SM-2 algorithm
  private static calculateNewEaseFactor(currentEaseFactor: number, quality: number): number {
    const newEaseFactor = currentEaseFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    return Math.max(MINIMUM_EASE_FACTOR, Math.min(MAXIMUM_EASE_FACTOR, newEaseFactor))
  }

  // Calculate new interval based on SM-2 algorithm
  private static calculateNewInterval(
    currentInterval: number, 
    easeFactor: number, 
    repetitions: number, 
    isCorrect: boolean
  ): number {
    if (!isCorrect) {
      return 1
    }

    if (repetitions === 0) {
      return 1
    } else if (repetitions === 1) {
      return 6
    } else {
      return Math.round(currentInterval * easeFactor)
    }
  }

  // Get spaced repetition statistics
  static async getStats(userId: string): Promise<SpacedRepetitionStats> {
    const today = new Date().toISOString().split('T')[0]

    const { data: cards, error } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch spaced repetition stats: ${error.message}`)
    }

    const cardsList = cards || []
    const activeCards = cardsList.filter(c => c.is_active)
    const cardsDueToday = activeCards.filter(c => c.next_review_date <= today).length
    const overdueCards = activeCards.filter(c => c.next_review_date < today).length

    const averageEaseFactor = activeCards.length > 0 
      ? activeCards.reduce((sum, c) => sum + c.ease_factor, 0) / activeCards.length 
      : 0

    return {
      total_cards: cardsList.length,
      active_cards: activeCards.length,
      cards_due_today: cardsDueToday,
      cards_overdue: overdueCards,
      average_ease_factor: averageEaseFactor,
      retention_rate: 0, // Would need to calculate from attempts
      cards_reviewed_today: 0, // Would need to calculate from today's reviews
      streak_days: 0 // Would need to track streak
    }
  }

  // Get all cards for a user
  static async getCards(userId: string): Promise<SpacedRepetitionCard[]> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)
      .order('next_review_date', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch spaced repetition cards: ${error.message}`)
    }

    return data || []
  }

  // Update card
  static async updateCard(cardId: string, updates: UpdateSpacedRepetitionCardData): Promise<SpacedRepetitionCard> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update spaced repetition card: ${error.message}`)
    }

    return data
  }

  // Delete card
  static async deleteCard(cardId: string): Promise<void> {
    const { error } = await supabase
      .from('spaced_repetition_cards')
      .delete()
      .eq('id', cardId)

    if (error) {
      throw new Error(`Failed to delete spaced repetition card: ${error.message}`)
    }
  }

  // Bulk create cards for questions
  static async bulkCreateCards(userId: string, questionIds: string[]): Promise<SpacedRepetitionCard[]> {
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + INITIAL_INTERVAL)

    const cardsData = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      ease_factor: INITIAL_EASE_FACTOR,
      interval_days: INITIAL_INTERVAL,
      repetitions: 0,
      next_review_date: nextReviewDate.toISOString(),
      is_active: true
    }))

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert(cardsData)
      .select()

    if (error) {
      throw new Error(`Failed to bulk create spaced repetition cards: ${error.message}`)
    }

    return data || []
  }

  // Suspend card (mark as inactive)
  static async suspendCard(cardId: string): Promise<SpacedRepetitionCard> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', cardId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to suspend spaced repetition card: ${error.message}`)
    }

    return data
  }
}