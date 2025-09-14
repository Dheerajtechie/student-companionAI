import { supabase } from './supabase'
import type { 
  Goal, 
  CreateGoalData, 
  UpdateGoalData, 
  GoalProgress, 
  GoalStats, 
  GoalTemplate,
  Achievement,
  GoalFilters
} from '../types/goals'

export class GoalService {
  // Create a new goal
  static async createGoal(userId: string, goalData: CreateGoalData): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .insert({
        user_id: userId,
        ...goalData,
        current_value: 0,
        status: 'active'
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create goal: ${error.message}`)
    }

    return data
  }

  // Get goals for a user
  static async getGoals(userId: string, filters?: GoalFilters): Promise<Goal[]> {
    let query = supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (filters?.status) {
      query = query.eq('status', filters.status)
    }

    if (filters?.goal_type) {
      query = query.eq('goal_type', filters.goal_type)
    }

    if (filters?.subject_id) {
      query = query.eq('subject_id', filters.subject_id)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch goals: ${error.message}`)
    }

    return data || []
  }

  // Update a goal
  static async updateGoal(goalId: string, updates: UpdateGoalData): Promise<Goal> {
    const { data, error } = await supabase
      .from('goals')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', goalId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update goal: ${error.message}`)
    }

    return data
  }

  // Delete a goal
  static async deleteGoal(goalId: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', goalId)

    if (error) {
      throw new Error(`Failed to delete goal: ${error.message}`)
    }
  }

  // Get goal progress
  static async getGoalProgress(userId: string): Promise<GoalProgress[]> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')

    if (error) {
      throw new Error(`Failed to fetch goal progress: ${error.message}`)
    }

    return (goals || []).map(goal => ({
      goal_id: goal.id,
      goal_title: goal.title,
      target_value: goal.target_value,
      current_value: goal.current_value,
      progress_percentage: Math.round((goal.current_value / goal.target_value) * 100),
      is_on_track: goal.current_value >= goal.target_value * 0.8
    }))
  }

  // Get goal statistics
  static async getGoalStats(userId: string): Promise<GoalStats> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new Error(`Failed to fetch goal stats: ${error.message}`)
    }

    const goalsList = goals || []
    const totalGoals = goalsList.length
    const activeGoals = goalsList.filter(g => g.status === 'active').length
    const completedGoals = goalsList.filter(g => g.status === 'completed').length
    const overdueGoals = goalsList.filter(g => {
      if (!g.deadline) return false
      return new Date(g.deadline) < new Date() && g.status === 'active'
    }).length

    return {
      total_goals: totalGoals,
      active_goals: activeGoals,
      completed_goals: completedGoals,
      overdue_goals: overdueGoals,
      completion_rate: totalGoals > 0 ? (completedGoals / totalGoals) * 100 : 0,
      average_progress: totalGoals > 0 ? goalsList.reduce((sum, g) => sum + (g.current_value / g.target_value), 0) / totalGoals : 0,
      goals_by_type: {
        study_time: goalsList.filter(g => g.goal_type === 'study_time').length,
        questions_solved: goalsList.filter(g => g.goal_type === 'questions_solved').length,
        subjects_mastered: goalsList.filter(g => g.goal_type === 'subjects_mastered').length,
        exam_score: goalsList.filter(g => g.goal_type === 'exam_score').length,
        custom: goalsList.filter(g => g.goal_type === 'custom').length
      },
      goals_by_priority: {
        low: goalsList.filter(g => g.priority === 'low').length,
        medium: goalsList.filter(g => g.priority === 'medium').length,
        high: goalsList.filter(g => g.priority === 'high').length,
        urgent: goalsList.filter(g => g.priority === 'urgent').length
      }
    }
  }

  // Get goal templates
  static async getGoalTemplates(): Promise<GoalTemplate[]> {
    return [
      {
        id: '1',
        title: 'Study for 2 hours daily',
        description: 'Consistent daily study routine',
        goal_type: 'study_time',
        target_value: 2,
        unit: 'hours',
        suggested_deadline_days: 30,
        category: 'study',
        difficulty: 'beginner'
      },
      {
        id: '2',
        title: 'Solve 50 practice questions',
        description: 'Practice questions to improve understanding',
        goal_type: 'questions_solved',
        target_value: 50,
        unit: 'questions',
        suggested_deadline_days: 14,
        category: 'practice',
        difficulty: 'intermediate'
      },
      {
        id: '3',
        title: 'Master advanced concepts',
        description: 'Deep dive into complex topics',
        goal_type: 'subjects_mastered',
        target_value: 1,
        unit: 'subjects',
        suggested_deadline_days: 60,
        category: 'mastery',
        difficulty: 'advanced'
      }
    ]
  }

  // Get user achievements
  static async getUserAchievements(userId: string): Promise<Achievement[]> {
    const stats = await this.getGoalStats(userId)
    const achievements: Achievement[] = []

    if (stats.completed_goals >= 1) {
      achievements.push({
        id: 'first_goal',
        title: 'First Goal Achieved',
        description: 'Completed your first goal!',
        icon: '🎯',
        category: 'goal',
        unlocked_at: new Date().toISOString()
      })
    }

    if (stats.completed_goals >= 5) {
      achievements.push({
        id: 'goal_master',
        title: 'Goal Master',
        description: 'Completed 5 goals!',
        icon: '🏆',
        category: 'goal',
        unlocked_at: new Date().toISOString()
      })
    }

    return achievements
  }
}