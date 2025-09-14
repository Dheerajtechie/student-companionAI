import { create } from 'zustand'
import { GoalService } from '../services/goals'
import type { 
  Goal, 
  CreateGoalData, 
  UpdateGoalData
} from '../types/goals'

interface GoalState {
  goals: Goal[]
  selectedGoal: Goal | null
  isLoading: boolean
  error: string | null
}

interface GoalActions {
  // CRUD operations
  fetchGoals: () => Promise<void>
  fetchGoal: (id: string) => Promise<Goal | null>
  createGoal: (data: CreateGoalData) => Promise<Goal>
  updateGoal: (id: string, data: UpdateGoalData) => Promise<Goal>
  deleteGoal: (id: string) => Promise<void>
  
  // Goal management
  markGoalComplete: (id: string) => Promise<void>
  markGoalIncomplete: (id: string) => Promise<void>
  updateGoalProgress: (id: string, currentValue: number) => Promise<void>
  
  // Analytics
  getCompletedGoals: () => Goal[]
  getOverdueGoals: () => Goal[]
  getGoalsByType: (type: string) => Goal[]
  getGoalsByPriority: (priority: string) => Goal[]
  
  // State management
  setSelectedGoal: (goal: Goal | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  clearError: () => void
  
  // Local state updates
  addGoal: (goal: Goal) => void
  updateGoalInState: (id: string, updates: Partial<Goal>) => void
  removeGoal: (id: string) => void
}

type GoalStore = GoalState & GoalActions

export const useGoalStore = create<GoalStore>((set, get) => ({
  // Initial state
  goals: [],
  selectedGoal: null,
  isLoading: false,
  error: null,

  // CRUD operations
  fetchGoals: async (filters?: GoalFilters) => {
    const { user } = useAuthStore.getState()
    if (!user) return

    set({ isLoading: true, error: null })
    
    try {
      const goals = await GoalService.getGoals(user.id)
      set({ goals, isLoading: false })
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch goals', 
        isLoading: false 
      })
    }
  },

  fetchGoal: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      const goal = await GoalService.getGoal(id)
      set({ isLoading: false })
      return goal
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to fetch goal', 
        isLoading: false 
      })
      return null
    }
  },

  createGoal: async (data: CreateGoalData) => {
    const { user } = useAuthStore.getState()
    if (!user) throw new Error('User not authenticated')

    set({ isLoading: true, error: null })
    
    try {
      const goal = await GoalService.createGoal(user.id, data)
      
      // Update local state
      set(state => ({
        goals: [goal, ...state.goals],
        isLoading: false
      }))
      
      return goal
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to create goal', 
        isLoading: false 
      })
      throw error
    }
  },

  updateGoal: async (id: string, data: UpdateGoalData) => {
    set({ isLoading: true, error: null })
    
    try {
      const updatedGoal = await GoalService.updateGoal(id, data)
      
      // Update local state
      set(state => ({
        goals: state.goals.map(g => g.id === id ? updatedGoal : g),
        selectedGoal: state.selectedGoal?.id === id ? updatedGoal : state.selectedGoal,
        isLoading: false
      }))
      
      return updatedGoal
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to update goal', 
        isLoading: false 
      })
      throw error
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null })
    
    try {
      await GoalService.deleteGoal(id)
      
      // Update local state
      set(state => ({
        goals: state.goals.filter(g => g.id !== id),
        selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal,
        isLoading: false
      }))
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to delete goal', 
        isLoading: false 
      })
      throw error
    }
  },

  // Goal management
  markGoalComplete: async (id: string) => {
    try {
      await get().updateGoal(id, { 
        status: 'completed',
        current_value: get().goals.find(g => g.id === id)?.target_value || 0
      })
    } catch (error) {
      throw error
    }
  },

  markGoalIncomplete: async (id: string) => {
    try {
      await get().updateGoal(id, { status: 'active' })
    } catch (error) {
      throw error
    }
  },

  updateGoalProgress: async (id: string, currentValue: number) => {
    try {
      await get().updateGoal(id, { current_value: currentValue })
    } catch (error) {
      throw error
    }
  },

  // Analytics
  getCompletedGoals: () => {
    return get().goals.filter(goal => goal.status === 'completed')
  },

  getOverdueGoals: () => {
    const now = new Date()
    return get().goals.filter(goal => {
      if (!goal.deadline || goal.status === 'completed') return false
      return new Date(goal.deadline) < now
    })
  },

  getGoalsByType: (type: string) => {
    return get().goals.filter(goal => goal.goal_type === type)
  },

  getGoalsByPriority: (priority: string) => {
    return get().goals.filter(goal => goal.priority === priority)
  },

  // State management
  setSelectedGoal: (goal: Goal | null) => {
    set({ selectedGoal: goal })
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
  addGoal: (goal: Goal) => {
    set(state => ({
      goals: [goal, ...state.goals]
    }))
  },

  updateGoalInState: (id: string, updates: Partial<Goal>) => {
    set(state => ({
      goals: state.goals.map(g => g.id === id ? { ...g, ...updates } : g),
      selectedGoal: state.selectedGoal?.id === id ? { ...state.selectedGoal, ...updates } : state.selectedGoal
    }))
  },

  removeGoal: (id: string) => {
    set(state => ({
      goals: state.goals.filter(g => g.id !== id),
      selectedGoal: state.selectedGoal?.id === id ? null : state.selectedGoal
    }))
  }
}))

// Import auth store for user access
import { useAuthStore } from './authStore'
