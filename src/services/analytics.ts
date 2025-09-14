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

    let filteredSessions = sessions || []

    // Apply date range filter
    if (filters?.date_range) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.started_at)
        return sessionDate >= new Date(filters.date_range!.start) && 
               sessionDate <= new Date(filters.date_range!.end)
      })
    }

    // Apply subject filter
    if (filters?.subject_ids && filters.subject_ids.length > 0) {
      filteredSessions = filteredSessions.filter(session => 
        filters.subject_ids!.includes(session.subject_id)
      )
    }

    const totalStudyTime = filteredSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
    const totalSessions = filteredSessions.length
    const averageSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0

    // Calculate focus rating average
    const focusRatings = filteredSessions.filter(s => s.focus_rating).map(s => s.focus_rating!)
    const focusRatingAverage = focusRatings.length > 0 
      ? focusRatings.reduce((sum, rating) => sum + rating, 0) / focusRatings.length
      : 0

    // Calculate streaks
    const sortedSessions = filteredSessions.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    )

    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0
    let lastDate: string | null = null

    for (const session of sortedSessions) {
      const sessionDate = session.started_at.split('T')[0]
      
      if (lastDate === null) {
        lastDate = sessionDate
        tempStreak = 1
        currentStreak = 1
        longestStreak = 1
        continue
      }

      const daysDiff = Math.floor(
        (new Date(lastDate).getTime() - new Date(sessionDate).getTime()) / (1000 * 60 * 60 * 24)
      )

      if (daysDiff === 1) {
        tempStreak++
        if (tempStreak > longestStreak) {
          longestStreak = tempStreak
        }
        if (currentStreak === tempStreak - 1) {
          currentStreak = tempStreak
        }
      } else if (daysDiff > 1) {
        if (currentStreak === tempStreak) {
          currentStreak = 0
        }
        tempStreak = 1
      }
      
      lastDate = sessionDate
    }

    // Get today's data
    const today = new Date().toISOString().split('T')[0]
    const sessionsToday = filteredSessions.filter(s => s.started_at.startsWith(today))
    const studyTimeToday = sessionsToday.reduce((sum, s) => sum + s.duration_minutes, 0)

    // Get this week's data
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]
    const sessionsThisWeek = filteredSessions.filter(s => s.started_at >= weekStartStr)
    const studyTimeThisWeek = sessionsThisWeek.reduce((sum, s) => sum + s.duration_minutes, 0)

    // Get this month's data
    const monthStart = new Date()
    monthStart.setDate(1)
    const monthStartStr = monthStart.toISOString().split('T')[0]
    const sessionsThisMonth = filteredSessions.filter(s => s.started_at >= monthStartStr)
    const studyTimeThisMonth = sessionsThisMonth.reduce((sum, s) => sum + s.duration_minutes, 0)

    // Find most productive day and hour
    const dailyData: Record<string, number> = {}
    const hourlyData: Record<number, number> = {}

    filteredSessions.forEach(session => {
      const date = new Date(session.started_at)
      const day = date.toLocaleDateString('en-US', { weekday: 'long' })
      const hour = date.getHours()

      dailyData[day] = (dailyData[day] || 0) + session.duration_minutes
      hourlyData[hour] = (hourlyData[hour] || 0) + session.duration_minutes
    })

    const mostProductiveDay = Object.entries(dailyData).reduce((a, b) => 
      dailyData[a[0]] > dailyData[b[0]] ? a : b, ['Monday', 0]
    )[0]

    const mostProductiveHour = Object.entries(hourlyData).reduce((a, b) => 
      hourlyData[parseInt(a[0])] > hourlyData[parseInt(b[0])] ? a : b, ['0', 0]
    )[0]

    return {
      total_study_time: totalStudyTime,
      total_sessions: totalSessions,
      average_session_duration: averageSessionDuration,
      study_streak: currentStreak,
      longest_streak: longestStreak,
      study_time_today: studyTimeToday,
      study_time_this_week: studyTimeThisWeek,
      study_time_this_month: studyTimeThisMonth,
      most_productive_day: mostProductiveDay,
      most_productive_hour: parseInt(mostProductiveHour),
      focus_rating_average: focusRatingAverage
    }
  }

  // Get subject analytics
  static async getSubjectAnalytics(userId: string, filters?: AnalyticsFilters): Promise<SubjectAnalytics[]> {
    const { data: subjects, error: subjectsError } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (subjectsError) {
      throw new Error(`Failed to fetch subjects: ${subjectsError.message}`)
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (sessionsError) {
      throw new Error(`Failed to fetch sessions: ${sessionsError.message}`)
    }

    let filteredSessions = sessions || []

    // Apply date range filter
    if (filters?.date_range) {
      filteredSessions = filteredSessions.filter(session => {
        const sessionDate = new Date(session.started_at)
        return sessionDate >= new Date(filters.date_range!.start) && 
               sessionDate <= new Date(filters.date_range!.end)
      })
    }

    return subjects?.map(subject => {
      const subjectSessions = filteredSessions.filter(s => s.subject_id === subject.id)
      const totalStudyTime = subjectSessions.reduce((sum, s) => sum + s.duration_minutes, 0)
      const sessionsCount = subjectSessions.length
      const averageSessionDuration = sessionsCount > 0 ? totalStudyTime / sessionsCount : 0
      const progressPercentage = subject.target_hours > 0 
        ? Math.min((subject.completed_hours / subject.target_hours) * 100, 100)
        : 0

      const lastStudied = subjectSessions.length > 0 
        ? subjectSessions.sort((a, b) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0].started_at
        : null

      const focusRatings = subjectSessions.filter(s => s.focus_rating).map(s => s.focus_rating!)
      const focusRatingAverage = focusRatings.length > 0 
        ? focusRatings.reduce((sum, rating) => sum + rating, 0) / focusRatings.length
        : 0

      return {
        subject_id: subject.id,
        subject_name: subject.name,
        total_study_time: totalStudyTime,
        sessions_count: sessionsCount,
        average_session_duration: averageSessionDuration,
        progress_percentage: progressPercentage,
        last_studied: lastStudied,
        difficulty_level: subject.difficulty,
        focus_rating_average: focusRatingAverage
      }
    }) || []
  }

  // Get question analytics
  static async getQuestionAnalytics(userId: string, filters?: AnalyticsFilters): Promise<QuestionAnalytics> {
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
      throw new Error(`Failed to fetch attempts: ${attemptsError.message}`)
    }

    let filteredAttempts = attempts || []

    // Apply date range filter
    if (filters?.date_range) {
      filteredAttempts = filteredAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.created_at)
        return attemptDate >= new Date(filters.date_range!.start) && 
               attemptDate <= new Date(filters.date_range!.end)
      })
    }

    // Apply subject filter
    if (filters?.subject_ids && filters.subject_ids.length > 0) {
      const subjectQuestions = questions?.filter(q => filters.subject_ids!.includes(q.subject_id)) || []
      const subjectQuestionIds = subjectQuestions.map(q => q.id)
      filteredAttempts = filteredAttempts.filter(attempt => 
        subjectQuestionIds.includes(attempt.question_id)
      )
    }

    const totalQuestions = questions?.length || 0
    const questionsAnswered = filteredAttempts.length
    const correctAttempts = filteredAttempts.filter(a => a.is_correct).length
    const accuracyRate = questionsAnswered > 0 ? (correctAttempts / questionsAnswered) * 100 : 0

    const totalTimeSpent = filteredAttempts.reduce((sum, a) => sum + a.time_spent_seconds, 0)
    const averageResponseTime = questionsAnswered > 0 ? totalTimeSpent / questionsAnswered : 0

    // Questions by difficulty
    const questionsByDifficulty = questions?.reduce((acc, q) => {
      acc[q.difficulty] = (acc[q.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Questions by type
    const questionsByType = questions?.reduce((acc, q) => {
      acc[q.question_type] = (acc[q.question_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Calculate improvement trend
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const sixtyDaysAgo = new Date()
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60)

    const recentAttempts = filteredAttempts.filter(a => 
      new Date(a.created_at) >= thirtyDaysAgo
    )

    const previousAttempts = filteredAttempts.filter(a => 
      new Date(a.created_at) >= sixtyDaysAgo && new Date(a.created_at) < thirtyDaysAgo
    )

    const recentAccuracy = recentAttempts.length > 0 
      ? (recentAttempts.filter(a => a.is_correct).length / recentAttempts.length) * 100
      : 0

    const previousAccuracy = previousAttempts.length > 0 
      ? (previousAttempts.filter(a => a.is_correct).length / previousAttempts.length) * 100
      : 0

    const improvementTrend = previousAccuracy > 0 ? ((recentAccuracy - previousAccuracy) / previousAccuracy) * 100 : 0

    // Identify weak and strong areas
    const subjectAccuracy = filteredAttempts.reduce((acc, attempt) => {
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
    }, {} as Record<string, { correct: number; total: number }>)

    const weakAreas: string[] = []
    const strongAreas: string[] = []

    Object.entries(subjectAccuracy).forEach(([subjectId, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100
      if (accuracy < 60) {
        weakAreas.push(subjectId)
      } else if (accuracy > 80) {
        strongAreas.push(subjectId)
      }
    })

    return {
      total_questions: totalQuestions,
      questions_answered: questionsAnswered,
      accuracy_rate: accuracyRate,
      average_response_time: averageResponseTime,
      questions_by_difficulty: questionsByDifficulty,
      questions_by_type: questionsByType,
      improvement_trend: improvementTrend,
      weak_areas: weakAreas,
      strong_areas: strongAreas
    }
  }

  // Get spaced repetition analytics
  static async getSpacedRepetitionAnalytics(userId: string, filters?: AnalyticsFilters): Promise<SpacedRepetitionAnalytics> {
    const { data: cards, error: cardsError } = await supabase
      .from('spaced_repetition_cards')
      .select('*')
      .eq('user_id', userId)

    if (cardsError) {
      throw new Error(`Failed to fetch cards: ${cardsError.message}`)
    }

    const { data: attempts, error: attemptsError } = await supabase
      .from('question_attempts')
      .select('*')
      .eq('user_id', userId)

    if (attemptsError) {
      throw new Error(`Failed to fetch attempts: ${attemptsError.message}`)
    }

    let filteredAttempts = attempts || []

    // Apply date range filter
    if (filters?.date_range) {
      filteredAttempts = filteredAttempts.filter(attempt => {
        const attemptDate = new Date(attempt.created_at)
        return attemptDate >= new Date(filters.date_range!.start) && 
               attemptDate <= new Date(filters.date_range!.end)
      })
    }

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

    // Calculate retention rate
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const recentAttempts = filteredAttempts.filter(a => 
      new Date(a.created_at) >= thirtyDaysAgo
    )

    const retentionRate = recentAttempts.length > 0 
      ? (recentAttempts.filter(a => a.is_correct).length / recentAttempts.length) * 100
      : 0

    // Calculate review streak
    const sortedAttempts = filteredAttempts.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )

    let reviewStreak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const attempt of sortedAttempts) {
      const attemptDate = new Date(attempt.created_at)
      attemptDate.setHours(0, 0, 0, 0)

      if (attemptDate.getTime() === currentDate.getTime()) {
        reviewStreak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (attemptDate.getTime() < currentDate.getTime()) {
        break
      }
    }

    // Cards reviewed today
    const today = new Date().toISOString().split('T')[0]
    const cardsReviewedToday = filteredAttempts.filter(a => 
      a.created_at.startsWith(today)
    ).length

    return {
      total_cards: totalCards,
      active_cards: activeCards,
      cards_due_today: cardsDueToday,
      cards_overdue: overdueCards,
      average_ease_factor: averageEaseFactor,
      retention_rate: retentionRate,
      cards_reviewed_today: cardsReviewedToday,
      streak_days: reviewStreak
    }
  }

  // Get goal analytics
  static async getGoalAnalytics(userId: string, filters?: AnalyticsFilters): Promise<GoalAnalytics> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch goals: ${error.message}`)
    }

    let filteredGoals = goals || []

    // Apply date range filter
    if (filters?.date_range) {
      filteredGoals = filteredGoals.filter(goal => {
        const goalDate = new Date(goal.created_at)
        return goalDate >= new Date(filters.date_range!.start) && 
               goalDate <= new Date(filters.date_range!.end)
      })
    }

    // Apply goal type filter
    if (filters?.goal_types && filters.goal_types.length > 0) {
      filteredGoals = filteredGoals.filter(goal => 
        filters.goal_types!.includes(goal.goal_type)
      )
    }

    const totalGoals = filteredGoals.length
    const activeGoals = filteredGoals.filter(g => g.status === 'active').length
    const completedGoals = filteredGoals.filter(g => g.status === 'completed').length
    const overdueGoals = filteredGoals.filter(g => {
      if (!g.deadline || g.status !== 'active') return false
      return new Date(g.deadline) < new Date()
    }).length

    const completionRate = totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0

    const averageProgress = activeGoals > 0 
      ? filteredGoals.filter(g => g.status === 'active').reduce((sum, g) => {
          const progress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0
          return sum + progress
        }, 0) / activeGoals
      : 0

    // Goals on track vs behind
    const goalsOnTrack = filteredGoals.filter(g => {
      if (g.status !== 'active' || !g.deadline) return false
      const deadline = new Date(g.deadline)
      const now = new Date()
      const daysSinceCreated = Math.ceil((now.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const daysRemaining = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      const expectedProgress = daysSinceCreated / (daysSinceCreated + daysRemaining) * 100
      const actualProgress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0
      return actualProgress >= expectedProgress
    }).length

    const goalsBehind = activeGoals - goalsOnTrack

    return {
      total_goals: totalGoals,
      active_goals: activeGoals,
      completed_goals: completedGoals,
      overdue_goals: overdueGoals,
      completion_rate: completionRate,
      average_progress: averageProgress,
      goals_on_track: goalsOnTrack,
      goals_behind: goalsBehind
    }
  }

  // Get time series data for charts
  static async getTimeSeriesData(userId: string, type: 'study_time' | 'questions' | 'goals', days: number = 30): Promise<TimeSeriesData[]> {
    const endDate = new Date()
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    switch (type) {
      case 'study_time':
        return this.getStudyTimeSeriesData(userId, startDate, endDate)
      case 'questions':
        return this.getQuestionTimeSeriesData(userId, startDate, endDate)
      case 'goals':
        return this.getGoalTimeSeriesData(userId, startDate, endDate)
      default:
        return []
    }
  }

  private static async getStudyTimeSeriesData(userId: string, startDate: Date, endDate: Date): Promise<TimeSeriesData[]> {
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('started_at, duration_minutes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', startDate.toISOString())
      .lte('started_at', endDate.toISOString())

    if (error) {
      throw new Error(`Failed to fetch study time series data: ${error.message}`)
    }

    const dailyData: Record<string, number> = {}

    sessions?.forEach(session => {
      const date = new Date(session.started_at).toISOString().split('T')[0]
      dailyData[date] = (dailyData[date] || 0) + session.duration_minutes
    })

    return Object.entries(dailyData)
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getQuestionTimeSeriesData(userId: string, startDate: Date, endDate: Date): Promise<TimeSeriesData[]> {
    const { data: attempts, error } = await supabase
      .from('question_attempts')
      .select('created_at, is_correct')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      throw new Error(`Failed to fetch question time series data: ${error.message}`)
    }

    const dailyData: Record<string, { total: number; correct: number }> = {}

    attempts?.forEach(attempt => {
      const date = new Date(attempt.created_at).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, correct: 0 }
      }
      dailyData[date].total++
      if (attempt.is_correct) {
        dailyData[date].correct++
      }
    })

    return Object.entries(dailyData)
      .map(([date, data]) => ({ 
        date, 
        value: data.total > 0 ? (data.correct / data.total) * 100 : 0 
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  private static async getGoalTimeSeriesData(userId: string, startDate: Date, endDate: Date): Promise<TimeSeriesData[]> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('created_at, current_value, target_value')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString())

    if (error) {
      throw new Error(`Failed to fetch goal time series data: ${error.message}`)
    }

    const dailyData: Record<string, { total: number; completed: number }> = {}

    goals?.forEach(goal => {
      const date = new Date(goal.created_at).toISOString().split('T')[0]
      if (!dailyData[date]) {
        dailyData[date] = { total: 0, completed: 0 }
      }
      dailyData[date].total++
      if (goal.current_value >= goal.target_value) {
        dailyData[date].completed++
      }
    })

    return Object.entries(dailyData)
      .map(([date, data]) => ({ 
        date, 
        value: data.total > 0 ? (data.completed / data.total) * 100 : 0 
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
  }

  // Get performance metrics
  static async getPerformanceMetrics(userId: string, filters?: AnalyticsFilters): Promise<PerformanceMetrics> {
    const [studyAnalytics, questionAnalytics, goalAnalytics] = await Promise.all([
      this.getStudyAnalytics(userId, filters),
      this.getQuestionAnalytics(userId, filters),
      this.getGoalAnalytics(userId, filters)
    ])

    // Calculate study efficiency (study time vs focus rating)
    const studyEfficiency = studyAnalytics.focus_rating_average > 0 
      ? Math.min((studyAnalytics.focus_rating_average / 5) * 100, 100)
      : 0

    // Calculate consistency score (based on streak and regularity)
    const consistencyScore = Math.min((studyAnalytics.study_streak / 30) * 100, 100)

    // Calculate improvement rate
    const improvementRate = questionAnalytics.improvement_trend

    // Calculate focus quality
    const focusQuality = studyAnalytics.focus_rating_average > 0 
      ? (studyAnalytics.focus_rating_average / 5) * 100
      : 0

    // Calculate overall score (weighted average)
    const overallScore = (
      studyEfficiency * 0.3 +
      consistencyScore * 0.25 +
      Math.max(improvementRate, 0) * 0.2 +
      focusQuality * 0.15 +
      goalAnalytics.completion_rate * 0.1
    )

    return {
      study_efficiency: studyEfficiency,
      consistency_score: consistencyScore,
      improvement_rate: improvementRate,
      focus_quality: focusQuality,
      overall_score: Math.min(overallScore, 100)
    }
  }

  // Generate chart data
  static generateChartData(timeSeriesData: TimeSeriesData[], label: string): ChartData {
    return {
      labels: timeSeriesData.map(d => d.date),
      datasets: [{
        label,
        data: timeSeriesData.map(d => d.value),
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 2
      }]
    }
  }
}
