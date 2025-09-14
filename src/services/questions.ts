import { supabase } from './supabase'
import type { 
  Question, 
  CreateQuestionData, 
  UpdateQuestionData, 
  QuestionAttempt,
  QuestionStats,
  GeneratedQuestion
} from '../types/questions'
import type { Database } from '../types/database'

type QuestionRow = Database['public']['Tables']['questions']['Row']
type QuestionInsert = Database['public']['Tables']['questions']['Insert']
type QuestionUpdate = Database['public']['Tables']['questions']['Update']
type QuestionAttemptRow = Database['public']['Tables']['question_attempts']['Row']
type QuestionAttemptInsert = Database['public']['Tables']['question_attempts']['Insert']

export class QuestionService {
  // Get all questions for a user
  static async getQuestions(userId: string, subjectId?: string): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching questions:', error)
      throw new Error('Failed to fetch questions')
    }

    return data as Question[]
  }

  // Get a single question by ID
  static async getQuestion(id: string): Promise<Question | null> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching question:', error)
      return null
    }

    return data as Question
  }

  // Create a new question
  static async createQuestion(userId: string, questionData: CreateQuestionData): Promise<Question> {
    const insertData: QuestionInsert = {
      user_id: userId,
      subject_id: questionData.subject_id,
      question_text: questionData.question_text,
      question_type: questionData.question_type,
      options: questionData.options,
      correct_answer: questionData.correct_answer,
      explanation: questionData.explanation,
      difficulty: questionData.difficulty,
      tags: questionData.tags,
      is_ai_generated: questionData.is_ai_generated,
      ai_provider: questionData.ai_provider
    }

    const { data, error } = await supabase
      .from('questions')
      .insert(insertData)
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error creating question:', error)
      throw new Error('Failed to create question')
    }

    return data as Question
  }

  // Update a question
  static async updateQuestion(id: string, updates: UpdateQuestionData): Promise<Question> {
    const updateData: QuestionUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error updating question:', error)
      throw new Error('Failed to update question')
    }

    return data as Question
  }

  // Delete a question
  static async deleteQuestion(id: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting question:', error)
      throw new Error('Failed to delete question')
    }
  }

  // Record a question attempt
  static async recordAttempt(userId: string, attemptData: Omit<QuestionAttempt, 'id' | 'created_at'>): Promise<QuestionAttempt> {
    const insertData: QuestionAttemptInsert = {
      user_id: userId,
      question_id: attemptData.question_id,
      user_answer: attemptData.user_answer,
      is_correct: attemptData.is_correct,
      time_spent_seconds: attemptData.time_spent_seconds,
      confidence_level: attemptData.confidence_level
    }

    const { data, error } = await supabase
      .from('question_attempts')
      .insert(insertData)
      .select('*')
      .single()

    if (error) {
      console.error('Error recording attempt:', error)
      throw new Error('Failed to record attempt')
    }

    return data as QuestionAttempt
  }

  // Get question attempts for a user
  static async getAttempts(userId: string, questionId?: string): Promise<QuestionAttempt[]> {
    let query = supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (questionId) {
      query = query.eq('question_id', questionId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching attempts:', error)
      return []
    }

    return data as QuestionAttempt[]
  }

  // Get question statistics
  static async getQuestionStats(userId: string): Promise<QuestionStats> {
    const [questions, attempts] = await Promise.all([
      this.getQuestions(userId),
      this.getAttempts(userId)
    ])

    const totalQuestions = questions?.length || 0
    const questionsAnswered = attempts?.length || 0
    const correctAttempts = attempts?.filter(a => a.is_correct).length || 0
    const accuracy = questionsAnswered > 0 ? (correctAttempts / questionsAnswered) * 100 : 0
    const totalTimeSpent = attempts?.reduce((sum, a) => sum + a.time_spent_seconds, 0) || 0

    const questionsByType = questions?.reduce((acc, q) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const questionsByDifficulty = questions?.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate recent performance (last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const recentAttempts = attempts?.filter(a => 
      new Date(a.created_at) >= thirtyDaysAgo
    ) || []

    const previousAttempts = attempts?.filter(a => 
      new Date(a.created_at) >= sixtyDaysAgo && new Date(a.created_at) < thirtyDaysAgo
    ) || []

    const recentAccuracy = recentAttempts.length > 0
      ? (recentAttempts.filter(a => a.is_correct).length / recentAttempts.length) * 100
      : 0

    const previousAccuracy = previousAttempts.length > 0
      ? (previousAttempts.filter(a => a.is_correct).length / previousAttempts.length) * 100
      : 0

    const performanceTrend = recentAccuracy - previousAccuracy

    // Calculate subject-wise performance
    const subjectPerformance = attempts?.reduce((acc, attempt) => {
      const question = questions?.find(q => q.id === attempt.question_id)
      if (question) {
        if (!acc[question.subject_id]) {
          acc[question.subject_id] = { correct: 0, total: 0 }
        }
        acc[question.subject_id].total++
        if (attempt.is_correct) {
          acc[question.subject_id].correct++
        }
      }
      return acc
    }, {} as Record<string, { correct: number; total: number }>) || {}

    return {
      total_questions: totalQuestions,
      questions_answered: questionsAnswered,
      correct_answers: correctAttempts,
      accuracy_percentage: Math.round(accuracy),
      total_time_spent: totalTimeSpent,
      questions_by_type: questionsByType,
      questions_by_difficulty: questionsByDifficulty,
      recent_accuracy: Math.round(recentAccuracy),
      performance_trend: Math.round(performanceTrend),
      subject_performance: subjectPerformance
    }
  }

  // Get random questions for practice
  static async getRandomQuestions(userId: string, count: number = 10, subjectId?: string): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('random()')
      .limit(count)

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching random questions:', error)
      return []
    }

    return data as Question[]
  }

  // Search questions
  static async searchQuestions(userId: string, searchTerm: string): Promise<Question[]> {
    const { data, error } = await supabase
      .from('questions')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .or(`question_text.ilike.%${searchTerm}%,tags.cs.{${searchTerm}}`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching questions:', error)
      return []
    }

    return data as Question[]
  }
}