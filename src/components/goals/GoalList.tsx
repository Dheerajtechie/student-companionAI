import { useState, useEffect } from 'react'
import { Plus, Search, Filter, Target, Calendar, TrendingUp } from 'lucide-react'
import { useGoalStore } from '../../stores/goalStore'
import { GoalCard } from './GoalCard'
import { AddGoalModal } from './AddGoalModal'
import { LoadingSpinner } from '../common/LoadingSpinner'
// import { cn } from '../../utils/cn'
import type { Goal, GoalFilters } from '../../types/goals'

export function GoalList() {
  const { 
    goals, 
    isLoading, 
    error, 
    fetchGoals, 
    deleteGoal,
    clearError 
  } = useGoalStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<GoalFilters>({})
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchGoals(filters)
  }, [fetchGoals, filters])

  const filteredGoals = goals.filter(goal => {
    const matchesSearch = goal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (goal.description && goal.description.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setIsModalOpen(true)
  }

  const handleDelete = async (goal: Goal) => {
    if (window.confirm(`Are you sure you want to delete "${goal.name}"? This action cannot be undone.`)) {
      try {
        await deleteGoal(goal.id)
      } catch (error) {
        console.error('Failed to delete goal:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingGoal(null)
  }

  // Calculate goal statistics
  const totalGoals = goals.length
  const completedGoals = goals.filter(g => g.status === 'completed').length
  const inProgressGoals = goals.filter(g => g.status === 'in_progress').length
  const overdueGoals = goals.filter(g => {
    if (!g.due_date || g.status === 'completed') return false
    return new Date(g.due_date) < new Date()
  }).length

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-lg font-medium">Error loading goals</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            clearError()
            fetchGoals()
          }}
          className="btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Goals</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Set and track your study goals
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Goal
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Goals</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{totalGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mr-3">
              <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{completedGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center mr-3">
              <TrendingUp className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{inProgressGoals}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="h-10 w-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
              <Calendar className="h-5 w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{overdueGoals}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search goals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
        
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="btn btn-outline"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filters
        </button>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Status
              </label>
              <select
                value={filters.status || ''}
                onChange={(e) => setFilters({ ...filters, status: e.target.value as any || undefined })}
                className="input w-full"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Goal Type
              </label>
              <select
                value={filters.goal_type || ''}
                onChange={(e) => setFilters({ ...filters, goal_type: e.target.value as any || undefined })}
                className="input w-full"
              >
                <option value="">All Types</option>
                <option value="study_time">Study Time</option>
                <option value="questions_answered">Questions Answered</option>
                <option value="subjects_completed">Subjects Completed</option>
                <option value="streak_days">Study Streak</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Priority
              </label>
              <select
                value={filters.priority || ''}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value as any || undefined })}
                className="input w-full"
              >
                <option value="">All Priorities</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Goals List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading goals..." />
        </div>
      ) : filteredGoals.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Target className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || Object.keys(filters).length > 0 ? 'No goals found' : 'No goals yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters'
              : 'Set your first goal to start tracking your progress'
            }
          </p>
          {!searchQuery && Object.keys(filters).length === 0 && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Goal
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredGoals.map((goal) => (
            <GoalCard
              key={goal.id}
              goal={goal}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Goal Modal */}
      <AddGoalModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingGoal={editingGoal}
      />
    </div>
  )
}
