import { create } from 'zustand'
import { StudySessionService } from '../services/studySessions'
import type { 
  StudySession, 
  CreateStudySessionData, 
  UpdateStudySessionData, 
  StudySessionStats,
  StudyTimer,
  PomodoroSettings 
} from '../types/study'

interface StudySessionState {
  sessions: StudySession[]
  activeSession: StudySession | null
  isLoading: boolean
  error: string | null
  stats: StudySessionStats | null
  timer: StudyTimer
  pomodoroSettings: PomodoroSettings
}

interface StudySessionActions {
  // CRUD operations
  fetchSessions: (limit?: number) => Promise<void>
  fetchSessionsBySubject: (subjectId: string) => Promise<void>
  fetchSessionsByDateRange: (startDate: string, endDate: string) => Promise<void>
  createSession: (data: CreateStudySessionData) => Promise<StudySession>
  updateSession: (id: string, data: UpdateStudySessionData) => Promise<StudySession>
  deleteSession: (id: string) => Promise<void>
  
  // Session management
  startSession: (data: CreateStudySessionData) => Promise<StudySession>
  pauseSession: (id: string) => Promise<void>
  resumeSession: (id: string) => Promise<void>
  completeSession: (id: string, focusRating?: number, notes?: string) => Promise<void>
  cancelSession: (id: string) => Promise<void>
  
  // Analytics
  fetchStats: () => Promise<void>
  fetchSessionsForAnalytics: (startDate: string, endDate: string) => Promise<StudySession[]>
  getMostProductiveHours: () => Promise<{ hour: number; totalMinutes: number }[]>
  getMostProductiveDays: () => Promise<{ day: string; totalMinutes: number }[]>
  
  // Timer management
  startTimer: (sessionType: 'study' | 'short_break' | 'long_break') => void
  pauseTimer: () => void
  resumeTimer: () => void
  stopTimer: () => void
  resetTimer: () => void
  updateTimerSettings: (settings: Partial<PomodoroSettings>) => void
  
  // State management
  setActiveSession: (session: StudySession | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Local state updates
  addSession: (session: StudySession) => void
  updateSessionInState: (id: string, updates: Partial<StudySession>) => void
  removeSession: (id: string) => void
}

type StudySessionStore = StudySessionState & StudySessionActions

const defaultPomodoroSettings: PomodoroSettings = {
  study_duration: 25,
  short_break_duration: 5,
  long_break_duration: 15,
  sessions_until_long_break: 4,
  auto_start_breaks: false,
  auto_start_sessions: false,
  sound_enabled: true
}

const defaultTimer: StudyTimer = {
  isRunning: false,
  isPaused: false,
  timeRemaining: 0,
  sessionType: 'study',
  currentSession: null,
  completedSessions: 0,
  totalStudyTime: 0
}

export const useStudySessionStore = create<StudySessionStore>((set, get) => ({
  // Initial state
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  stats: null,
  timer: { ...defaultTimer },
  pomodoroSettings: { ...defaultPomodoroSettings },

  // CRUD operations
  fetchSessions: async (limit = 50) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const sessions = await StudySessionService.getStudySessions(user.id, limit)
      set({ sessions, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch study sessions', 
        isLoading: false 
      })
    }
  },

  fetchSessionsBySubject: async (subjectId: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const sessions = await StudySessionService.getStudySessionsBySubject(user.id, subjectId)
      set({ sessions, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch study sessions by subject', 
        isLoading: false 
      })
    }
  },

  fetchSessionsByDateRange: async (startDate: string, endDate: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const sessions = await StudySessionService.getStudySessionsByDateRange(user.id, startDate, endDate)
      set({ sessions, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch study sessions by date range', 
        isLoading: false 
      })
    }
  },

  createSession: async (data: CreateStudySessionData) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const session = await StudySessionService.createStudySession(user.id, data)
      
      // Update local state
      set(state => ({
        sessions: [session, ...state.sessions],
        isLoading: false
      }))
      
      return session
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create study session', 
        isLoading: false 
      })
      throw error
    }
  },

  updateSession: async (id: string, data: UpdateStudySessionData) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedSession = await StudySessionService.updateStudySession(id, data)
      
      // Update local state
      set(state => ({
        sessions: state.sessions.map(s => s.id === id ? updatedSession : s),
        activeSession: state.activeSession?.id === id ? updatedSession : state.activeSession,
        isLoading: false
      }))
      
      return updatedSession
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update study session', 
        isLoading: false 
      })
      throw error
    }
  },

  deleteSession: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await StudySessionService.deleteStudySession(id)
      
      // Update local state
      set(state => ({
        sessions: state.sessions.filter(s => s.id !== id),
        activeSession: state.activeSession?.id === id ? null : state.activeSession,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete study session', 
        isLoading: false 
      })
      throw error
    }
  },

  // Session management
  startSession: async (data: CreateStudySessionData) => {
    try {
      const session = await get().createSession(data)
      set({ activeSession: session })
      return session
    } catch (error) {
      throw error
    }
  },

  pauseSession: async (id: string) => {
    try {
      await get().updateSession(id, { status: 'paused' })
    } catch (error) {
      throw error
    }
  },

  resumeSession: async (id: string) => {
    try {
      await get().updateSession(id, { status: 'active' })
    } catch (error) {
      throw error
    }
  },

  completeSession: async (id: string, focusRating?: number, notes?: string) => {
    try {
      await StudySessionService.completeStudySession(id, focusRating, notes)
      
      // Update local state
      set(state => ({
        sessions: state.sessions.map(s => 
          s.id === id 
            ? { ...s, status: 'completed', ended_at: new Date().toISOString(), focus_rating: focusRating, notes }
            : s
        ),
        activeSession: state.activeSession?.id === id ? null : state.activeSession
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to complete study session'
      })
      throw error
    }
  },

  cancelSession: async (id: string) => {
    try {
      await get().updateSession(id, { 
        status: 'cancelled',
        ended_at: new Date().toISOString()
      })
      
      set(state => ({
        activeSession: state.activeSession?.id === id ? null : state.activeSession
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
      const stats = await StudySessionService.getStudySessionStats(user.id)
      set({ stats, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch study session stats', 
        isLoading: false 
      })
    }
  },

  fetchSessionsForAnalytics: async (startDate: string, endDate: string) => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    set({ isLoading: true, error: null })
    
    try {
      const sessions = await StudySessionService.getStudySessionsForAnalytics(user.id, startDate, endDate)
      set({ isLoading: false })
      return sessions
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch sessions for analytics', 
        isLoading: false 
      })
      return []
    }
  },

  getMostProductiveHours: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    try {
      return await StudySessionService.getMostProductiveHours(user.id)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get most productive hours'
      })
      return []
    }
  },

  getMostProductiveDays: async () => {
    const { user } = useAuthStore.getState()
    if (!user) return []

    try {
      return await StudySessionService.getMostProductiveDays(user.id)
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to get most productive days'
      })
      return []
    }
  },

  // Timer management
  startTimer: (sessionType: 'study' | 'short_break' | 'long_break') => {
    const { pomodoroSettings } = get()
    let duration = 0

    switch (sessionType) {
      case 'study':
        duration = pomodoroSettings.study_duration * 60
        break
      case 'short_break':
        duration = pomodoroSettings.short_break_duration * 60
        break
      case 'long_break':
        duration = pomodoroSettings.long_break_duration * 60
        break
    }

    set(state => ({
      timer: {
        ...state.timer,
        isRunning: true,
        isPaused: false,
        timeRemaining: duration,
        sessionType
      }
    }))
  },

  pauseTimer: () => {
    set(state => ({
      timer: {
        ...state.timer,
        isRunning: false,
        isPaused: true
      }
    }))
  },

  resumeTimer: () => {
    set(state => ({
      timer: {
        ...state.timer,
        isRunning: true,
        isPaused: false
      }
    }))
  },

  stopTimer: () => {
    set(state => ({
      timer: {
        ...state.timer,
        isRunning: false,
        isPaused: false,
        timeRemaining: 0
      }
    }))
  },

  resetTimer: () => {
    set({ timer: { ...defaultTimer } })
  },

  updateTimerSettings: (settings: Partial<PomodoroSettings>) => {
    set(state => ({
      pomodoroSettings: { ...state.pomodoroSettings, ...settings }
    }))
  },

  // State management
  setActiveSession: (session: StudySession | null) => {
    set({ activeSession: session })
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
  addSession: (session: StudySession) => {
    set(state => ({
      sessions: [session, ...state.sessions]
    }))
  },

  updateSessionInState: (id: string, updates: Partial<StudySession>) => {
    set(state => ({
      sessions: state.sessions.map(s => s.id === id ? { ...s, ...updates } : s),
      activeSession: state.activeSession?.id === id ? { ...state.activeSession, ...updates } : state.activeSession
    }))
  },

  removeSession: (id: string) => {
    set(state => ({
      sessions: state.sessions.filter(s => s.id !== id),
      activeSession: state.activeSession?.id === id ? null : state.activeSession
    }))
  }
}))

// Import auth store for user access
import { useAuthStore } from './authStore'