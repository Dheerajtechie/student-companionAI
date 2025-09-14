import { supabase } from './supabase'
import type { 
  StudySession, 
  CreateStudySessionData, 
  UpdateStudySessionData, 
  StudySessionStats,
  StudySessionAnalytics
} from '../types/study'
import type { Database } from '../types/database'

type StudySessionRow = Database['public']['Tables']['study_sessions']['Row']
type StudySessionInsert = Database['public']['Tables']['study_sessions']['Insert']
type StudySessionUpdate = Database['public']['Tables']['study_sessions']['Update']

export class StudySessionService {
  // Get all study sessions for a user
  static async getStudySessions(userId: string, subjectId?: string): Promise<StudySession[]> {
    let query = supabase
      .from('study_sessions')
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
      .order('started_at', { ascending: false })

    if (subjectId) {
      query = query.eq('subject_id', subjectId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching study sessions:', error)
      throw new Error('Failed to fetch study sessions')
    }

    return data as StudySession[]
  }

  // Get a single study session by ID
  static async getStudySession(id: string): Promise<StudySession | null> {
    const { data, error } = await supabase
      .from('study_sessions')
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
      console.error('Error fetching study session:', error)
      return null
    }

    return data as StudySession
  }

  // Create a new study session
  static async createStudySession(userId: string, sessionData: CreateStudySessionData): Promise<StudySession> {
    const insertData: StudySessionInsert = {
      user_id: userId,
      subject_id: sessionData.subject_id,
      title: sessionData.title,
      description: sessionData.description,
      duration_minutes: sessionData.duration_minutes,
      focus_rating: sessionData.focus_rating,
      notes: sessionData.notes,
      status: sessionData.status,
      started_at: sessionData.started_at
    }

    const { data, error } = await supabase
      .from('study_sessions')
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
      console.error('Error creating study session:', error)
      throw new Error('Failed to create study session')
    }

    return data as StudySession
  }

  // Update a study session
  static async updateStudySession(id: string, updates: UpdateStudySessionData): Promise<StudySession> {
    const updateData: StudySessionUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('study_sessions')
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
      console.error('Error updating study session:', error)
      throw new Error('Failed to update study session')
    }

    return data as StudySession
  }

  // Delete a study session
  static async deleteStudySession(id: string): Promise<void> {
    const { error } = await supabase
      .from('study_sessions')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting study session:', error)
      throw new Error('Failed to delete study session')
    }
  }

  // Start a study session
  static async startStudySession(userId: string, subjectId: string, title: string): Promise<StudySession> {
    return this.createStudySession(userId, {
      subject_id: subjectId,
      title,
      description: null,
      duration_minutes: 0,
      focus_rating: null,
      notes: null,
      status: 'active',
      started_at: new Date().toISOString()
    })
  }

  // End a study session
  static async endStudySession(id: string, durationMinutes: number, focusRating?: number, notes?: string): Promise<StudySession> {
    return this.updateStudySession(id, {
      status: 'completed',
      duration_minutes: durationMinutes,
      focus_rating: focusRating,
      notes,
      ended_at: new Date().toISOString()
    })
  }

  // Pause a study session
  static async pauseStudySession(id: string): Promise<StudySession> {
    return this.updateStudySession(id, {
      status: 'paused'
    })
  }

  // Resume a study session
  static async resumeStudySession(id: string): Promise<StudySession> {
    return this.updateStudySession(id, {
      status: 'active'
    })
  }

  // Get study session statistics
  static async getStudySessionStats(userId: string): Promise<StudySessionStats> {
    const sessions = await this.getStudySessions(userId)
    
    const totalSessions = sessions?.length || 0
    const totalStudyTime = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0
    const averageSessionLength = totalSessions > 0 ? totalStudyTime / totalSessions : 0
    
    const focusRatings = sessions?.filter(s => s.focus_rating).map(s => s.focus_rating!) || []
    const averageFocusRating = focusRatings.length > 0 
      ? focusRatings.reduce((sum, rating) => sum + rating, 0) / focusRatings.length 
      : 0

    const today = new Date().toISOString().split('T')[0]
    const sessionsToday = sessions?.filter(s => s.started_at.startsWith(today)) || []
    const studyTimeToday = sessionsToday.reduce((sum, s) => sum + s.duration_minutes, 0)

    const recentSessions = sessions?.sort((a, b) => 
      new Date(b.started_at).getTime() - new Date(a.started_at).getTime()
    ).slice(0, 5) || []

    return {
      total_sessions: totalSessions,
      total_study_time: totalStudyTime,
      average_session_length: Math.round(averageSessionLength),
      average_focus_rating: Math.round(averageFocusRating * 10) / 10,
      sessions_today: sessionsToday.length,
      study_time_today: studyTimeToday,
      recent_sessions: recentSessions
    }
  }

  // Get study session analytics
  static async getStudySessionAnalytics(userId: string, days: number = 30): Promise<StudySessionAnalytics> {
    const sessions = await this.getStudySessions(userId)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - days)
    
    const recentSessions = sessions?.filter(s => 
      new Date(s.started_at) >= cutoffDate
    ) || []

    // Daily study time
    const dailyStudyTime = recentSessions.reduce((acc, session) => {
      const sessionDate = session.started_at.split('T')[0]
      acc[sessionDate] = (acc[sessionDate] || 0) + session.duration_minutes
      return acc
    }, {} as Record<string, number>)

    // Subject-wise study time
    const subjectStudyTime = recentSessions.reduce((acc, session) => {
      const subjectName = session.subjects?.name || 'Unknown'
      acc[subjectName] = (acc[subjectName] || 0) + session.duration_minutes
      return acc
    }, {} as Record<string, number>)

    // Weekly study time
    const weeklyStudyTime = recentSessions.reduce((acc, session) => {
      const weekStart = new Date(session.started_at)
      weekStart.setDate(weekStart.getDate() - weekStart.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]
      acc[weekKey] = (acc[weekKey] || 0) + session.duration_minutes
      return acc
    }, {} as Record<string, number>)

    // Hourly study patterns
    const hourlyStudyTime = recentSessions.reduce((acc, session) => {
      const hour = new Date(session.started_at).getHours()
      hourlyData[hour] = (hourlyData[hour] || 0) + session.duration_minutes
      return acc
    }, {} as Record<number, number>)

    // Focus rating trends
    const focusTrends = recentSessions
      .filter(s => s.focus_rating)
      .map(s => ({
        date: s.started_at.split('T')[0],
        focus_rating: s.focus_rating!,
        duration: s.duration_minutes
      }))

    return {
      daily_study_time: dailyStudyTime,
      subject_study_time: subjectStudyTime,
      weekly_study_time: weeklyStudyTime,
      hourly_study_time: hourlyStudyTime,
      focus_trends: focusTrends,
      total_study_time: recentSessions.reduce((sum, s) => sum + s.duration_minutes, 0),
      average_daily_study_time: Math.round(
        recentSessions.reduce((sum, s) => sum + s.duration_minutes, 0) / days
      )
    }
  }

  // Get study streaks
  static async getStudyStreaks(userId: string): Promise<{ current: number; longest: number }> {
    const sessions = await this.getStudySessions(userId)
    const studyDays = new Set(
      sessions?.map(s => s.started_at.split('T')[0]) || []
    )

    const sortedDays = Array.from(studyDays).sort().reverse()
    let currentStreak = 0
    let longestStreak = 0
    let tempStreak = 0

    for (let i = 0; i < sortedDays.length; i++) {
      const currentDay = new Date(sortedDays[i])
      const previousDay = i > 0 ? new Date(sortedDays[i - 1]) : null

      if (i === 0 || (previousDay && currentDay.getTime() - previousDay.getTime() === 24 * 60 * 60 * 1000)) {
        tempStreak++
        if (i === 0) currentStreak = tempStreak
      } else {
        longestStreak = Math.max(longestStreak, tempStreak)
        tempStreak = 1
        if (i === 0) currentStreak = tempStreak
      }
    }

    longestStreak = Math.max(longestStreak, tempStreak)

    return {
      current: currentStreak,
      longest: longestStreak
    }
  }

  // Get study goals progress
  static async getStudyGoalsProgress(userId: string): Promise<{
    daily_goal: { target: number; current: number; percentage: number }
    weekly_goal: { target: number; current: number; percentage: number }
  }> {
    const today = new Date().toISOString().split('T')[0]
    const weekStart = new Date()
    weekStart.setDate(weekStart.getDate() - weekStart.getDay())
    const weekStartStr = weekStart.toISOString().split('T')[0]

    const sessions = await this.getStudySessions(userId)
    
    const todaySessions = sessions?.filter(s => s.started_at.startsWith(today)) || []
    const weekSessions = sessions?.filter(s => s.started_at >= weekStartStr) || []

    const dailyStudyTime = todaySessions.reduce((sum, s) => sum + s.duration_minutes, 0)
    const weeklyStudyTime = weekSessions.reduce((sum, s) => sum + s.duration_minutes, 0)

    // Default goals (can be made configurable)
    const dailyGoal = 120 // 2 hours
    const weeklyGoal = 840 // 14 hours

    return {
      daily_goal: {
        target: dailyGoal,
        current: dailyStudyTime,
        percentage: Math.min((dailyStudyTime / dailyGoal) * 100, 100)
      },
      weekly_goal: {
        target: weeklyGoal,
        current: weeklyStudyTime,
        percentage: Math.min((weeklyStudyTime / weeklyGoal) * 100, 100)
      }
    }
  }
}