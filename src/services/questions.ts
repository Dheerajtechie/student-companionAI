import { supabase } from './supabase'
import type { 
  Question, 
  QuestionAttempt, 
  CreateQuestionData, 
  UpdateQuestionData,
  QuestionFilters,
  QuestionStats,
  GenerateQuestionsRequest,
  GeneratedQuestion
} from '../types/questions'

export class QuestionService {
  // Create a new question
  static async createQuestion(userId: string, questionData: CreateQuestionData): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .insert({
        user_id: userId,
        ...questionData,
        is_ai_generated: questionData.is_ai_generated || false,
        ai_provider: questionData.ai_provider || null
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create question: ${error.message}`)
    }

    return data
  }

  // Get questions for a user
  static async getQuestions(userId: string, filters?: QuestionFilters): Promise<Question[]> {
    let query = supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.subject_id) {
      query = query.eq('subject_id', filters.subject_id)
    }

    if (filters?.question_type) {
      query = query.eq('question_type', filters.question_type)
    }

    if (filters?.difficulty) {
      query = query.eq('difficulty', filters.difficulty)
    }

    if (filters?.is_ai_generated !== undefined) {
      query = query.eq('is_ai_generated', filters.is_ai_generated)
    }

    if (filters?.search) {
      query = query.ilike('question_text', `%${filters.search}%`)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch questions: ${error.message}`)
    }

    return data || []
  }

  // Update a question
  static async updateQuestion(questionId: string, updates: UpdateQuestionData): Promise<Question> {
    const { data, error } = await supabase
      .from('questions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', questionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update question: ${error.message}`)
    }

    return data
  }

  // Delete a question
  static async deleteQuestion(questionId: string): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId)

    if (error) {
      throw new Error(`Failed to delete question: ${error.message}`)
    }
  }

  // Record a question attempt
  static async recordQuestionAttempt(attempt: Omit<QuestionAttempt, 'id' | 'created_at'>): Promise<QuestionAttempt> {
    const { data, error } = await supabase
      .from('question_attempts')
      .insert({
        ...attempt,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to record question attempt: ${error.message}`)
    }

    return data
  }

  // Get question attempts for a user
  static async getQuestionAttempts(userId: string, questionId?: string): Promise<QuestionAttempt[]> {
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
      throw new Error(`Failed to fetch question attempts: ${error.message}`)
    }

    return data || []
  }

  // Get question statistics
  static async getQuestionStats(userId: string): Promise<QuestionStats> {
    const { data: questions, error: questionsError } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId)

    if (questionsError) {
      throw new Error(`Failed to fetch questions: ${questionsError.message}`)
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)

    if (attemptsError) {
      throw new Error(`Failed to fetch question attempts: ${attemptsError.message}`)
    }

    const questionsList = questions || []
    const attemptsList = attempts || []

    const correctAttempts = attemptsList.filter(a => a.is_correct).length
    const totalAttempts = attemptsList.length
    const accuracyRate = totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0

    const averageTime = attemptsList.length > 0 
      ? attemptsList.reduce((sum, a) => sum + (a.time_spent_seconds || 0), 0) / attemptsList.length 
      : 0

    return {
      total_questions: questionsList.length,
      questions_by_type: {
        multiple_choice: questionsList.filter(q => q.question_type === 'multiple_choice').length,
        short_answer: questionsList.filter(q => q.question_type === 'short_answer').length,
        essay: questionsList.filter(q => q.question_type === 'essay').length,
        true_false: questionsList.filter(q => q.question_type === 'true_false').length,
        fill_blank: questionsList.filter(q => q.question_type === 'fill_blank').length
      },
      questions_by_difficulty: {
        beginner: questionsList.filter(q => q.difficulty === 'beginner').length,
        intermediate: questionsList.filter(q => q.difficulty === 'intermediate').length,
        advanced: questionsList.filter(q => q.difficulty === 'advanced').length
      },
      accuracy_rate: accuracyRate,
      average_time_per_question: averageTime
    }
  }

  // Generate questions using AI
  static async generateQuestions(request: GenerateQuestionsRequest): Promise<GeneratedQuestion[]> {
    // This would typically call an AI service
    // For now, return mock data
    const mockQuestions: GeneratedQuestion[] = [
      {
        question_text: `Sample ${request.question_type} question about ${request.topic || 'the topic'}`,
        question_type: request.question_type,
        correct_answer: 'Sample answer',
        explanation: 'This is a sample explanation',
        difficulty: request.difficulty,
        tags: ['sample']
      }
    ]

    return mockQuestions.slice(0, request.count)
  }

  // Bulk delete questions
  static async bulkDeleteQuestions(questionIds: string[]): Promise<void> {
    const { error } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds)

    if (error) {
      throw new Error(`Failed to bulk delete questions: ${error.message}`)
    }
  }
}