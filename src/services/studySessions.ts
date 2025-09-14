import { supabase } from './supabase'
import type { 
  StudySession, 
  CreateStudySessionData, 
  UpdateStudySessionData,
  StudySessionStats,
  StudySessionAnalytics
} from '../types/study'

export class StudySessionService {
  // Create a new study session
  static async createStudySession(userId: string, sessionData: CreateStudySessionData): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .insert({
        user_id: userId,
        ...sessionData,
        status: 'active',
        started_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create study session: ${error.message}`)
    }

    return data
  }

  // Get study sessions for a user
  static async getStudySessions(userId: string, limit?: number): Promise<StudySession[]> {
    let query = supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch study sessions: ${error.message}`)
    }

    return data || []
  }

  // Update a study session
  static async updateStudySession(sessionId: string, updates: UpdateStudySessionData): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update study session: ${error.message}`)
    }

    return data
  }

  // Complete a study session
  static async completeStudySession(sessionId: string): Promise<StudySession> {
    const { data, error } = await supabase
      .from('study_sessions')
      .update({
        status: 'completed',
        ended_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to complete study session: ${error.message}`)
    }

    return data
  }

  // Delete a study session
  static async deleteStudySession(sessionId: string): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', sessionId)

    if (error) {
      throw new Error(`Failed to delete study session: ${error.message}`)
    }
  }

  // Get study session statistics
  static async getStudySessionStats(userId: string): Promise<StudySessionStats> {
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Failed to fetch study session stats: ${error.message}`)
    }

    const sessionsList = sessions || []
    const totalSessions = sessionsList.length
    const totalStudyTime = sessionsList.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const averageSessionDuration = totalSessions > 0 ? totalStudyTime / totalSessions : 0

    const focusRatings = sessionsList.filter(s => s.focus_rating).map(s => s.focus_rating!)
    const averageFocusRating = focusRatings.length > 0 
      ? focusRatings.reduce((sum, rating) => sum + rating, 0) / focusRatings.length 
      : 0

    // Calculate today's sessions
    const today = new Date().toISOString().split('T')[0]
    const sessionsToday = sessionsList.filter(s => s.started_at.startsWith(today))
    const studyTimeToday = sessionsToday.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)

    return {
      total_sessions: totalSessions,
      total_study_time: totalStudyTime,
      average_session_duration: averageSessionDuration,
      average_focus_rating: averageFocusRating,
      sessions_today: sessionsToday.length,
      study_time_today: studyTimeToday,
      longest_streak: 0, // Would need to calculate from daily sessions
      current_streak: 0, // Would need to calculate from daily sessions
      average_session_length: averageSessionDuration
    }
  }

  // Get study session analytics
  static async getStudySessionAnalytics(userId: string): Promise<StudySessionAnalytics> {
    const { data: sessions, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')

    if (error) {
      throw new Error(`Failed to fetch study session analytics: ${error.message}`)
    }

    const sessionsList = sessions || []

    // Group sessions by hour
    const sessionsByHour = Array.from({ length: 24 }, (_, hour) => ({
      hour,
      count: sessionsList.filter(s => new Date(s.started_at).getHours() === hour).length
    }))

    // Group sessions by day
    const sessionsByDay = sessionsList.reduce((acc, session) => {
      const date = session.started_at.split('T')[0]
      const existing = acc.find(item => item.date === date)
      if (existing) {
        existing.count++
        existing.duration += session.duration_minutes || 0
      } else {
        acc.push({
          date,
          count: 1,
          duration: session.duration_minutes || 0
        })
      }
      return acc
    }, [] as { date: string; count: number; duration: number }[])

    // Focus trends
    const focusTrends = sessionsList
      .filter(s => s.focus_rating)
      .map(s => ({
        date: s.started_at.split('T')[0],
        rating: s.focus_rating!
      }))

    // Calculate productivity score
    const totalTime = sessionsList.reduce((sum, s) => sum + (s.duration_minutes || 0), 0)
    const averageFocus = focusTrends.length > 0 
      ? focusTrends.reduce((sum, t) => sum + t.rating, 0) / focusTrends.length 
      : 0
    const productivityScore = Math.round((averageFocus / 5) * 100)

    return {
      sessions_by_hour: sessionsByHour,
      sessions_by_day: sessionsByDay,
      focus_trends: focusTrends,
      productivity_score: productivityScore
    }
  }

  // Get study sessions by subject
  static async getStudySessionsBySubject(userId: string, subjectId: string): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .eq('subject_id', subjectId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch study sessions by subject: ${error.message}`)
    }

    return data || []
  }

  // Get study sessions by date range
  static async getStudySessionsByDateRange(
    userId: string, 
    startDate: string, 
    endDate: string
  ): Promise<StudySession[]> {
    const { data, error } = await supabase
      .from('study_sessions')
      .select('*')
      .eq('user_id', userId)
      .gte('started_at', startDate)
      .lte('started_at', endDate)
      .order('started_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch study sessions by date range: ${error.message}`)
    }

    return data || []
  }

  // Get most productive hours
  static async getMostProductiveHours(userId: string): Promise<{ hour: number; count: number }[]> {
    const analytics = await this.getStudySessionAnalytics(userId)
    return analytics.sessions_by_hour.sort((a, b) => b.count - a.count)
  }

  // Get most productive days
  static async getMostProductiveDays(userId: string): Promise<{ date: string; count: number; duration: number }[]> {
    const analytics = await this.getStudySessionAnalytics(userId)
    return analytics.sessions_by_day.sort((a, b) => b.duration - a.duration)
  }
}