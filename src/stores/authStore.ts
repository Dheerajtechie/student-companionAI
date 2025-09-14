import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { EnhancedAuthService } from '../services/authEnhanced'
import type { User, Profile, LoginCredentials, RegisterCredentials, StudyPreferences } from '../types/auth'

interface AuthState {
  user: User | null
  profile: Profile | null
  isLoading: boolean
  isAuthenticated: boolean
  error: string | null
}

interface AuthActions {
  // Authentication actions
  signIn: (credentials: LoginCredentials) => Promise<void>
  signUp: (credentials: RegisterCredentials) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updatePassword: (newPassword: string) => Promise<void>
  
  // Profile actions
  loadProfile: (userId: string) => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  updateStudyPreferences: (preferences: StudyPreferences) => Promise<void>
  
  // State management
  setUser: (user: User | null) => void
  setProfile: (profile: Profile | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Initialization
  initialize: () => Promise<void>
}

type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      profile: null,
      isLoading: false,
      isAuthenticated: false,
      error: null,

      // Authentication actions
      signIn: async (credentials: LoginCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user, error } = await EnhancedAuthService.getInstance().signIn(credentials)
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            // Load profile after successful sign in
            await get().loadProfile(user.id)
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Sign in failed', isLoading: false })
          throw error
        }
      },

      signUp: async (credentials: RegisterCredentials) => {
        set({ isLoading: true, error: null })
        
        try {
          const { user, error } = await EnhancedAuthService.getInstance().signUp(credentials)
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          if (user) {
            set({ user, isAuthenticated: true, isLoading: false })
            // Load profile after successful sign up
            await get().loadProfile(user.id)
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Sign up failed', isLoading: false })
          throw error
        }
      },

      signOut: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await EnhancedAuthService.getInstance().signOut()
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false, 
            isLoading: false 
          })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Sign out failed', isLoading: false })
          throw error
        }
      },

      resetPassword: async (email: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await EnhancedAuthService.getInstance().requestPasswordReset({ email })
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          set({ isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Password reset failed', isLoading: false })
          throw error
        }
      },

      updatePassword: async (newPassword: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const { error } = await EnhancedAuthService.getInstance().updatePassword(newPassword)
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          set({ isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Password update failed', isLoading: false })
          throw error
        }
      },

      // Profile actions
      loadProfile: async (userId: string) => {
        set({ isLoading: true, error: null })
        
        try {
          const profile = await EnhancedAuthService.getInstance().getProfile(userId)
          set({ profile, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to load profile', isLoading: false })
          throw error
        }
      },

      updateProfile: async (updates: Partial<Profile>) => {
        const { user } = get()
        if (!user) {
          throw new Error('User not authenticated')
        }

        set({ isLoading: true, error: null })
        
        try {
          const { profile, error } = await EnhancedAuthService.getInstance().updateProfile(user.id, updates)
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          set({ profile, isLoading: false })
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update profile', isLoading: false })
          throw error
        }
      },

      updateStudyPreferences: async (preferences: StudyPreferences) => {
        const { user } = get()
        if (!user) {
          throw new Error('User not authenticated')
        }

        set({ isLoading: true, error: null })
        
        try {
          const { error } = await EnhancedAuthService.getInstance().updateStudyPreferences(user.id, preferences)
          
          if (error) {
            set({ error, isLoading: false })
            throw new Error(error)
          }

          // Update local profile state
          const { profile } = get()
          if (profile) {
            set({ 
              profile: { ...profile, study_preferences: preferences }, 
              isLoading: false 
            })
          }
        } catch (error) {
          set({ error: error instanceof Error ? error.message : 'Failed to update study preferences', isLoading: false })
          throw error
        }
      },

      // State management
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user })
      },

      setProfile: (profile: Profile | null) => {
        set({ profile })
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

      // Initialization
      initialize: async () => {
        set({ isLoading: true, error: null })
        
        try {
          const user = await EnhancedAuthService.getInstance().getCurrentUser()
          
          if (user) {
            set({ user, isAuthenticated: true })
            // Load profile
            await get().loadProfile(user.id)
          } else {
            set({ user: null, profile: null, isAuthenticated: false })
          }
        } catch (error) {
          console.error('Failed to initialize auth:', error)
          set({ 
            user: null, 
            profile: null, 
            isAuthenticated: false, 
            error: error instanceof Error ? error.message : 'Initialization failed' 
          })
        } finally {
          set({ isLoading: false })
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

// Subscribe to auth state changes
EnhancedAuthService.onAuthStateChange((user) => {
  useAuthStore.getState().setUser(user)
  if (user) {
    useAuthStore.getState().loadProfile(user.id)
  } else {
    useAuthStore.getState().setProfile(null)
  }
})