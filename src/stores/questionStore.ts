import { create } from 'zustand'
import { QuestionService } from '../services/questions'
import { enhancedAIService } from '../services/aiEnhanced'
import type { 
  Question, 
  QuestionAttempt, 
  CreateQuestionData, 
  GenerateQuestionsRequest,
  QuestionFilters,
  QuestionStats
} from '../types/questions'

interface QuestionState {
  questions: Question[]
  selectedQuestion: Question | null
  currentQuestion: Question | null
  questionAttempts: QuestionAttempt[]
  isLoading: boolean
  error: string | null
  stats: QuestionStats | null
  filters: QuestionFilters
  searchResults: Question[]
}

interface QuestionActions {
  // CRUD operations
  fetchQuestions: (filters?: QuestionFilters) => Promise<void>
  fetchQuestion: (id: string) => Promise<Question | null>
  createQuestion: (data: CreateQuestionData) => Promise<Question>
  updateQuestion: (id: string, data: Partial<CreateQuestionData>) => Promise<Question>
  deleteQuestion: (id: string) => Promise<void>
  
  // AI Generation
  generateQuestions: (request: GenerateQuestionsRequest) => Promise<Question[]>
  
  // Question attempts
  recordAttempt: (questionId: string, attempt: Omit<QuestionAttempt, 'id' | 'user_id' | 'question_id' | 'created_at'>) => Promise<void>
  fetchAttempts: (questionId?: string) => Promise<void>
  
  // Analytics
  fetchStats: () => Promise<void>
  
  // Search and filtering
  searchQuestions: (query: string) => Promise<void>
  setFilters: (filters: QuestionFilters) => void
  clearFilters: () => void
  getRandomQuestions: (count: number, filters?: QuestionFilters) => Promise<Question[]>
  
  // Bulk operations
  bulkDeleteQuestions: (questionIds: string[]) => Promise<void>
  
  // State management
  setSelectedQuestion: (question: Question | null) => void
  setCurrentQuestion: (question: Question | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Local state updates
  addQuestion: (question: Question) => void
  updateQuestionInState: (id: string, updates: Partial<Question>) => void
  removeQuestion: (id: string) => void
  addAttempt: (attempt: QuestionAttempt) => void
}

type QuestionStore = QuestionState & QuestionActions

const defaultFilters: QuestionFilters = {}

export const useQuestionStore = create<QuestionStore>((set, get) => ({
  // Initial state
  questions: [],
  selectedQuestion: null,
  currentQuestion: null,
  questionAttempts: [],
  isLoading: false,
  error: null,
  stats: null,
  filters: { ...defaultFilters },
  searchResults: [],

  // CRUD operations
  fetchQuestions: async (filters?: QuestionFilters) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    const currentFilters = filters || get().filters
    set({ isLoading: true, error: null, filters: currentFilters })
    
    try {
      const questions = await QuestionService.getQuestions(user.id, currentFilters)
      set({ questions, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch questions', 
        isLoading: false 
      })
    }
  },

  fetchQuestion: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const question = await QuestionService.getQuestion(id)
      set({ selectedQuestion: question, isLoading: false })
      return question
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch question', 
        isLoading: false 
      })
      return null
    }
  },

  createQuestion: async (data: CreateQuestionData) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const question = await QuestionService.createQuestion(user.id, data)
      
      // Update local state
      set(state => ({
        questions: [question, ...state.questions],
        isLoading: false
      }))
      
      return question
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create question', 
        isLoading: false 
      })
      throw error
    }
  },

  updateQuestion: async (id: string, data: Partial<CreateQuestionData>) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedQuestion = await QuestionService.updateQuestion(id, data)
      
      // Update local state
      set(state => ({
        questions: state.questions.map(q => q.id === id ? updatedQuestion : q),
        selectedQuestion: state.selectedQuestion?.id === id ? updatedQuestion : state.selectedQuestion,
        currentQuestion: state.currentQuestion?.id === id ? updatedQuestion : state.currentQuestion,
        isLoading: false
      }))
      
      return updatedQuestion
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update question', 
        isLoading: false 
      })
      throw error
    }
  },

  deleteQuestion: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await QuestionService.deleteQuestion(id)
      
      // Update local state
      set(state => ({
        questions: state.questions.filter(q => q.id !== id),
        selectedQuestion: state.selectedQuestion?.id === id ? null : state.selectedQuestion,
        currentQuestion: state.currentQuestion?.id === id ? null : state.currentQuestion,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete question', 
        isLoading: false 
      })
      throw error
    }
  },

  // AI Generation
  generateQuestions: async (request: GenerateQuestionsRequest) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      // Use enhanced AI service for better reliability
      const generatedQuestions = await enhancedAIService.generateQuestions(request)
      
      // Save questions to database (using existing method for now)
      const questions = await Promise.all(
        generatedQuestions.map(q => QuestionService.createQuestion(user.id, {
          subject_id: request.subject_id,
          question_text: q.question_text,
          question_type: q.question_type,
          options: q.options,
          correct_answer: q.correct_answer,
          explanation: q.explanation,
          difficulty: q.difficulty,
          tags: q.tags,
          is_ai_generated: true
        }))
      )
      
      // Update local state
      set(state => ({
        questions: [...questions, ...state.questions],
        isLoading: false
      }))
      
      return questions
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to generate questions', 
        isLoading: false 
      })
      throw error
    }
  },

  // Question attempts
  recordAttempt: async (questionId: string, attempt: Omit<QuestionAttempt, 'id' | 'user_id' | 'question_id' | 'created_at'>) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const newAttempt = await QuestionService.recordAttempt(user.id, questionId, attempt)
      
      // Update local state
      set(state => ({
        questionAttempts: [newAttempt, ...state.questionAttempts],
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to record attempt', 
        isLoading: false 
      })
      throw error
    }
  },

  fetchAttempts: async (questionId?: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const attempts = await QuestionService.getQuestionAttempts(user.id, questionId)
      set({ questionAttempts: attempts, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch question attempts', 
        isLoading: false 
      })
    }
  },

  // Analytics
  fetchStats: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const stats = await QuestionService.getQuestionStats(user.id)
      set({ stats, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch question stats', 
        isLoading: false 
      })
    }
  },

  // Search and filtering
  searchQuestions: async (query: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const results = await QuestionService.searchQuestions(user.id, query)
      set({ searchResults: results, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search questions', 
        isLoading: false 
      })
    }
  },

  setFilters: (filters: QuestionFilters) => {
    set({ filters })
    // Automatically refetch questions with new filters
    get().fetchQuestions(filters)
  },

  clearFilters: () => {
    const clearedFilters = { ...defaultFilters }
    set({ filters: clearedFilters })
    get().fetchQuestions(clearedFilters)
  },

  getRandomQuestions: async (count: number, filters?: QuestionFilters) => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    set({ isLoading: true, error: null })
    
    try {
      const questions = await QuestionService.getRandomQuestions(user.id, count, filters)
      set({ isLoading: false })
      return questions
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get random questions', 
        isLoading: false 
      })
      return []
    }
  },

  // Bulk operations
  bulkDeleteQuestions: async (questionIds: string[]) => {
    set({ isLoading: true, error: null })
    
    try {
      await QuestionService.bulkDeleteQuestions(questionIds)
      
      // Update local state
      set(state => ({
        questions: state.questions.filter(q => !questionIds.includes(q.id)),
        selectedQuestion: state.selectedQuestion && questionIds.includes(state.selectedQuestion.id) ? null : state.selectedQuestion,
        currentQuestion: state.currentQuestion && questionIds.includes(state.currentQuestion.id) ? null : state.currentQuestion,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to bulk delete questions', 
        isLoading: false 
      })
      throw error
    }
  },

  // State management
  setSelectedQuestion: (question: Question | null) => {
    set({ selectedQuestion: question })
  },

  setCurrentQuestion: (question: Question | null) => {
    set({ currentQuestion: question })
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
  addQuestion: (question: Question) => {
    set(state => ({
      questions: [question, ...state.questions]
    }))
  },

  updateQuestionInState: (id: string, updates: Partial<Question>) => {
    set(state => ({
      questions: state.questions.map(q => q.id === id ? { ...q, ...updates } : q),
      selectedQuestion: state.selectedQuestion?.id === id ? { ...state.selectedQuestion, ...updates } : state.selectedQuestion,
      currentQuestion: state.currentQuestion?.id === id ? { ...state.currentQuestion, ...updates } : state.currentQuestion
    }))
  },

  removeQuestion: (id: string) => {
    set(state => ({
      questions: state.questions.filter(q => q.id !== id),
      selectedQuestion: state.selectedQuestion?.id === id ? null : state.selectedQuestion,
      currentQuestion: state.currentQuestion?.id === id ? null : state.currentQuestion
    }))
  },

  addAttempt: (attempt: QuestionAttempt) => {
    set(state => ({
      questionAttempts: [attempt, ...state.questionAttempts]
    }))
  }
}))

// Import auth store for user access
import { useAuthStore } from './authStore'