import { useState } from 'react'
import { 
  BookOpen, 
  Clock, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Archive,
  TrendingUp
} from 'lucide-react'
import { useSubjectStore } from '../../stores/subjectStore'
import { cn } from '../../utils/cn'
import type { Subject } from '../../types/subjects'

interface SubjectCardProps {
  subject: Subject
  onEdit: (subject: Subject) => void
  onDelete: (subject: Subject) => void
}

export function SubjectCard({ subject, onEdit, onDelete }: SubjectCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const { archiveSubject } = useSubjectStore()

  const progressPercentage = subject.target_hours > 0 
    ? Math.min((subject.completed_hours / subject.target_hours) * 100, 100)
    : 0

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  const handleArchive = async () => {
    try {
      await archiveSubject(subject.id)
      setShowMenu(false)
    } catch (error) {
      console.error('Failed to archive subject:', error)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div 
            className="h-12 w-12 rounded-lg flex items-center justify-center text-white"
            style={{ backgroundColor: subject.color }}
          >
            <BookOpen className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {subject.name}
            </h3>
            <span className={cn(
              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
              getDifficultyColor(subject.difficulty)
            )}>
              {subject.difficulty}
            </span>
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
                    onEdit(subject)
                    setShowMenu(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Edit className="h-4 w-4 mr-3" />
                  Edit
                </button>
                <button
                  onClick={handleArchive}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  <Archive className="h-4 w-4 mr-3" />
                  Archive
                </button>
                <button
                  onClick={() => {
                    onDelete(subject)
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

      {subject.description && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {subject.description}
        </p>
      )}

      <div className="space-y-3">
        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">
              {subject.completed_hours.toFixed(1)}h / {subject.target_hours}h
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{ 
                width: `${progressPercentage}%`,
                backgroundColor: subject.color
              }}
            />
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {progressPercentage.toFixed(1)}% complete
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Study Time</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {subject.completed_hours.toFixed(1)}h
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Target</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {subject.target_hours}h
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}