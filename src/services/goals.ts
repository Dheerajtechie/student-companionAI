import { supabase } from './supabase'
import type { 
  Goal, 
  CreateGoalData, 
  UpdateGoalData, 
  GoalProgress, 
  GoalStats,
  Achievement,
  GoalTemplate
} from '../types/goals'
import type { Database } from '../types/database'

type GoalRow = Database['public']['Tables']['goals']['Row']
type GoalInsert = Database['public']['Tables']['goals']['Insert']
type GoalUpdate = Database['public']['Tables']['goals']['Update']

export class GoalService {
  // Get all goals for a user
  static async getGoals(userId: string): Promise<Goal[]> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching goals:', error)
      throw new Error('Failed to fetch goals')
    }

    return data as Goal[]
  }

  // Get a single goal by ID
  static async getGoal(id: string): Promise<Goal | null> {
    const { data, error } = await supabase
      .from('goals')
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching goal:', error)
      return null
    }

    return data as Goal
  }

  // Create a new goal
  static async createGoal(userId: string, goalData: CreateGoalData): Promise<Goal> {
    const insertData: GoalInsert = {
      user_id: userId,
      subject_id: goalData.subject_id,
      title: goalData.title,
      description: goalData.description,
      goal_type: goalData.goal_type,
      target_value: goalData.target_value,
      current_value: goalData.current_value || 0,
      unit: goalData.unit,
      deadline: goalData.deadline,
      priority: goalData.priority,
      status: goalData.status,
      is_smart_goal: goalData.is_smart_goal,
      smart_criteria: goalData.smart_criteria
    }

    const { data, error } = await supabase
      .from('goals')
      .insert(insertData)
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error creating goal:', error)
      throw new Error('Failed to create goal')
    }

    return data as Goal
  }

  // Update a goal
  static async updateGoal(id: string, updates: UpdateGoalData): Promise<Goal> {
    const updateData: GoalUpdate = {
      ...updates,
      updated_at: new Date().toISOString()
    }

    const { data, error } = await supabase
      .from('goals')
      .update(updateData)
      .eq('id', id)
      .select(`
        *,
        subjects (
          id,
          name,
          color,
          icon
        )
      `)
      .single()

    if (error) {
      console.error('Error updating goal:', error)
      throw new Error('Failed to update goal')
    }

    return data as Goal
  }

  // Delete a goal
  static async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting goal:', error)
      throw new Error('Failed to delete goal')
    }
  }

  // Update goal progress
  static async updateGoalProgress(id: string, progress: number): Promise<Goal> {
    const goal = await this.getGoal(id)
    if (!goal) {
      throw new Error('Goal not found')
    }

    const newCurrentValue = Math.min(progress, goal.target_value)
    const isCompleted = newCurrentValue >= goal.target_value

    return this.updateGoal(id, {
      current_value: newCurrentValue,
      status: isCompleted ? 'completed' : 'active'
    })
  }

  // Calculate goal progress percentage
  static calculateProgressPercentage(goal: Goal): number {
    const progressPercentage = goal.target_value > 0
      ? Math.min((goal.current_value / goal.target_value) * 100, 100)
      : 0

    return Math.round(progressPercentage)
  }

  // Check if goal is overdue
  static isGoalOverdue(goal: Goal): boolean {
    if (goal.deadline) {
      const deadline = new Date(goal.deadline)
      const now = new Date()
      const daysSinceCreated = Math.ceil((now.getTime() - new Date(goal.created_at).getTime()) / (1000 * 60 * 60 * 24))
      
      return deadline < now && goal.status === 'active'
    }
    return false
  }

  // Get goal progress data for analytics
  static async getGoalProgress(userId: string, goalId: string): Promise<GoalProgress[]> {
    const { data, error } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Error fetching goal progress:', error)
      return []
    }

    return data.map(progress => ({
      goal_id: goal.id,
      goal_title: goal.title,
      target_value: goal.target_value,
      current_value: goal.current_value,
      progress_percentage: this.calculateProgressPercentage(goal),
      is_overdue: this.isGoalOverdue(goal),
      created_at: progress.created_at
    }))
  }

  // Get goal statistics
  static async getGoalStats(userId: string): Promise<GoalStats> {
    const goals = await this.getGoals(userId)
    
    const activeGoals = goals?.filter(g => g.status === 'active').length || 0
    const completedGoals = goals?.filter(g => g.status === 'completed').length || 0
    
    const overdueGoals = goals?.filter(g => {
      if (!g.deadline || g.status !== 'active') return false
      return new Date(g.deadline) < new Date()
    }).length || 0

    const averageProgress = goals && goals.length > 0
      ? goals?.filter(g => g.status === 'active').reduce((sum, g) => {
          const progress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0
          return sum + progress
        }, 0) / activeGoals
      : 0

    const goalsOnTrack = goals?.filter(g => {
      if (g.status !== 'active' || !g.deadline) return false
      const deadline = new Date(g.deadline)
      const now = new Date()
      const daysSinceCreated = Math.ceil((now.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const totalDays = Math.ceil((deadline.getTime() - new Date(g.created_at).getTime()) / (1000 * 60 * 60 * 24))
      const expectedProgress = Math.min((daysSinceCreated / totalDays) * 100, 100)
      const actualProgress = g.target_value > 0 ? (g.current_value / g.target_value) * 100 : 0
      return actualProgress >= expectedProgress * 0.8 // 80% of expected progress
    }).length || 0

    const goalsByType = goals?.reduce((acc, g) => {
      acc[g.goal_type] = (acc[g.goal_type] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    const goalsByPriority = goals?.reduce((acc, g) => {
      acc[g.priority] = (acc[g.priority] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    return {
      total_goals: goals?.length || 0,
      active_goals: activeGoals,
      completed_goals: completedGoals,
      overdue_goals: overdueGoals,
      average_progress: Math.round(averageProgress),
      goals_on_track: goalsOnTrack,
      goals_by_type: goalsByType,
      goals_by_priority: goalsByPriority
    }
  }

  // Get goal templates
  static getGoalTemplates(): GoalTemplate[] {
    return [
      {
        id: 'study_time',
        title: 'Study Time Goal',
        description: 'Set a target for study hours',
        goal_type: 'study_time',
        unit: 'hours',
        default_target: 20,
        smart_criteria: {
          specific: 'Study for X hours',
          measurable: 'Track hours using study timer',
          achievable: 'Set realistic daily targets',
          relevant: 'Align with academic goals',
          time_bound: 'Set clear deadline'
        }
      },
      {
        id: 'questions_solved',
        title: 'Questions Solved',
        description: 'Complete a certain number of practice questions',
        goal_type: 'questions_solved',
        unit: 'questions',
        default_target: 100,
        smart_criteria: {
          specific: 'Solve X practice questions',
          measurable: 'Track completed questions',
          achievable: 'Set daily question targets',
          relevant: 'Improve subject knowledge',
          time_bound: 'Complete by exam date'
        }
      },
      {
        id: 'subjects_mastered',
        title: 'Subjects Mastered',
        description: 'Achieve mastery in specific subjects',
        goal_type: 'subjects_mastered',
        unit: 'subjects',
        default_target: 3,
        smart_criteria: {
          specific: 'Master X subjects',
          measurable: 'Track subject progress',
          achievable: 'Focus on core subjects',
          relevant: 'Academic success',
          time_bound: 'Complete by semester end'
        }
      }
    ]
  }

  // Get user achievements
  static getAchievements(userId: string): Achievement[] {
    // This would typically fetch from a database
    // For now, return static achievements
    return [
      {
        id: 'first_goal',
        title: 'First Goal',
        description: 'Created your first goal',
        icon: '🎯',
        unlocked_at: new Date().toISOString()
      },
      {
        id: 'goal_master',
        title: 'Goal Master',
        description: 'Completed 10 goals',
        icon: '🏆',
        unlocked_at: new Date().toISOString()
      }
    ]
  }
}