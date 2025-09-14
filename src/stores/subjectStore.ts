import { create } from 'zustand'
import { SubjectService } from '../services/subjects'
import type { Subject, CreateSubjectData, UpdateSubjectData, SubjectStats, SubjectProgress } from '../types/subjects'

interface SubjectState {
  subjects: Subject[]
  activeSubjects: Subject[]
  selectedSubject: Subject | null
  isLoading: boolean
  error: string | null
  stats: SubjectStats | null
  progress: SubjectProgress[]
}

interface SubjectActions {
  // CRUD operations
  fetchSubjects: () => Promise<void>
  fetchActiveSubjects: () => Promise<void>
  createSubject: (data: CreateSubjectData) => Promise<Subject>
  updateSubject: (id: string, data: UpdateSubjectData) => Promise<Subject>
  deleteSubject: (id: string) => Promise<void>
  
  // Bulk operations
  bulkUpdateSubjects: (updates: Array<{ id: string; updates: UpdateSubjectData }>) => Promise<void>
  archiveSubject: (id: string) => Promise<void>
  restoreSubject: (id: string) => Promise<void>
  
  // Analytics
  fetchStats: () => Promise<void>
  fetchProgress: () => Promise<void>
  
  // Search and filtering
  searchSubjects: (query: string) => Promise<Subject[]>
  getSubjectsByDifficulty: (difficulty: string) => Promise<Subject[]>
  
  // State management
  setSelectedSubject: (subject: Subject | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Local state updates
  addSubject: (subject: Subject) => void
  updateSubjectInState: (id: string, updates: Partial<Subject>) => void
  removeSubject: (id: string) => void
}

type SubjectStore = SubjectState & SubjectActions

export const useSubjectStore = create<SubjectStore>((set, get) => ({
  // Initial state
  subjects: [],
  activeSubjects: [],
  selectedSubject: null,
  isLoading: false,
  error: null,
  stats: null,
  progress: [],

  // CRUD operations
  fetchSubjects: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const subjects = await SubjectService.getSubjects(user.id)
      set({ subjects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subjects', 
        isLoading: false 
      })
    }
  },

  fetchActiveSubjects: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const activeSubjects = await SubjectService.getActiveSubjects(user.id)
      set({ activeSubjects, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch active subjects', 
        isLoading: false 
      })
    }
  },

  createSubject: async (data: CreateSubjectData) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const subject = await SubjectService.createSubject(user.id, data)
      
      // Update local state
      set(state => ({
        subjects: [subject, ...state.subjects],
        activeSubjects: subject.is_active ? [subject, ...state.activeSubjects] : state.activeSubjects,
        isLoading: false
      }))
      
      return subject
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create subject', 
        isLoading: false 
      })
      throw error
    }
  },

  updateSubject: async (id: string, data: UpdateSubjectData) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedSubject = await SubjectService.updateSubject(id, data)
      
      // Update local state
      set(state => ({
        subjects: state.subjects.map(s => s.id === id ? updatedSubject : s),
        activeSubjects: state.activeSubjects.map(s => s.id === id ? updatedSubject : s),
        selectedSubject: state.selectedSubject?.id === id ? updatedSubject : state.selectedSubject,
        isLoading: false
      }))
      
      return updatedSubject
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update subject', 
        isLoading: false 
      })
      throw error
    }
  },

  deleteSubject: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await SubjectService.deleteSubject(id)
      
      // Update local state
      set(state => ({
        subjects: state.subjects.filter(s => s.id !== id),
        activeSubjects: state.activeSubjects.filter(s => s.id !== id),
        selectedSubject: state.selectedSubject?.id === id ? null : state.selectedSubject,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete subject', 
        isLoading: false 
      })
      throw error
    }
  },

  // Bulk operations
  bulkUpdateSubjects: async (updates: Array<{ id: string; updates: UpdateSubjectData }>) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedSubjects = await SubjectService.bulkUpdateSubjects(updates)
      
      // Update local state
      set(state => {
        const updatedSubjectsMap = new Map(updatedSubjects.map(s => [s.id, s]))
        
        return {
          subjects: state.subjects.map(s => updatedSubjectsMap.get(s.id) || s),
          activeSubjects: state.activeSubjects.map(s => updatedSubjectsMap.get(s.id) || s),
          isLoading: false
        }
      })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to bulk update subjects', 
        isLoading: false 
      })
      throw error
    }
  },

  archiveSubject: async (id: string) => {
    try {
      await get().updateSubject(id, { is_active: false })
    } catch (error) {
      throw error
    }
  },

  restoreSubject: async (id: string) => {
    try {
      const restoredSubject = await get().updateSubject(id, { is_active: true })
      
      // Add back to active subjects if not already there
      set(state => ({
        activeSubjects: state.activeSubjects.some(s => s.id === id) 
          ? state.activeSubjects 
          : [restoredSubject, ...state.activeSubjects]
      }))
    } catch (error) {
      throw error
    }
  },

  // Analytics
  fetchStats: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const stats = await SubjectService.getSubjectStats(user.id)
      set({ stats, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subject stats', 
        isLoading: false 
      })
    }
  },

  fetchProgress: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const progress = await SubjectService.getSubjectProgress(user.id)
      set({ progress, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subject progress', 
        isLoading: false 
      })
    }
  },

  // Search and filtering
  searchSubjects: async (query: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    set({ isLoading: true, error: null })
    
    try {
      const results = await SubjectService.searchSubjects(user.id, query)
      set({ isLoading: false })
      return results
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to search subjects', 
        isLoading: false 
      })
      return []
    }
  },

  getSubjectsByDifficulty: async (difficulty: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    set({ isLoading: true, error: null })
    
    try {
      const results = await SubjectService.getSubjectsByDifficulty(user.id, difficulty)
      set({ isLoading: false })
      return results
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch subjects by difficulty', 
        isLoading: false 
      })
      return []
    }
  },

  // State management
  setSelectedSubject: (subject: Subject | null) => {
    set({ selectedSubject: subject })
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
  addSubject: (subject: Subject) => {
    set(state => ({
      subjects: [subject, ...state.subjects],
      activeSubjects: subject.is_active ? [subject, ...state.activeSubjects] : state.activeSubjects
    }))
  },

  updateSubjectInState: (id: string, updates: Partial<Subject>) => {
    set(state => ({
      subjects: state.subjects.map(s => s.id === id ? { ...s, ...updates } : s),
      activeSubjects: state.activeSubjects.map(s => s.id === id ? { ...s, ...updates } : s),
      selectedSubject: state.selectedSubject?.id === id ? { ...state.selectedSubject, ...updates } : state.selectedSubject
    }))
  },

  removeSubject: (id: string) => {
    set(state => ({
      subjects: state.subjects.filter(s => s.id !== id),
      activeSubjects: state.activeSubjects.filter(s => s.id !== id),
      selectedSubject: state.selectedSubject?.id === id ? null : state.selectedSubject
    }))
  }
}))

// Import auth store for user access
import { useAuthStore } from './authStore'