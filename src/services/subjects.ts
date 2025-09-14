import { supabase } from './supabase'
import type { 
  Subject, 
  CreateSubjectData, 
  UpdateSubjectData,
  SubjectStats,
  SubjectProgress
} from '../types/subjects'

export class SubjectService {
  // Create a new subject
  static async createSubject(userId: string, subjectData: CreateSubjectData): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .insert({
        user_id: userId,
        ...subjectData,
        color: subjectData.color || '#3B82F6',
        icon: subjectData.icon || '📚',
        difficulty: subjectData.difficulty || 'beginner',
        target_hours: subjectData.target_hours || 0,
        completed_hours: 0,
        is_active: true
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create subject: ${error.message}`)
    }

    return data
  }

  // Get subjects for a user
  static async getSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch subjects: ${error.message}`)
    }

    return data || []
  }

  // Get active subjects for a user
  static async getActiveSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch active subjects: ${error.message}`)
    }

    return data || []
  }

  // Update a subject
  static async updateSubject(subjectId: string, updates: UpdateSubjectData): Promise<Subject> {
    const { data, error } = await supabase
      .from('subjects')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', subjectId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update subject: ${error.message}`)
    }

    return data
  }

  // Delete a subject
  static async deleteSubject(subjectId: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', subjectId)

    if (error) {
      throw new Error(`Failed to delete subject: ${error.message}`)
    }
  }

  // Update subject progress
  static async updateSubjectProgress(subjectId: string, additionalHours: number): Promise<Subject> {
    const { data: subject, error: fetchError } = await supabase
      .from('subjects')
      .select('*')
      .eq('id', subjectId)
      .single()

    if (fetchError) {
      throw new Error(`Failed to fetch subject: ${fetchError.message}`)
    }

    const newCompletedHours = (subject.completed_hours || 0) + additionalHours

    const { data, error } = await supabase
      .from('subjects')
      .update({
        completed_hours: newCompletedHours,
        updated_at: new Date().toISOString()
      })
      .eq('id', subjectId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update subject progress: ${error.message}`)
    }

    return data
  }

  // Get subject statistics
  static async getSubjectStats(userId: string): Promise<SubjectStats> {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch subject stats: ${error.message}`)
    }

    const subjectsList = subjects || []
    const totalSubjects = subjectsList.length
    const activeSubjects = subjectsList.filter(s => s.is_active).length
    const totalStudyHours = subjectsList.reduce((sum, s) => sum + (s.completed_hours || 0), 0)

    const difficultyValues = { beginner: 1, intermediate: 2, advanced: 3 }
    const averageDifficulty = totalSubjects > 0 
      ? subjectsList.reduce((sum, s) => sum + difficultyValues[s.difficulty], 0) / totalSubjects 
      : 0

    const completionRate = totalSubjects > 0 
      ? subjectsList.filter(s => s.completed_hours >= s.target_hours).length / totalSubjects 
      : 0

    return {
      total_subjects: totalSubjects,
      active_subjects: activeSubjects,
      total_study_hours: totalStudyHours,
      average_difficulty: averageDifficulty,
      completion_rate: completionRate,
      subjects_by_difficulty: {
        beginner: subjectsList.filter(s => s.difficulty === 'beginner').length,
        intermediate: subjectsList.filter(s => s.difficulty === 'intermediate').length,
        advanced: subjectsList.filter(s => s.difficulty === 'advanced').length
      }
    }
  }

  // Get subject progress
  static async getSubjectProgress(userId: string): Promise<SubjectProgress[]> {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          started_at,
          duration_minutes
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)

    if (error) {
      throw new Error(`Failed to fetch subject progress: ${error.message}`)
    }

    return (subjects || []).map(subject => {
      const sessions = subject.study_sessions || []
      const sessionsCount = sessions.length
      const lastStudied = sessions.length > 0 
        ? sessions.sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0].started_at
        : null

      const progressPercentage = subject.target_hours > 0 
        ? Math.round((subject.completed_hours / subject.target_hours) * 100)
        : 0

      const isOnTrack = progressPercentage >= 80 || (subject.target_hours === 0 && subject.completed_hours > 0)

      return {
        subject_id: subject.id,
        subject_name: subject.name,
        target_hours: subject.target_hours,
        completed_hours: subject.completed_hours,
        progress_percentage: progressPercentage,
        sessions_count: sessionsCount,
        last_studied: lastStudied,
        is_on_track: isOnTrack
      }
    })
  }

  // Bulk update subjects
  static async bulkUpdateSubjects(updates: { id: string; updates: UpdateSubjectData }[]): Promise<Subject[]> {
    const results = await Promise.all(
      updates.map(({ id, updates }) => this.updateSubject(id, updates))
    )
    return results
  }

  // Get subjects by difficulty
  static async getSubjectsByDifficulty(userId: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .eq('difficulty', difficulty)
      .eq('is_active', true)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to fetch subjects by difficulty: ${error.message}`)
    }

    return data || []
  }

  // Search subjects
  static async searchSubjects(userId: string, query: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select('*')
      .eq('user_id', userId)
      .ilike('name', `%${query}%`)
      .order('name', { ascending: true })

    if (error) {
      throw new Error(`Failed to search subjects: ${error.message}`)
    }

    return data || []
  }
}