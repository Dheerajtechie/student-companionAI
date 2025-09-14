import { useEffect, useState } from 'react'
import { Plus, Search, Filter, Grid, List } from 'lucide-react'
import { useSubjectStore } from '../../stores/subjectStore'
import { SubjectCard } from './SubjectCard'
import { AddSubjectModal } from './AddSubjectModal'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { cn } from '../../utils/cn'
import type { Subject } from '../../types/subjects'

export function SubjectList() {
  const { 
    subjects, 
    isLoading, 
    error, 
    fetchSubjects, 
    deleteSubject,
    clearError 
  } = useSubjectStore()
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filterDifficulty, setFilterDifficulty] = useState<string>('all')

  useEffect(() => {
    fetchSubjects()
  }, [fetchSubjects])

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (subject.description && subject.description.toLowerCase().includes(searchQuery.toLowerCase()))
    const matchesDifficulty = filterDifficulty === 'all' || subject.difficulty === filterDifficulty
    return matchesSearch && matchesDifficulty
  })

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject)
    setIsModalOpen(true)
  }

  const handleDelete = async (subject: Subject) => {
    if (window.confirm(`Are you sure you want to delete "${subject.name}"? This action cannot be undone.`)) {
      try {
        await deleteSubject(subject.id)
      } catch (error) {
        console.error('Failed to delete subject:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingSubject(null)
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-lg font-medium">Error loading subjects</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            clearError()
            fetchSubjects()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subjects</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your study subjects and track progress
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="btn btn-primary"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Subject
        </button>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input pl-10 w-full"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={filterDifficulty}
              onChange={(e) => setFilterDifficulty(e.target.value)}
              className="input pr-8"
            >
              <option value="all">All Levels</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
          </div>
          
          <div className="flex border border-gray-300 dark:border-gray-600 rounded-md">
            <button
              onClick={() => setViewMode('grid')}
              className={cn(
                'p-2 rounded-l-md transition-colors',
                viewMode === 'grid'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={cn(
                'p-2 rounded-r-md transition-colors',
                viewMode === 'list'
                  ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading subjects..." />
        </div>
      ) : filteredSubjects.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Plus className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || filterDifficulty !== 'all' ? 'No subjects found' : 'No subjects yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || filterDifficulty !== 'all' 
              ? 'Try adjusting your search or filters'
              : 'Create your first subject to start tracking your studies'
            }
          </p>
          {!searchQuery && filterDifficulty === 'all' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Subject
            </button>
          )}
        </div>
      ) : (
        <div className={cn(
          viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
            : 'space-y-4'
        )}>
          {filteredSubjects.map((subject) => (
            <SubjectCard
              key={subject.id}
              subject={subject}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add/Edit Subject Modal */}
      <AddSubjectModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        editingSubject={editingSubject}
      />
    </div>
  )
}