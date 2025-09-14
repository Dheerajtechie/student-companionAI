import { supabase } from './supabase'
import type { 
  User, 
  Profile, 
  LoginCredentials, 
  RegisterCredentials, 
  PasswordResetRequest,
  StudyPreferences 
} from '../types/auth'

// Auth state change listener
let authStateChangeListener: ((user: User | null) => void) | null = null

export class EnhancedAuthService {
  private static instance: EnhancedAuthService
  private currentUser: User | null = null
  private isInitialized = false

  static getInstance(): EnhancedAuthService {
    if (!EnhancedAuthService.instance) {
      EnhancedAuthService.instance = new EnhancedAuthService()
    }
    return EnhancedAuthService.instance
  }

  static onAuthStateChange(callback: (user: User | null) => void) {
    authStateChangeListener = callback
  }

  constructor() {
    this.initializeAuth()
  }

  private async initializeAuth() {
    if (this.isInitialized) return

    try {
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('Auth state changed:', event, session?.user?.id)
          
          if (session?.user) {
            this.currentUser = await this.transformUser(session.user)
            authStateChangeListener?.(this.currentUser)
          } else {
            this.currentUser = null
            authStateChangeListener?.(null)
          }
        }
      )

      // Get initial session
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        this.currentUser = await this.transformUser(session.user)
      }

      this.isInitialized = true
    } catch (error) {
      console.error('Failed to initialize auth:', error)
    }
  }

  private async transformUser(supabaseUser: any): Promise<User> {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      full_name: supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at
    }
  }

  // Get current user with proper error handling
  async getCurrentUser(): Promise<User | null> {
    if (!this.isInitialized) {
      await this.initializeAuth()
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error) {
        console.error('Error getting current user:', error)
        return null
      }

      if (!user) {
        return null
      }

      return await this.transformUser(user)
    } catch (error) {
      console.error('Failed to get current user:', error)
      return null
    }
  }

  // Enhanced sign up with profile creation
  async signUp(credentials: RegisterCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.full_name,
            avatar_url: credentials.avatar_url
          }
        }
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'Failed to create user' }
      }

      // Create profile in database
      const profileData = {
        user_id: data.user.id,
        email: credentials.email,
        full_name: credentials.full_name,
        avatar_url: credentials.avatar_url,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        study_preferences: {
          pomodoro_duration: 25,
          short_break_duration: 5,
          long_break_duration: 15,
          daily_goal_hours: 2,
          preferred_study_times: ['morning', 'evening'],
          notification_enabled: true,
          dark_mode: false
        }
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)

      if (profileError) {
        console.warn('Failed to create profile:', profileError)
        // Don't fail signup if profile creation fails
      }

      const user = await this.transformUser(data.user)
      return { user, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Sign up failed' }
    }
  }

  // Enhanced sign in with session persistence
  async signIn(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      })

      if (error) {
        return { user: null, error: error.message }
      }

      if (!data.user) {
        return { user: null, error: 'Failed to sign in' }
      }

      const user = await this.transformUser(data.user)
      this.currentUser = user
      
      return { user, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { user: null, error: error instanceof Error ? error.message : 'Sign in failed' }
    }
  }

  // Enhanced sign out with cleanup
  async signOut(): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        return { error: error.message }
      }

      this.currentUser = null
      return { error: null }
    } catch (error) {
      console.error('Sign out error:', error)
      return { error: error instanceof Error ? error.message : 'Sign out failed' }
    }
  }

  // Password reset with proper error handling
  async requestPasswordReset(request: PasswordResetRequest): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
        redirectTo: `${window.location.origin}/reset-password`
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Password reset error:', error)
      return { error: error instanceof Error ? error.message : 'Password reset failed' }
    }
  }

  // Update password with session validation
  async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      })

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Password update error:', error)
      return { error: error instanceof Error ? error.message : 'Password update failed' }
    }
  }

  // Enhanced profile management
  async getProfile(userId: string): Promise<Profile> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) {
        throw new Error(`Failed to fetch profile: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Get profile error:', error)
      throw error
    }
  }

  async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile; error: string | null }> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select()
        .single()

      if (error) {
        return { profile: null as any, error: error.message }
      }

      return { profile: data, error: null }
    } catch (error) {
      console.error('Update profile error:', error)
      return { profile: null as any, error: error instanceof Error ? error.message : 'Profile update failed' }
    }
  }

  async updateStudyPreferences(userId: string, preferences: StudyPreferences): Promise<{ error: string | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          study_preferences: preferences,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)

      if (error) {
        return { error: error.message }
      }

      return { error: null }
    } catch (error) {
      console.error('Update study preferences error:', error)
      return { error: error instanceof Error ? error.message : 'Study preferences update failed' }
    }
  }


  // Get current user synchronously (from cache)
  getCurrentUserSync(): User | null {
    return this.currentUser
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null
  }
}

// Export singleton instance
export const enhancedAuthService = EnhancedAuthService.getInstance()
