import { supabase } from './supabase'
import type { SpacedRepetitionCard, ReviewResult } from '../types/spacedRepetition'

// SM-2 Algorithm Implementation for Optimal Learning Retention
export class AdvancedSpacedRepetitionService {
  // SM-2 Algorithm constants
  private static readonly INITIAL_EASE_FACTOR = 2.5
  private static readonly MIN_EASE_FACTOR = 1.3
  private static readonly INITIAL_INTERVAL = 1
  private static readonly SECOND_INTERVAL = 6
  private static readonly GRADING_SCALE = {
    AGAIN: 0,      // Complete blackout
    HARD: 1,       // Incorrect response; correct one remembered
    GOOD: 2,       // Correct response after hesitation
    EASY: 3        // Perfect response
  }

  // Create a new spaced repetition card
  static async createCard(userId: string, questionId: string): Promise<SpacedRepetitionCard> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert({
        user_id: userId,
        question_id: questionId,
        ease_factor: this.INITIAL_EASE_FACTOR,
        interval_days: this.INITIAL_INTERVAL,
        repetitions: 0,
        next_review_date: new Date().toISOString(),
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
  static async getCardsForReview(userId: string, limit: number = 20): Promise<SpacedRepetitionCard[]> {
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
          tags
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .lte('next_review_date', now)
      .order('next_review_date', { ascending: true })
      .limit(limit)

    if (error) {
      throw new Error(`Failed to fetch review cards: ${error.message}`)
    }

    return data || []
  }

  // Process review result using SM-2 algorithm
  static async processReview(
    cardId: string, 
    quality: number, 
    timeSpent: number,
    confidenceLevel: number
  ): Promise<ReviewResult> {
    const { data: card, error: fetchError } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('id', cardId)
      .single()

    if (fetchError || !card) {
      throw new Error(`Card not found: ${fetchError?.message}`)
    }

    // Calculate new parameters using SM-2 algorithm
    const result = this.calculateSM2Parameters(card, quality, timeSpent, confidenceLevel)

    // Update card with new parameters
    const { data: updatedCard, error: updateError } = await supabase
      .from('spaced_repetition_cards')
      .update({
        ease_factor: result.easeFactor,
        interval_days: result.intervalDays,
        repetitions: result.repetitions,
        next_review_date: result.nextReviewDate,
        last_reviewed_at: new Date().toISOString(),
        is_active: result.isActive
      })
      .eq('id', cardId)
      .select()
      .single()

    if (updateError) {
      throw new Error(`Failed to update card: ${updateError.message}`)
    }

    return {
      card: updatedCard,
      quality,
      timeSpent,
      confidenceLevel,
      newInterval: result.intervalDays,
      nextReviewDate: result.nextReviewDate,
      masteryLevel: this.calculateMasteryLevel(updatedCard)
    }
  }

  // SM-2 Algorithm implementation
  private static calculateSM2Parameters(
    card: SpacedRepetitionCard,
    quality: number,
    timeSpent: number,
    confidenceLevel: number
  ) {
    let { ease_factor, interval_days, repetitions } = card

    // Adjust ease factor based on quality (0-3 scale)
    if (quality < this.GRADING_SCALE.GOOD) {
      // Failed or hard - reset repetitions and reduce ease factor
      ease_factor = Math.max(this.MIN_EASE_FACTOR, ease_factor - 0.2)
      interval_days = this.INITIAL_INTERVAL
      repetitions = 0
    } else {
      // Successful review - increase repetitions and ease factor
      repetitions += 1

      // Increase ease factor slightly for good performance
      if (quality >= this.GRADING_SCALE.GOOD) {
        ease_factor += 0.1
      }

      // Calculate new interval
      if (repetitions === 1) {
        interval_days = this.SECOND_INTERVAL
      } else if (repetitions === 2) {
        interval_days = Math.round(interval_days * ease_factor)
      } else {
        interval_days = Math.round(interval_days * ease_factor)
      }

      // Apply confidence and time-based adjustments
      const confidenceMultiplier = 0.8 + (confidenceLevel / 10) * 0.4 // 0.8 to 1.2
      const timeMultiplier = Math.max(0.5, Math.min(1.5, 1 - (timeSpent - 30) / 120)) // Adjust based on time spent

      interval_days = Math.round(interval_days * confidenceMultiplier * timeMultiplier)
    }

    // Calculate next review date
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + interval_days)

    // Determine if card should remain active
    const isActive = quality >= this.GRADING_SCALE.HARD || repetitions < 10

    return {
      easeFactor: Math.round(ease_factor * 100) / 100, // Round to 2 decimal places
      intervalDays: interval_days,
      repetitions,
      nextReviewDate: nextReviewDate.toISOString(),
      isActive
    }
  }

  // Calculate mastery level based on card parameters
  private static calculateMasteryLevel(card: SpacedRepetitionCard): 'learning' | 'reviewing' | 'mastered' {
    if (card.repetitions < 3) return 'learning'
    if (card.repetitions < 10 && card.interval_days < 30) return 'reviewing'
    return 'mastered'
  }

  // Get spaced repetition statistics for user
  static async getStatistics(userId: string): Promise<{
    totalCards: number
    activeCards: number
    cardsDueToday: number
    averageEaseFactor: number
    masteryDistribution: { learning: number; reviewing: number; mastered: number }
    reviewStreak: number
    nextReviewDate: string | null
  }> {
    const now = new Date().toISOString()
    
    // Get all cards for user
    const { data: allCards, error: allError } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)

    if (allError) {
      throw new Error(`Failed to fetch statistics: ${allError.message}`)
    }

    const cards = allCards || []
    const activeCards = cards.filter(card => card.is_active)
    const cardsDueToday = activeCards.filter(card => card.next_review_date <= now)

    // Calculate statistics
    const averageEaseFactor = activeCards.length > 0 
      ? activeCards.reduce((sum, card) => sum + card.ease_factor, 0) / activeCards.length 
      : 0

    const masteryDistribution = {
      learning: activeCards.filter(card => this.calculateMasteryLevel(card) === 'learning').length,
      reviewing: activeCards.filter(card => this.calculateMasteryLevel(card) === 'reviewing').length,
      mastered: activeCards.filter(card => this.calculateMasteryLevel(card) === 'mastered').length
    }

    // Calculate review streak (simplified - in real implementation, you'd track daily reviews)
    const reviewStreak = Math.min(cardsDueToday.length, 30) // Simplified calculation

    // Get next review date
    const nextReviewDate = activeCards.length > 0 
      ? activeCards.reduce((earliest, card) => 
          card.next_review_date < earliest ? card.next_review_date : earliest, 
          activeCards[0].next_review_date
        )
      : null

    return {
      totalCards: cards.length,
      activeCards: activeCards.length,
      cardsDueToday: cardsDueToday.length,
      averageEaseFactor: Math.round(averageEaseFactor * 100) / 100,
      masteryDistribution,
      reviewStreak,
      nextReviewDate
    }
  }

  // Get learning progress over time
  static async getLearningProgress(userId: string, days: number = 30): Promise<Array<{
    date: string
    cardsReviewed: number
    averageQuality: number
    newCards: number
  }>> {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data: reviews, error } = await supabase
      .from('spaced_repetition_cards')
      .select('last_reviewed_at, ease_factor, repetitions')
      .eq('user_id', userId)
      .gte('last_reviewed_at', startDate.toISOString())
      .not('last_reviewed_at', 'is', null)

    if (error) {
      throw new Error(`Failed to fetch learning progress: ${error.message}`)
    }

    // Group by date and calculate metrics
    const progressMap = new Map<string, { cardsReviewed: number; totalQuality: number; newCards: number }>()

    reviews?.forEach(review => {
      const date = new Date(review.last_reviewed_at!).toISOString().split('T')[0]
      const existing = progressMap.get(date) || { cardsReviewed: 0, totalQuality: 0, newCards: 0 }
      
      existing.cardsReviewed++
      existing.totalQuality += review.ease_factor
      if (review.repetitions === 1) {
        existing.newCards++
      }
      
      progressMap.set(date, existing)
    })

    // Convert to array and fill missing dates
    const progress = []
    for (let i = 0; i < days; i++) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().split('T')[0]
      
      const dayData = progressMap.get(dateStr) || { cardsReviewed: 0, totalQuality: 0, newCards: 0 }
      
      progress.unshift({
        date: dateStr,
        cardsReviewed: dayData.cardsReviewed,
        averageQuality: dayData.cardsReviewed > 0 ? dayData.totalQuality / dayData.cardsReviewed : 0,
        newCards: dayData.newCards
      })
    }

    return progress
  }

  // Bulk create cards from questions
  static async bulkCreateCards(userId: string, questionIds: string[]): Promise<SpacedRepetitionCard[]> {
    const cards = questionIds.map(questionId => ({
      user_id: userId,
      question_id: questionId,
      ease_factor: this.INITIAL_EASE_FACTOR,
      interval_days: this.INITIAL_INTERVAL,
      repetitions: 0,
      next_review_date: new Date().toISOString(),
      is_active: true
    }))

    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .insert(cards)
      .select()

    if (error) {
      throw new Error(`Failed to bulk create cards: ${error.message}`)
    }

    return data || []
  }

  // Archive completed cards (mastered)
  static async archiveMasteredCards(userId: string): Promise<number> {
    const { data, error } = await supabase
      .from('spaced_repetition_cards')
      .update({ is_active: false })
      .eq('user_id', userId)
      .gte('interval_days', 365) // Cards with 1+ year intervals are considered mastered
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to archive mastered cards: ${error.message}`)
    }

    return data?.length || 0
  }
}

// Export singleton instance
export const spacedRepetitionService = new AdvancedSpacedRepetitionService()
