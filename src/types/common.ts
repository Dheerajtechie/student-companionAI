export interface ApiResponse<T = any> {
  data: T
  error?: string
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  has_more: boolean
}

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

export interface ColorOption {
  value: string
  label: string
  color: string
}

export interface IconOption {
  value: string
  label: string
  icon: string
}

export interface Notification {
  id: string
  title: string
  message: string
  type: 'info' | 'success' | 'warning' | 'error'
  is_read: boolean
  action_url?: string
  created_at: string
}

export interface LoadingState {
  isLoading: boolean
  error?: string
}

export interface FormState {
  isSubmitting: boolean
  isValid: boolean
  errors: Record<string, string>
  touched: Record<string, boolean>
}

export interface Theme {
  mode: 'light' | 'dark' | 'system'
  primary_color: string
  accent_color: string
}

export interface UserSettings {
  theme: Theme
  notifications: {
    email: boolean
    push: boolean
    study_reminders: boolean
    goal_achievements: boolean
    spaced_repetition: boolean
  }
  study: {
    pomodoro_duration: number
    short_break_duration: number
    long_break_duration: number
    auto_start_breaks: boolean
    sound_enabled: boolean
  }
  privacy: {
    share_analytics: boolean
    share_progress: boolean
  }
}

export interface BreadcrumbItem {
  label: string
  href?: string
  isActive?: boolean
}

export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: string
  children?: MenuItem[]
  isActive?: boolean
  isDisabled?: boolean
  badge?: string | number
}

export interface SearchResult<T = any> {
  id: string
  title: string
  description?: string
  type: string
  data: T
  score: number
}

export interface FilterOption {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'date' | 'range' | 'text'
  options?: SelectOption[]
  placeholder?: string
  min?: number
  max?: number
}

export interface SortOption {
  key: string
  label: string
  direction: 'asc' | 'desc'
}

export interface TableColumn<T = any> {
  key: keyof T
  label: string
  sortable?: boolean
  render?: (value: any, item: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

export interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
  children: React.ReactNode
}

export interface ToastOptions {
  title?: string
  description?: string
  type?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}
