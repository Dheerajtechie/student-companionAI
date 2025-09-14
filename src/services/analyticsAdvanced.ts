import { supabase } from './supabase'
import type { Goal } from '../types'

export interface AdvancedAnalytics {
  overview: {
    totalStudyTime: number
    totalQuestionsAnswered: number
    averageAccuracy: number
    currentStreak: number
    weeklyGoalProgress: number
  }
  performance: {
    accuracyTrend: Array<{ date: string; accuracy: number }>
    studyTimeTrend: Array<{ date: string; minutes: number }>
    difficultyProgress: {
      beginner: { attempted: number; correct: number; accuracy: number }
      intermediate: { attempted: number; correct: number; accuracy: number }
      advanced: { attempted: number; correct: number; accuracy: number }
    }
    subjectBreakdown: Array<{
      subject: string
      studyTime: number
      questionsAnswered: number
      accuracy: number
      progress: number
    }>
  }
  insights: {
    learningPatterns: string[]
    recommendations: string[]
    strengths: string[]
    weaknesses: string[]
    optimalStudyTime: string
    peakPerformanceHours: Array<{ hour: number; performance: number }>
  }
  goals: {
    active: Goal[]
    completed: Goal[]
    progress: Array<{ goal: string; progress: number; target: number }>
  }
}

export class AdvancedAnalyticsService {
  // Get comprehensive analytics for user
  static async getAdvancedAnalytics(userId: string, timeRange: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<AdvancedAnalytics> {
    const dateRange = this.getDateRange(timeRange)
    
    const [
      overview,
      performance,
      insights,
      goals
    ] = await Promise.all([
      this.getOverviewAnalytics(userId, dateRange),
      this.getPerformanceAnalytics(userId, dateRange),
      this.getInsightsAnalytics(userId, dateRange),
      this.getGoalsAnalytics(userId, dateRange)
    ])

    return {
      overview,
      performance,
      insights,
      goals
    }
  }

  // Get overview statistics
  private static async getOverviewAnalytics(userId: string, dateRange: { start: string; end: string }) {
    const [studySessions, questionAttempts, goals] = await Promise.all([
      supabase
        .from('study_sessions')
        .select('duration_minutes, focus_rating')
        .eq('user_id', userId)
        .eq('status', 'completed')
        .gte('started_at', dateRange.start)
        .lte('started_at', dateRange.end),
      
      supabase
        .from('question_attempts')
        .select('is_correct')
        .eq('user_id', userId)
        .gte('created_at', dateRange.start)
        .lte('created_at', dateRange.end),
      
      supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
    ])

    const totalStudyTime = studySessions.data?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0
    const totalQuestionsAnswered = questionAttempts.data?.length || 0
    const correctAnswers = questionAttempts.data?.filter(attempt => attempt.is_correct).length || 0
    const averageAccuracy = totalQuestionsAnswered > 0 ? (correctAnswers / totalQuestionsAnswered) * 100 : 0

    // Calculate current streak
    const streak = await this.calculateStudyStreak(userId)
    
    // Calculate weekly goal progress
    const weeklyGoalProgress = await this.calculateWeeklyGoalProgress(userId)

    return {
      totalStudyTime,
      totalQuestionsAnswered,
      averageAccuracy: Math.round(averageAccuracy * 100) / 100,
      currentStreak: streak,
      weeklyGoalProgress
    }
  }

  // Get performance analytics
  private static async getPerformanceAnalytics(userId: string, dateRange: { start: string; end: string }) {
    const [accuracyTrend, studyTimeTrend, difficultyData, subjectData] = await Promise.all([
      this.getAccuracyTrend(userId, dateRange),
      this.getStudyTimeTrend(userId, dateRange),
      this.getDifficultyProgress(userId, dateRange),
      this.getSubjectBreakdown(userId, dateRange)
    ])

    return {
      accuracyTrend,
      studyTimeTrend,
      difficultyProgress: difficultyData,
      subjectBreakdown: subjectData
    }
  }

  // Get insights and recommendations
  private static async getInsightsAnalytics(userId: string, dateRange: { start: string; end: string }) {
    const [
      learningPatterns,
      recommendations,
      strengths,
      weaknesses,
      optimalStudyTime,
      peakPerformanceHours
    ] = await Promise.all([
      this.analyzeLearningPatterns(userId, dateRange),
      this.generateRecommendations(userId, dateRange),
      this.identifyStrengths(userId, dateRange),
      this.identifyWeaknesses(userId, dateRange),
      this.findOptimalStudyTime(userId, dateRange),
      this.getPeakPerformanceHours(userId, dateRange)
    ])

    return {
      learningPatterns,
      recommendations,
      strengths,
      weaknesses,
      optimalStudyTime,
      peakPerformanceHours
    }
  }

  // Get goals analytics
  private static async getGoalsAnalytics(userId: string, dateRange: { start: string; end: string }) {
    const { data: activeGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    const { data: completedGoals } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('updated_at', dateRange.start)
      .lte('updated_at', dateRange.end)

    const progress = activeGoals?.map(goal => ({
      goal: goal.title,
      progress: goal.current_value,
      target: goal.target_value
    })) || []

    return {
      active: activeGoals || [],
      completed: completedGoals || [],
      progress
    }
  }

  // Helper methods
  private static getDateRange(timeRange: string): { start: string; end: string } {
    const end = new Date()
    const start = new Date()
    
    switch (timeRange) {
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'quarter':
        start.setMonth(start.getMonth() - 3)
        break
      case 'year':
        start.setFullYear(start.getFullYear() - 1)
        break
      default:
        start.setMonth(start.getMonth() - 1)
    }

    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }

  private static async calculateStudyStreak(userId: string): Promise<number> {
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('started_at', { ascending: false })
      .limit(30)

    if (!sessions || sessions.length === 0) return 0

    let streak = 0
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < sessions.length; i++) {
      const sessionDate = new Date(sessions[i].started_at)
      sessionDate.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - sessionDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === streak) {
        streak++
        today.setDate(today.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  private static async calculateWeeklyGoalProgress(userId: string): Promise<number> {
    const { data: weeklyGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_type', 'study_time')
      .eq('status', 'active')
      .single()

    if (!weeklyGoal) return 0

    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    weekStart.setHours(0, 0, 0, 0)

    const { data: weeklySessions } = await supabase
      .from('study_sessions')
      .select('duration_minutes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', weekStart.toISOString())

    const weeklyTime = weeklySessions?.reduce((sum, session) => sum + session.duration_minutes, 0) || 0
    const targetMinutes = weeklyGoal.target_value * (weeklyGoal.unit === 'hours' ? 60 : 1)

    return targetMinutes > 0 ? Math.min(100, (weeklyTime / targetMinutes) * 100) : 0
  }

  private static async getAccuracyTrend(userId: string, dateRange: { start: string; end: string }): Promise<Array<{ date: string; accuracy: number }>> {
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('created_at, is_correct')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)
      .order('created_at', { ascending: true })

    // Group by date and calculate daily accuracy
    const dailyStats = new Map<string, { correct: number; total: number }>()
    
    attempts?.forEach(attempt => {
      const date = new Date(attempt.created_at).toISOString().split('T')[0]
      const existing = dailyStats.get(date) || { correct: 0, total: 0 }
      existing.total++
      if (attempt.is_correct) existing.correct++
      dailyStats.set(date, existing)
    })

    return Array.from(dailyStats.entries()).map(([date, stats]) => ({
      date,
      accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100 * 100) / 100 : 0
    }))
  }

  private static async getStudyTimeTrend(userId: string, dateRange: { start: string; end: string }): Promise<Array<{ date: string; minutes: number }>> {
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at, duration_minutes')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end)

    // Group by date
    const dailyStats = new Map<string, number>()
    
    sessions?.forEach(session => {
      const date = new Date(session.started_at).toISOString().split('T')[0]
      const existing = dailyStats.get(date) || 0
      dailyStats.set(date, existing + session.duration_minutes)
    })

    return Array.from(dailyStats.entries()).map(([date, minutes]) => ({
      date,
      minutes
    }))
  }

  private static async getDifficultyProgress(userId: string, dateRange: { start: string; end: string }) {
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select(`
        is_correct,
        questions (difficulty)
      `)
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    const difficultyStats = {
      beginner: { attempted: 0, correct: 0, accuracy: 0 },
      intermediate: { attempted: 0, correct: 0, accuracy: 0 },
      advanced: { attempted: 0, correct: 0, accuracy: 0 }
    }

    attempts?.forEach(attempt => {
      const difficulty = attempt.questions?.difficulty as keyof typeof difficultyStats
      if (difficulty && difficultyStats[difficulty]) {
        difficultyStats[difficulty].attempted++
        if (attempt.is_correct) {
          difficultyStats[difficulty].correct++
        }
      }
    })

    // Calculate accuracy for each difficulty
    Object.keys(difficultyStats).forEach(difficulty => {
      const stats = difficultyStats[difficulty as keyof typeof difficultyStats]
      stats.accuracy = stats.attempted > 0 ? Math.round((stats.correct / stats.attempted) * 100 * 100) / 100 : 0
    })

    return difficultyStats
  }

  private static async getSubjectBreakdown(userId: string, dateRange: { start: string; end: string }) {
    const { data: subjectData } = await supabase
      .from('subjects')
      .select(`
        id,
        name,
        completed_hours,
        questions (
          id,
          question_attempts (
            is_correct,
            created_at
          )
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    return subjectData?.map(subject => {
      const allAttempts = subject.questions?.flatMap(q => q.question_attempts || []) || []
      const recentAttempts = allAttempts.filter(attempt => 
        new Date(attempt.created_at) >= new Date(dateRange.start)
      )
      
      const correctAnswers = recentAttempts.filter(attempt => attempt.is_correct).length
      const totalAnswers = recentAttempts.length
      const accuracy = totalAnswers > 0 ? (correctAnswers / totalAnswers) * 100 : 0

      return {
        subject: subject.name,
        studyTime: subject.completed_hours * 60, // Convert to minutes
        questionsAnswered: totalAnswers,
        accuracy: Math.round(accuracy * 100) / 100,
        progress: Math.min(100, (subject.completed_hours / (subject.completed_hours + 10)) * 100) // Simplified progress
      }
    }) || []
  }

  private static async analyzeLearningPatterns(userId: string, dateRange: { start: string; end: string }): Promise<string[]> {
    const patterns: string[] = []
    
    // Analyze study time patterns
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at, duration_minutes, focus_rating')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end)

    if (sessions && sessions.length > 0) {
      const avgSessionLength = sessions.reduce((sum, s) => sum + s.duration_minutes, 0) / sessions.length
      const avgFocus = sessions.reduce((sum, s) => sum + (s.focus_rating || 3), 0) / sessions.length

      if (avgSessionLength > 45) {
        patterns.push('You prefer longer, focused study sessions')
      } else if (avgSessionLength < 20) {
        patterns.push('You prefer shorter, frequent study sessions')
      }

      if (avgFocus > 4) {
        patterns.push('You maintain high focus during study sessions')
      }
    }

    return patterns
  }

  private static async generateRecommendations(userId: string, dateRange: { start: string; end: string }): Promise<string[]> {
    const recommendations: string[] = []
    
    // Get current performance data
    const overview = await this.getOverviewAnalytics(userId, dateRange)
    
    if (overview.averageAccuracy < 70) {
      recommendations.push('Focus on reviewing incorrect answers to improve accuracy')
    }
    
    if (overview.totalStudyTime < 120) { // Less than 2 hours
      recommendations.push('Try to increase study time gradually for better retention')
    }
    
    if (overview.currentStreak < 3) {
      recommendations.push('Maintain a consistent daily study routine')
    }

    return recommendations
  }

  private static async identifyStrengths(userId: string, dateRange: { start: string; end: string }): Promise<string[]> {
    const strengths: string[] = []
    const difficultyData = await this.getDifficultyProgress(userId, dateRange)
    
    if (difficultyData.beginner.accuracy > 85) {
      strengths.push('Strong foundation in basic concepts')
    }
    
    if (difficultyData.intermediate.accuracy > 75) {
      strengths.push('Good grasp of intermediate topics')
    }
    
    if (difficultyData.advanced.accuracy > 65) {
      strengths.push('Excellent understanding of advanced concepts')
    }

    return strengths
  }

  private static async identifyWeaknesses(userId: string, dateRange: { start: string; end: string }): Promise<string[]> {
    const weaknesses: string[] = []
    const difficultyData = await this.getDifficultyProgress(userId, dateRange)
    
    if (difficultyData.beginner.accuracy < 70) {
      weaknesses.push('Review fundamental concepts')
    }
    
    if (difficultyData.intermediate.accuracy < 60) {
      weaknesses.push('Practice more intermediate-level problems')
    }
    
    if (difficultyData.advanced.accuracy < 50) {
      weaknesses.push('Focus on advanced topic comprehension')
    }

    return weaknesses
  }

  private static async findOptimalStudyTime(userId: string, dateRange: { start: string; end: string }): Promise<string> {
    const { data: sessions } = await supabase
      .from('study_sessions')
      .select('started_at, focus_rating')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .gte('started_at', dateRange.start)
      .lte('started_at', dateRange.end)

    if (!sessions || sessions.length === 0) return 'Not enough data'

    // Group by hour and calculate average focus
    const hourlyFocus = new Map<number, { total: number; count: number }>()
    
    sessions.forEach(session => {
      const hour = new Date(session.started_at).getHours()
      const existing = hourlyFocus.get(hour) || { total: 0, count: 0 }
      existing.total += session.focus_rating || 3
      existing.count++
      hourlyFocus.set(hour, existing)
    })

    let bestHour = 9 // Default to morning
    let bestFocus = 0

    hourlyFocus.forEach((stats, hour) => {
      const avgFocus = stats.total / stats.count
      if (avgFocus > bestFocus) {
        bestFocus = avgFocus
        bestHour = hour
      }
    })

    const timeStr = bestHour < 12 ? `${bestHour}:00 AM` : 
                   bestHour === 12 ? '12:00 PM' : 
                   `${bestHour - 12}:00 PM`

    return `${timeStr} (Average focus: ${Math.round(bestFocus * 10) / 10}/5)`
  }

  private static async getPeakPerformanceHours(userId: string, dateRange: { start: string; end: string }): Promise<Array<{ hour: number; performance: number }>> {
    const { data: attempts } = await supabase
      .from('question_attempts')
      .select('created_at, is_correct')
      .eq('user_id', userId)
      .gte('created_at', dateRange.start)
      .lte('created_at', dateRange.end)

    // Group by hour and calculate performance
    const hourlyPerformance = new Map<number, { correct: number; total: number }>()
    
    attempts?.forEach(attempt => {
      const hour = new Date(attempt.created_at).getHours()
      const existing = hourlyPerformance.get(hour) || { correct: 0, total: 0 }
      existing.total++
      if (attempt.is_correct) existing.correct++
      hourlyPerformance.set(hour, existing)
    })

    return Array.from(hourlyPerformance.entries())
      .map(([hour, stats]) => ({
        hour,
        performance: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100 * 100) / 100 : 0
      }))
      .sort((a, b) => b.performance - a.performance)
      .slice(0, 5) // Top 5 hours
  }
}

// Export singleton instance
export const analyticsService = new AdvancedAnalyticsService()
