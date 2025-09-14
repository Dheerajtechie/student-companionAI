import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserSettings, Theme } from '../types/common'

interface SettingsState {
  settings: UserSettings
  isLoading: boolean
  error: string | null
}

interface SettingsActions {
  // Settings management
  updateSettings: (updates: Partial<UserSettings>) => void
  updateTheme: (theme: Theme) => void
  updateNotifications: (notifications: Partial<UserSettings['notifications']>) => void
  updateStudySettings: (study: Partial<UserSettings['study']>) => void
  updatePrivacySettings: (privacy: Partial<UserSettings['privacy']>) => void
  
  // Theme management
  toggleTheme: () => void
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void
  setPrimaryColor: (color: string) => void
  setAccentColor: (color: string) => void
  
  // Notification management
  toggleEmailNotifications: () => void
  togglePushNotifications: () => void
  toggleStudyReminders: () => void
  toggleGoalAchievements: () => void
  toggleSpacedRepetition: () => void
  
  // Study settings
  updatePomodoroDuration: (duration: number) => void
  updateShortBreakDuration: (duration: number) => void
  updateLongBreakDuration: (duration: number) => void
  toggleAutoStartBreaks: () => void
  toggleSoundEnabled: () => void
  
  // Privacy settings
  toggleShareAnalytics: () => void
  toggleShareProgress: () => void
  
  // State management
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  resetSettings: () => void
}

type SettingsStore = SettingsState & SettingsActions

const defaultSettings: UserSettings = {
  theme: {
    mode: 'system',
    primary_color: '#3b82f6',
    accent_color: '#8b5cf6'
  },
  notifications: {
    email: true,
    push: true,
    study_reminders: true,
    goal_achievements: true,
    spaced_repetition: true
  },
  study: {
    pomodoro_duration: 25,
    short_break_duration: 5,
    long_break_duration: 15,
    auto_start_breaks: false,
    sound_enabled: true
  },
  privacy: {
    share_analytics: false,
    share_progress: false
  }
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set, get) => ({
      // Initial state
      settings: { ...defaultSettings },
      isLoading: false,
      error: null,

      // Settings management
      updateSettings: (updates: Partial<UserSettings>) => {
        set(state => ({
          settings: { ...state.settings, ...updates }
        }))
      },

      updateTheme: (theme: Theme) => {
        set(state => ({
          settings: { ...state.settings, theme }
        }))
      },

      updateNotifications: (notifications: Partial<UserSettings['notifications']>) => {
        set(state => ({
          settings: {
            ...state.settings,
            notifications: { ...state.settings.notifications, ...notifications }
          }
        }))
      },

      updateStudySettings: (study: Partial<UserSettings['study']>) => {
        set(state => ({
          settings: {
            ...state.settings,
            study: { ...state.settings.study, ...study }
          }
        }))
      },

      updatePrivacySettings: (privacy: Partial<UserSettings['privacy']>) => {
        set(state => ({
          settings: {
            ...state.settings,
            privacy: { ...state.settings.privacy, ...privacy }
          }
        }))
      },

      // Theme management
      toggleTheme: () => {
        const { settings } = get()
        const newMode = settings.theme.mode === 'light' ? 'dark' : 'light'
        get().setThemeMode(newMode)
      },

      setThemeMode: (mode: 'light' | 'dark' | 'system') => {
        set(state => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, mode }
          }
        }))
      },

      setPrimaryColor: (color: string) => {
        set(state => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, primary_color: color }
          }
        }))
      },

      setAccentColor: (color: string) => {
        set(state => ({
          settings: {
            ...state.settings,
            theme: { ...state.settings.theme, accent_color: color }
          }
        }))
      },

      // Notification management
      toggleEmailNotifications: () => {
        const { settings } = get()
        get().updateNotifications({ email: !settings.notifications.email })
      },

      togglePushNotifications: () => {
        const { settings } = get()
        get().updateNotifications({ push: !settings.notifications.push })
      },

      toggleStudyReminders: () => {
        const { settings } = get()
        get().updateNotifications({ study_reminders: !settings.notifications.study_reminders })
      },

      toggleGoalAchievements: () => {
        const { settings } = get()
        get().updateNotifications({ goal_achievements: !settings.notifications.goal_achievements })
      },

      toggleSpacedRepetition: () => {
        const { settings } = get()
        get().updateNotifications({ spaced_repetition: !settings.notifications.spaced_repetition })
      },

      // Study settings
      updatePomodoroDuration: (duration: number) => {
        get().updateStudySettings({ pomodoro_duration: duration })
      },

      updateShortBreakDuration: (duration: number) => {
        get().updateStudySettings({ short_break_duration: duration })
      },

      updateLongBreakDuration: (duration: number) => {
        get().updateStudySettings({ long_break_duration: duration })
      },

      toggleAutoStartBreaks: () => {
        const { settings } = get()
        get().updateStudySettings({ auto_start_breaks: !settings.study.auto_start_breaks })
      },

      toggleSoundEnabled: () => {
        const { settings } = get()
        get().updateStudySettings({ sound_enabled: !settings.study.sound_enabled })
      },

      // Privacy settings
      toggleShareAnalytics: () => {
        const { settings } = get()
        get().updatePrivacySettings({ share_analytics: !settings.privacy.share_analytics })
      },

      toggleShareProgress: () => {
        const { settings } = get()
        get().updatePrivacySettings({ share_progress: !settings.privacy.share_progress })
      },

      // State management
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },

      setError: (error: string | null) => {
        set({ error })
      },

      clearError: () => {
        set({ error: null })
      },

      resetSettings: () => {
        set({ settings: { ...defaultSettings } })
      }
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({
        settings: state.settings
      })
    }
  )
)

// Theme utilities
export const getThemeClass = (mode: 'light' | 'dark' | 'system') => {
  if (mode === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
  }
  return mode
}

export const applyTheme = (theme: Theme) => {
  const root = document.documentElement
  const themeClass = getThemeClass(theme.mode)
  
  // Remove existing theme classes
  root.classList.remove('light', 'dark')
  
  // Add new theme class
  root.classList.add(themeClass)
  
  // Set CSS custom properties for colors
  root.style.setProperty('--color-primary', theme.primary_color)
  root.style.setProperty('--color-accent', theme.accent_color)
}

// Listen for system theme changes
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
    const { settings } = useSettingsStore.getState()
    if (settings.theme.mode === 'system') {
      applyTheme(settings.theme)
    }
  })
}