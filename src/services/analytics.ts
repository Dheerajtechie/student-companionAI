import { supabase } from './supabase'
import type { 
  StudyAnalytics, 
  SubjectAnalytics, 
  QuestionAnalytics, 
  SpacedRepetitionAnalytics, 
  GoalAnalytics,
  TimeSeriesData,
  ChartData,
  PerformanceMetrics,
  AnalyticsFilters
} from '../types/analytics'

export class AnalyticsService {
  // Get study analytics
  static async getStudyAnalytics(userId: string, filters?: AnalyticsFilters): Promise<StudyAnalytics> {
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Failed to fetch study analytics: ${error.message}`)
    }

    const filteredSessions = sessions || []
    const totalStudyTime = filteredSessions.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const totalSessions = filteredSessions.length
    const averageSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0

    return {
      total_study_time: totalStudyTime,
      total_sessions: totalSessions,
      average_session_duration: averageSessionDuration,
      focus_rating_average: 0,
      current_streak: 0,
      longest_streak: 0,
      study_time_by_day: [],
      focus_trends: [],
      productivity_score: 0
    }
  }

  // Get subject analytics
  static async getSubjectAnalytics(userId: string, filters?: AnalyticsFilters): Promise<SubjectAnalytics> {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch subject analytics: ${error.message}`)
    }

    return {
      total_subjects: subjects?.length || 0,
      active_subjects: subjects?.filter(s => s.is_active).length || 0,
      subjects_by_difficulty: {
        beginner: subjects?.filter(s => s.difficulty === 'beginner').length || 0,
        intermediate: subjects?.filter(s => s.difficulty === 'intermediate').length || 0,
        advanced: subjects?.filter(s => s.difficulty === 'advanced').length || 0
      },
      subject_progress: [],
      most_studied_subject: null,
      study_time_by_subject: []
    }
  }

  // Get question analytics
  static async getQuestionAnalytics(userId: string, filters?: AnalyticsFilters): Promise<QuestionAnalytics> {
    const { data: questions, error } = await supabase
      .from('questions')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch question analytics: ${error.message}`)
    }

    return {
      total_questions: questions?.length || 0,
      questions_answered: 0,
      accuracy_rate: 0,
      average_time_per_question: 0,
      questions_by_type: {},
      questions_by_difficulty: {},
      accuracy_trends: [],
      performance_by_subject: []
    }
  }

  // Get spaced repetition analytics
  static async getSpacedRepetitionAnalytics(userId: string, filters?: AnalyticsFilters): Promise<SpacedRepetitionAnalytics> {
    const { data: cards, error } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch spaced repetition analytics: ${error.message}`)
    }

    return {
      total_cards: cards?.length || 0,
      active_cards: cards?.filter(c => c.is_active).length || 0,
      overdue_cards: 0,
      average_ease_factor: 0,
      review_accuracy: 0,
      cards_by_interval: {},
      review_trends: []
    }
  }

  // Get goal analytics
  static async getGoalAnalytics(userId: string, filters?: AnalyticsFilters): Promise<GoalAnalytics> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch goal analytics: ${error.message}`)
    }

    return {
      total_goals: goals?.length || 0,
      active_goals: goals?.filter(g => g.status === 'active').length || 0,
      completed_goals: goals?.filter(g => g.status === 'completed').length || 0,
      goals_by_type: {},
      goals_by_priority: {},
      goal_completion_rate: 0,
      average_goal_duration: 0
    }
  }

  // Get comprehensive analytics
  static async getComprehensiveAnalytics(userId: string, filters?: AnalyticsFilters): Promise<{
    study: StudyAnalytics
    subjects: SubjectAnalytics
    questions: QuestionAnalytics
    spaced_repetition: SpacedRepetitionAnalytics
    goals: GoalAnalytics
  }> {
    const [study, subjects, questions, spacedRepetition, goals] = await Promise.all([
      this.getStudyAnalytics(userId, filters),
      this.getSubjectAnalytics(userId, filters),
      this.getQuestionAnalytics(userId, filters),
      this.getSpacedRepetitionAnalytics(userId, filters),
      this.getGoalAnalytics(userId, filters)
    ])

    return {
      study,
      subjects,
      questions,
      spaced_repetition: spacedRepetition,
      goals
    }
  }
}