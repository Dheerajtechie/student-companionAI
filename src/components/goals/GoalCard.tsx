import { useState } from 'react'
import { 
  Target, 
  Calendar, 
  TrendingUp, 
  MoreVertical, 
  Edit, 
  Trash2, 
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'
import { useGoalStore } from '../../stores/goalStore'
import { cn } from '../../utils/cn'
import type { Goal } from '../../types/goals'

interface GoalCardProps {
  goal: Goal
  onEdit: (goal: Goal) => void
  onDelete: (goal: Goal) => void
}

export function GoalCard({ goal, onEdit, onDelete }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { updateGoal } = useGoalStore()

  const progressPercentage = goal.target_value > 0 
    ? Math.min((goal.current_value / goal.target_value) * 100, 100)
    : 0

  const isOverdue = goal.deadline && new Date(goal.deadline) < new Date() && goal.status !== 'completed'
  const isDueSoon = goal.deadline && new Date(goal.deadline) <= new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) && goal.status !== 'completed'

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'paused':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const getGoalTypeIcon = (type: string) => {
    switch (type) {
      case 'study_time':
        return <Clock className="h-4 w-4" />
      case 'questions_answered':
        return <Target className="h-4 w-4" />
      case 'subjects_completed':
        return <CheckCircle className="h-4 w-4" />
      case 'streak_days':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Target className="h-4 w-4" />
    }
  }

  const getGoalTypeLabel = (type: string) => {
    switch (type) {
      case 'study_time':
        return 'Study Time'
      case 'questions_answered':
        return 'Questions Answered'
      case 'subjects_completed':
        return 'Subjects Completed'
      case 'streak_days':
        return 'Study Streak'
      default:
        return 'Goal'
    }
  }

  const handleToggleComplete = async () => {
    try {
      const newStatus = goal.status === 'completed' ? 'active' : 'completed'
      await updateGoal(goal.id, { status: newStatus })
    } catch (error) {
      console.error('Failed to update goal:', error)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getDaysRemaining = () => {
    if (!goal.deadline) return null
    const dueDate = new Date(goal.deadline)
    const today = new Date()
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-800 rounded-lg shadow-sm border p-6 transition-all hover:shadow-md",
      isOverdue ? "border-red-200 dark:border-red-800" : 
      isDueSoon ? "border-yellow-200 dark:border-yellow-800" :
      "border-gray-200 dark:border-gray-700"
    )}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            {getGoalTypeIcon(goal.goal_type)}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {goal.title}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getPriorityColor(goal.priority)
              )}>
                {goal.priority}
              </span>
              <span className={cn(
                'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                getStatusColor(goal.status)
              )}>
                {goal.status.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <MoreVertical className="h-5 w-5" />
          </button>

          {showMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 z-10">
              <div className="py-1">
                <button
                  onClick={() => {
                    onEdit(goal)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit
                </button>
                <button
                  onClick={handleToggleComplete}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <CheckCircle className="h-4 w-4 mr-3" />
                  {goal.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                </button>
                <button
                  onClick={() => {
                    onDelete(goal)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Trash2 className="h-4 w-4 mr-3" />
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {goal.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {goal.description}
        </p>
      )}

      <div className="space-y-4">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600 dark:text-gray-400">
              {getGoalTypeLabel(goal.goal_type)}
            </span>
            <span className="text-gray-900 dark:text-white font-medium">
              {goal.current_value} / {goal.target_value} {goal.unit}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                goal.status === 'completed' ? "bg-green-500" :
                progressPercentage >= 80 ? "bg-blue-500" :
                progressPercentage >= 50 ? "bg-yellow-500" : "bg-red-500"
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Goal Details */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Due Date</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {goal.deadline ? formatDate(goal.deadline) : 'No deadline'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            {isOverdue ? (
              <AlertCircle className="h-4 w-4 text-red-400" />
            ) : isDueSoon ? (
              <Clock className="h-4 w-4 text-yellow-400" />
            ) : (
              <TrendingUp className="h-4 w-4 text-gray-400" />
            )}
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {isOverdue ? 'Overdue' : isDueSoon ? 'Due Soon' : 'Days Remaining'}
              </p>
              <p className={cn(
                "text-sm font-medium",
                isOverdue ? "text-red-600 dark:text-red-400" :
                isDueSoon ? "text-yellow-600 dark:text-yellow-400" :
                "text-gray-900 dark:text-white"
              )}>
                {goal.deadline ? (
                  isOverdue ? `${Math.abs(getDaysRemaining() || 0)} days ago` :
                  `${getDaysRemaining()} days`
                ) : 'No deadline'}
              </p>
            </div>
          </div>
        </div>

        {/* Status Alert */}
        {isOverdue && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3">
            <div className="flex items-center">
              <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
              <p className="text-sm text-red-700 dark:text-red-300">
                This goal is overdue. Consider updating the deadline or marking it as complete.
              </p>
            </div>
          </div>
        )}

        {isDueSoon && !isOverdue && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-yellow-500 mr-2" />
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                This goal is due soon. Keep up the great work!
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
