import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X, BookOpen } from 'lucide-react'
import { useSubjectStore } from '../../stores/subjectStore'
import { cn } from '../../utils/cn'
import type { CreateSubjectData } from '../../types/subjects'

const subjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required'),
  description: z.string().optional(),
  color: z.string().min(1, 'Color is required'),
  icon: z.string().min(1, 'Icon is required'),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  target_hours: z.number().min(0, 'Target hours must be positive'),
})

type SubjectFormData = z.infer<typeof subjectSchema>

interface AddSubjectModalProps {
  isOpen: boolean
  onClose: () => void
  editingSubject?: any
}

const colors = [
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Green', value: '#10b981' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Teal', value: '#14b8a6' },
]

const icons = [
  { name: 'Book', value: 'book' },
  { name: 'Math', value: 'calculator' },
  { name: 'Science', value: 'flask' },
  { name: 'Language', value: 'globe' },
  { name: 'History', value: 'clock' },
  { name: 'Art', value: 'palette' },
  { name: 'Music', value: 'music' },
  { name: 'Code', value: 'code' },
]

export function AddSubjectModal({ isOpen, onClose, editingSubject }: AddSubjectModalProps) {
  const [selectedColor, setSelectedColor] = useState(colors[0].value)
  const [selectedIcon, setSelectedIcon] = useState(icons[0].value)
  const { createSubject, updateSubject, isLoading } = useSubjectStore()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    } = useForm<SubjectFormData>({
    resolver: zodResolver(subjectSchema),
    defaultValues: editingSubject ? {
      name: editingSubject.name,
      description: editingSubject.description || '',
      color: editingSubject.color,
      icon: editingSubject.icon,
      difficulty: editingSubject.difficulty,
      target_hours: editingSubject.target_hours,
    } : {
      name: '',
      description: '',
      color: colors[0].value,
      icon: icons[0].value,
      difficulty: 'beginner',
      target_hours: 0,
    }
  })

  const onSubmit = async (data: SubjectFormData) => {
    try {
      const subjectData: CreateSubjectData = {
        ...data,
        color: selectedColor,
        icon: selectedIcon,
      }

      if (editingSubject) {
        await updateSubject(editingSubject.id, subjectData)
      } else {
        await createSubject(subjectData)
      }

      reset()
      onClose()
    } catch (error) {
      console.error('Failed to save subject:', error)
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
                  {editingSubject ? 'Edit Subject' : 'Add New Subject'}
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
                {/* Subject Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subject Name *
                  </label>
                  <input
                    {...register('name')}
                    type="text"
                    className={cn(
                      'input w-full',
                      errors.name && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    placeholder="Enter subject name"
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
                    placeholder="Enter subject description (optional)"
                    disabled={isSubmitting}
                  />
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {colors.map((color) => (
                      <button
                        key={color.value}
                        type="button"
                        onClick={() => setSelectedColor(color.value)}
                        className={cn(
                          'h-10 w-10 rounded-lg border-2 transition-all',
                          selectedColor === color.value
                            ? 'border-gray-900 dark:border-white scale-110'
                            : 'border-gray-300 dark:border-gray-600 hover:scale-105'
                        )}
                        style={{ backgroundColor: color.value }}
                        disabled={isSubmitting}
                      />
                    ))}
                  </div>
                </div>

                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {icons.map((icon) => (
                      <button
                        key={icon.value}
                        type="button"
                        onClick={() => setSelectedIcon(icon.value)}
                        className={cn(
                          'h-10 w-10 rounded-lg border-2 flex items-center justify-center transition-all',
                          selectedIcon === icon.value
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900'
                            : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                        )}
                        disabled={isSubmitting}
                      >
                        <BookOpen className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Difficulty Level
                  </label>
                  <select
                    {...register('difficulty')}
                    className="input w-full"
                    disabled={isSubmitting}
                  >
                    <option value="beginner">Beginner</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="advanced">Advanced</option>
                  </select>
                </div>

                {/* Target Hours */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Target Study Hours
                  </label>
                  <input
                    {...register('target_hours', { valueAsNumber: true })}
                    type="number"
                    min="0"
                    step="0.5"
                    className={cn(
                      'input w-full',
                      errors.target_hours && 'border-red-500 focus-visible:ring-red-500'
                    )}
                    placeholder="Enter target hours"
                    disabled={isSubmitting}
                  />
                  {errors.target_hours && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.target_hours.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                disabled={isSubmitting || isLoading}
                className="btn btn-primary btn-md w-full sm:w-auto sm:ml-3"
              >
                {isSubmitting || isLoading ? 'Saving...' : (editingSubject ? 'Update' : 'Create')}
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