import { supabase } from './supabase'
import type { 
  User, 
  Profile, 
  LoginCredentials, 
  RegisterCredentials, 
  PasswordResetRequest,
  StudyPreferences 
} from '../types/auth'

export class AuthService {
  // Get current user
  static async getCurrentUser(): Promise<User | null> {
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) {
      return null
    }

    return {
      id: user.id,
      email: user.email || '',
      full_name: user.user_metadata?.full_name,
      avatar_url: user.user_metadata?.avatar_url,
      created_at: user.created_at,
      updated_at: user.updated_at || user.created_at
    }
  }

  // Get user profile
  static async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error || !data) {
      return null
    }

    return {
      id: data.id,
      user_id: data.user_id,
      email: data.email,
      full_name: data.full_name,
      avatar_url: data.avatar_url,
      timezone: data.timezone,
      study_preferences: data.study_preferences || {},
      created_at: data.created_at,
      updated_at: data.updated_at
    }
  }

  // Sign up with email and password
  static async signUp(credentials: RegisterCredentials): Promise<{ user: User | null; error: string | null }> {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          full_name: credentials.full_name
        }
      }
    })

    if (error) {
      return { user: null, error: error.message }
    }

    if (!data.user) {
      return { user: null, error: 'Failed to create user' }
    }

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: data.user.user_metadata?.full_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at
    }

    return { user, error: null }
  }

  // Sign in with email and password
  static async signIn(credentials: LoginCredentials): Promise<{ user: User | null; error: string | null }> {
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

    const user: User = {
      id: data.user.id,
      email: data.user.email || '',
      full_name: data.user.user_metadata?.full_name,
      avatar_url: data.user.user_metadata?.avatar_url,
      created_at: data.user.created_at,
      updated_at: data.user.updated_at || data.user.created_at
    }

    return { user, error: null }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.signOut()
    return { error: error?.message || null }
  }

  // Request password reset
  static async requestPasswordReset(request: PasswordResetRequest): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.resetPasswordForEmail(request.email, {
      redirectTo: `${window.location.origin}/reset-password`
    })

    return { error: error?.message || null }
  }

  // Update password
  static async updatePassword(newPassword: string): Promise<{ error: string | null }> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })

    return { error: error?.message || null }
  }

  // Update profile
  static async updateProfile(userId: string, updates: Partial<Profile>): Promise<{ profile: Profile | null; error: string | null }> {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        full_name: updates.full_name,
        avatar_url: updates.avatar_url,
        timezone: updates.timezone,
        study_preferences: updates.study_preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single()

    if (error) {
      return { profile: null, error: error.message }
    }

    return { profile: data, error: null }
  }

  // Update study preferences
  static async updateStudyPreferences(userId: string, preferences: StudyPreferences): Promise<{ error: string | null }> {
    const { error } = await supabase
      .from('profiles')
      .update({
        study_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)

    return { error: error?.message || null }
  }

  // Listen to auth state changes with comprehensive error handling
  static onAuthStateChange(callback: (user: User | null, event?: string) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      try {
        console.log('Auth state change:', event, session?.user?.id)
        
        if (session?.user) {
          const user: User = {
            id: session.user.id,
            email: session.user.email || '',
            full_name: session.user.user_metadata?.full_name,
            avatar_url: session.user.user_metadata?.avatar_url,
            created_at: session.user.created_at,
            updated_at: session.user.updated_at || session.user.created_at
          }
          
          // Auto-create profile if it doesn't exist
          if (event === 'SIGNED_IN') {
            await this.ensureProfileExists(user.id, user.email, user.full_name)
          }
          
          callback(user, event)
        } else {
          callback(null, event)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        callback(null, event)
      }
    })
  }

  // Ensure user profile exists in database
  static async ensureProfileExists(userId: string, email: string | null, fullName: string | null): Promise<void> {
    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', userId)
        .single()

      if (!existingProfile) {
        const { error } = await supabase
          .from('profiles')
          .insert({
            user_id: userId,
            email: email,
            full_name: fullName,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            study_preferences: {
              default_study_duration: 25,
              break_duration: 5,
              notifications_enabled: true,
              theme: 'system'
            }
          })

        if (error) {
          console.error('Failed to create profile:', error)
        } else {
          console.log('Profile created successfully for user:', userId)
        }
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession()
    return !!session
  }

  // Get session
  static async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession()
    return { session, error }
  }

  // Refresh session
  static async refreshSession() {
    const { data: { session }, error } = await supabase.auth.refreshSession()
    return { session, error }
  }
}