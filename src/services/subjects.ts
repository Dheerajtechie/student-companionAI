import { supabase } from './supabase'
import type { 
  Subject, 
  CreateSubjectData, 
  UpdateSubjectData, 
  SubjectStats,
  SubjectProgress
} from '../types/subjects'
import type { Database } from '../types/database'

type SubjectRow = Database['public']['Tables']['subjects']['Row']
type SubjectInsert = Database['public']['Tables']['subjects']['Insert']
type SubjectUpdate = Database['public']['Tables']['subjects']['Update']

export class SubjectService {
  // Get all subjects for a user
  static async getSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects:', error)
      throw new Error('Failed to fetch subjects')
    }

    return data as Subject[]
  }

  // Get a single subject by ID
  static async getSubject(id: string): Promise<Subject | null> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching subject:', error)
      return null
    }

    return data as Subject
  }

  // Create a new subject
  static async createSubject(userId: string, subjectData: CreateSubjectData): Promise<Subject> {
    const insertData: SubjectInsert = {
      user_id: userId,
      name: subjectData.name,
      description: subjectData.description,
      color: subjectData.color,
      icon: subjectData.icon,
      difficulty: subjectData.difficulty,
      target_hours: subjectData.target_hours
    }

    const { data, error } = await supabase
      .from('subjects')
      .insert(insertData)
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .single()

    if (error) {
      console.error('Error creating subject:', error)
      throw new Error('Failed to create subject')
    }

    return data as Subject
  }

  // Update a subject
  static async updateSubject(id: string, updates: UpdateSubjectData): Promise<Subject> {
    const updateData: SubjectUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('subjects')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .single()

    if (error) {
      console.error('Error updating subject:', error)
      throw new Error('Failed to update subject')
    }

    return data as Subject
  }

  // Delete a subject
  static async deleteSubject(id: string): Promise<void> {
    const { error } = await supabase
      .from('subjects')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting subject:', error)
      throw new Error('Failed to delete subject')
    }
  }

  // Update subject study hours
  static async updateStudyHours(id: string, additionalHours: number): Promise<Subject> {
    const subject = await this.getSubject(id)
    if (!subject) {
      throw new Error('Subject not found')
    }

    const newCompletedHours = subject.completed_hours + additionalHours
    return this.updateSubject(id, {
      completed_hours: newCompletedHours
    })
  }

  // Get subject statistics
  static async getSubjectStats(userId: string): Promise<SubjectStats> {
    const subjects = await this.getSubjects(userId)
    
    const totalSubjects = subjects?.length || 0
    const activeSubjects = subjects?.filter(s => s.is_active).length || 0
    const totalStudyHours = subjects?.reduce((sum, s) => sum + s.completed_hours, 0) || 0

    const subjectsByDifficulty = subjects?.reduce((acc, s) => {
      acc[s.difficulty] = (acc[s.difficulty] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const completionRate = totalSubjects > 0
      ? subjects?.filter(s => s.completed_hours >= s.target_hours).length / totalSubjects * 100
      : 0

    const averageProgress = totalSubjects > 0
      ? subjects?.reduce((sum, s) => {
          const progress = s.target_hours > 0 ? (s.completed_hours / s.target_hours) * 100 : 0
          return sum + progress
        }, 0) / totalSubjects
      : 0

    return {
      total_subjects: totalSubjects,
      active_subjects: activeSubjects,
      total_study_hours: totalStudyHours,
      subjects_by_difficulty: subjectsByDifficulty,
      completion_rate: Math.round(completionRate),
      average_progress: Math.round(averageProgress)
    }
  }

  // Get subject progress details
  static async getSubjectProgress(userId: string, subjectId?: string): Promise<SubjectProgress[]> {
    const subjects = await this.getSubjects(userId)
    const filteredSubjects = subjectId 
      ? subjects?.filter(s => s.id === subjectId) 
      : subjects

    if (!filteredSubjects) return []

    return filteredSubjects.map(subject => {
      const sessions = subject.study_sessions || []
      const lastStudyDate = sessions.length > 0
        ? sessions.sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())[0].started_at
        : null

      const progressPercentage = subject.target_hours > 0
        ? Math.min((subject.completed_hours / subject.target_hours) * 100, 100)
        : 0

      return {
        subject_id: subject.id,
        subject_name: subject.name,
        target_hours: subject.target_hours,
        completed_hours: subject.completed_hours,
        progress_percentage: Math.round(progressPercentage),
        last_study_date: lastStudyDate,
        is_on_track: progressPercentage >= 80,
        created_at: subject.created_at
      }
    })
  }

  // Search subjects
  static async searchSubjects(userId: string, searchTerm: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .eq('user_id', userId)
      .or(`name.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error searching subjects:', error)
      return []
    }

    return data as Subject[]
  }

  // Get subjects by difficulty
  static async getSubjectsByDifficulty(userId: string, difficulty: 'beginner' | 'intermediate' | 'advanced'): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('difficulty', difficulty)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching subjects by difficulty:', error)
      return []
    }

    return data as Subject[]
  }

  // Get active subjects
  static async getActiveSubjects(userId: string): Promise<Subject[]> {
    const { data, error } = await supabase
      .from('subjects')
      .select(`
        *,
        study_sessions (
          id,
          title,
          duration_minutes,
          started_at,
          status
        )
      `)
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active subjects:', error)
      return []
    }

    return data as Subject[]
  }

  // Archive a subject
  static async archiveSubject(id: string): Promise<Subject> {
    return this.updateSubject(id, {
      is_active: false
    })
  }

  // Restore a subject
  static async restoreSubject(id: string): Promise<Subject> {
    return this.updateSubject(id, {
      is_active: true
    })
  }
}