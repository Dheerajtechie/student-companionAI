import { create } from 'zustand'
import { SpacedRepetitionService } from '../services/spacedRepetition'
import { useAuthStore } from './authStore'
import type { 
  SpacedRepetitionCard, 
  CreateSpacedRepetitionCardData, 
  UpdateSpacedRepetitionCardData 
} from '../types/spacedRepetition'

interface SpacedRepetitionState {
  cards: SpacedRepetitionCard[]
  currentCard: SpacedRepetitionCard | null
  reviewQueue: SpacedRepetitionCard[]
  isLoading: boolean
  error: string | null
  isReviewing: boolean
}

interface SpacedRepetitionActions {
  // CRUD operations
  fetchCards: () => Promise<void>
  fetchCard: (id: string) => Promise<SpacedRepetitionCard | null>
  createCard: (questionId: string) => Promise<SpacedRepetitionCard>
  updateCard: (id: string, data: UpdateSpacedRepetitionCardData) => Promise<SpacedRepetitionCard>
  deleteCard: (id: string) => Promise<void>
  
  // Review operations
  startReview: () => void
  answerCard: (cardId: string, quality: number) => Promise<void>
  completeReview: () => void
  getNextCard: () => SpacedRepetitionCard | null
  
  // Analytics
  getDueCards: () => SpacedRepetitionCard[]
  getOverdueCards: () => SpacedRepetitionCard[]
  getNewCards: () => SpacedRepetitionCard[]
  
  // State management
  setCurrentCard: (card: SpacedRepetitionCard | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Local state updates
  addCard: (card: SpacedRepetitionCard) => void
  updateCardInState: (id: string, updates: Partial<SpacedRepetitionCard>) => void
  removeCard: (id: string) => void
}

type SpacedRepetitionStore = SpacedRepetitionState & SpacedRepetitionActions

export const useSpacedRepetitionStore = create<SpacedRepetitionStore>((set, get) => ({
  // Initial state
  cards: [],
  currentCard: null,
  reviewQueue: [],
  isLoading: false,
  error: null,
  isReviewing: false,

  // CRUD operations
  fetchCards: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const cards = await SpacedRepetitionService.getSpacedRepetitionCards(user.id)
      set({ cards, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch spaced repetition cards', 
        isLoading: false 
      })
    }
  },

  fetchCard: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const card = await SpacedRepetitionService.getSpacedRepetitionCard(id)
      set({ isLoading: false })
      return card
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch spaced repetition card', 
        isLoading: false 
      })
      return null
    }
  },

  createCard: async (questionId: string) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const card = await SpacedRepetitionService.createSpacedRepetitionCard(user.id, questionId)
      
      // Update local state
      set(state => ({
        cards: [card, ...state.cards],
        isLoading: false
      }))
      
      return card
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create spaced repetition card', 
        isLoading: false 
      })
      throw error
    }
  },

  updateCard: async (id: string, data: UpdateSpacedRepetitionCardData) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedCard = await SpacedRepetitionService.updateSpacedRepetitionCard(id, data)
      
      // Update local state
      set(state => ({
        cards: state.cards.map(c => c.id === id ? updatedCard : c),
        currentCard: state.currentCard?.id === id ? updatedCard : state.currentCard,
        isLoading: false
      }))
      
      return updatedCard
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update spaced repetition card', 
        isLoading: false 
      })
      throw error
    }
  },

  deleteCard: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await SpacedRepetitionService.deleteSpacedRepetitionCard(id)
      
      // Update local state
      set(state => ({
        cards: state.cards.filter(c => c.id !== id),
        currentCard: state.currentCard?.id === id ? null : state.currentCard,
        reviewQueue: state.reviewQueue.filter(c => c.id !== id),
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete spaced repetition card', 
        isLoading: false 
      })
      throw error
    }
  },

  // Review operations
  startReview: () => {
    const { cards } = get()
    const dueCards = cards.filter(card => new Date(card.next_review_date) <= new Date())
    
    set({ 
      reviewQueue: dueCards,
      isReviewing: true,
      currentCard: dueCards.length > 0 ? dueCards[0] : null
    })
  },

  answerCard: async (cardId: string, quality: number) => {
    const { cards, reviewQueue } = get()
    const card = cards.find(c => c.id === cardId)
    
    if (!card) return

    // Calculate new interval using SM-2 algorithm
    const newInterval = calculateSM2Interval(card, quality)
    const newEaseFactor = calculateSM2EaseFactor(card, quality)
    const newRepetitions = quality >= 3 ? card.repetitions + 1 : 0
    
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

    try {
      await get().updateCard(cardId, {
        ease_factor: newEaseFactor,
        interval_days: newInterval,
        repetitions: newRepetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString()
      })

      // Update review queue
      const updatedQueue = reviewQueue.filter(c => c.id !== cardId)
      const nextCard = updatedQueue.length > 0 ? updatedQueue[0] : null
      
      set({ 
        reviewQueue: updatedQueue,
        currentCard: nextCard
      })
    } catch (error) {
      console.error('Failed to update card after answer:', error)
    }
  },

  completeReview: () => {
    set({ 
      isReviewing: false,
      currentCard: null,
      reviewQueue: []
    })
  },

  getNextCard: () => {
    const { reviewQueue } = get()
    return reviewQueue.length > 0 ? reviewQueue[0] : null
  },

  // Analytics
  getDueCards: () => {
    const { cards } = get()
    return cards.filter(card => new Date(card.next_review_date) <= new Date())
  },

  getOverdueCards: () => {
    const { cards } = get()
    const now = new Date()
    return cards.filter(card => new Date(card.next_review_date) < now)
  },

  getNewCards: () => {
    const { cards } = get()
    return cards.filter(card => card.repetitions === 0)
  },

  // State management
  setCurrentCard: (card: SpacedRepetitionCard | null) => {
    set({ currentCard: card })
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading })
  },

  setError: (error: string | null) => {
    set({ error })
  },

  clearError: () => {
    set({ error: null })
  },

  // Local state updates
  addCard: (card: SpacedRepetitionCard) => {
    set(state => ({
      cards: [card, ...state.cards]
    }))
  },

  updateCardInState: (id: string, updates: Partial<SpacedRepetitionCard>) => {
    set(state => ({
      cards: state.cards.map(c => c.id === id ? { ...c, ...updates } : c),
      currentCard: state.currentCard?.id === id ? { ...state.currentCard, ...updates } : state.currentCard
    }))
  },

  removeCard: (id: string) => {
    set(state => ({
      cards: state.cards.filter(c => c.id !== id),
      currentCard: state.currentCard?.id === id ? null : state.currentCard,
      reviewQueue: state.reviewQueue.filter(c => c.id !== id)
    }))
  }
}))

// SM-2 Algorithm Implementation
function calculateSM2Interval(card: SpacedRepetitionCard, quality: number): number {
  if (quality < 3) {
    return 1 // Reset to 1 day if answered incorrectly
  }

  if (card.repetitions === 0) {
    return 1
  } else if (card.repetitions === 1) {
    return 6
  } else {
    return Math.round(card.interval_days * card.ease_factor)
  }
}

function calculateSM2EaseFactor(card: SpacedRepetitionCard, quality: number): number {
  const newEaseFactor = card.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  return Math.max(1.3, newEaseFactor) // Minimum ease factor is 1.3
}

// Import auth store for user access
import { useAuthStore } from './authStore'
