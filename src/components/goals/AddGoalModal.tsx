import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, Target, Calendar, Clock, CheckCircle, TrendingUp } from 'lucide-react'
import { useGoalStore } from '../../stores/goalStore'
import { cn } from '../../utils/cn'
import type { CreateGoalData } from '../../types/goals'

const goalSchema = z.object({
  name: z.string().min(1, 'Goal name is required'),
  description: z.string().optional(),
  goal_type: z.enum(['study_time', 'questions_answered', 'subjects_completed', 'streak_days']),
  target_value: z.number().min(1, 'Target value must be greater than 0'),
  unit: z.string().min(1, 'Unit is required'),
  due_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']),
})

type GoalFormData = z.infer<typeof goalSchema>

interface AddGoalModalProps {
  isOpen: boolean
  onClose: () => void
  editingGoal?: any
}

const goalTypes = [
  {
    value: 'study_time',
    label: 'Study Time',
    icon: Clock,
    unit: 'hours',
    description: 'Total time spent studying'
  },
  {
    value: 'questions_answered',
    label: 'Questions Answered',
    icon: CheckCircle,
    unit: 'questions',
    description: 'Number of questions answered correctly'
  },
  {
    value: 'subjects_completed',
    label: 'Subjects Completed',
    icon: Target,
    unit: 'subjects',
    description: 'Number of subjects completed'
  },
  {
    value: 'streak_days',
    label: 'Study Streak',
    icon: TrendingUp,
    unit: 'days',
    description: 'Consecutive days of studying'
  }
]

export function AddGoalModal({ isOpen, onClose, editingGoal }: AddGoalModalProps) {
  const [selectedGoalType, setSelectedGoalType] = useState(goalTypes[0])
  const { createGoal, updateGoal, isLoading } = useGoalStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
    setValue
  } = useForm<GoalFormData>({
    resolver: zodResolver(goalSchema),
    defaultValues: editingGoal ? {
      name: editingGoal.name,
      description: editingGoal.description || '',
      goal_type: editingGoal.goal_type,
      target_value: editingGoal.target_value,
      unit: editingGoal.unit,
      due_date: editingGoal.due_date ? editingGoal.due_date.split('T')[0] : '',
      priority: editingGoal.priority,
    } : {
      name: '',
      description: '',
      goal_type: 'study_time',
      target_value: 1,
      unit: 'hours',
      due_date: '',
      priority: 'medium',
    }
  })

  const watchedGoalType = watch('goal_type')

  // Update unit when goal type changes
  useState(() => {
    const goalType = goalTypes.find(gt => gt.value === watchedGoalType)
    if (goalType) {
      setSelectedGoalType(goalType)
      setValue('unit', goalType.unit)
    }
  }, [watchedGoalType, setValue])

  const onSubmit = async (data: GoalFormData) => {
    try {
      const goalData: CreateGoalData = {
        ...data,
        deadline: data.due_date ? new Date(data.due_date).toISOString() : undefined,
      }

      if (editingGoal) {
        await updateGoal(editingGoal.id, goalData as any)
      } else {
        await createGoal(goalData)
      }

      reset()
      onClose()
    } catch (error) {
      console.error('Failed to save goal:', error)
    }
  }

  const handleClose = () => {
    reset()
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={handleClose} />

        <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  {editingGoal ? 'Edit Goal' : 'Add New Goal'}
                </h3>
                <button
                  type="button"
                  onClick={handleClose}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Goal Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={cn(
                      'input w-full',
                      errors.name && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    placeholder="Enter goal name"
                    disabled={isSubmitting}
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    className="input w-full resize-none"
                    placeholder="Enter goal description (optional)"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Goal Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Goal Type *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {goalTypes.map((goalType) => (
                      <button
                        key={goalType.value}
                        type="button"
                        onClick={() => {
                          setValue('goal_type', goalType.value as any)
                          setSelectedGoalType(goalType)
                          setValue('unit', goalType.unit)
                        }}
                        className={cn(
                          'p-3 rounded-lg border-2 transition-all text-left',
                          watchedGoalType === goalType.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                        )}
                        disabled={isSubmitting}
                      >
                        <div className="flex items-center space-x-2">
                          <goalType.icon className="h-4 w-4" />
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {goalType.label}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {goalType.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Target Value */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Value *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      {...register('target_value', { valueAsNumber: true })}
                      type="number"
                      min="1"
                      step="0.1"
                      className={cn(
                        'input flex-1',
                        errors.target_value && 'border-red-500 focus-visible:ring-red-500'
                      )}
                      placeholder="Enter target value"
                      disabled={isSubmitting}
                    />
                    <div className="flex items-center px-3 bg-gray-100 dark:bg-gray-700 rounded-md border border-gray-300 dark:border-gray-600">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {selectedGoalType.unit}
                      </span>
                    </div>
                  </div>
                  {errors.target_value && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.target_value.message}
                    </p>
                  )}
                </div>

                {/* Due Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Due Date (optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Calendar className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register('due_date')}
                      type="date"
                      className="input pl-10 w-full"
                      disabled={isSubmitting}
                    />
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Priority
                  </label>
                  <select
                    {...register('priority')}
                    className="input w-full"
                    disabled={isSubmitting}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary btn-md w-full sm:w-auto sm:ml-3"
              >
                {isSubmitting || isLoading ? 'Saving...' : (editingGoal ? 'Update' : 'Create')}
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="btn btn-outline btn-md w-full sm:w-auto mt-3 sm:mt-0"
                disabled={isSubmitting}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
