import { useState, useEffect } from 'react'
import { 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  Trash2, 
  Eye,
  CheckCircle,
  XCircle,
  } from 'lucide-react'
import { useQuestionStore } from '../../stores/questionStore'
import { useSubjectStore } from '../../stores/subjectStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { cn } from '../../utils/cn'
import type { Question, QuestionFilters } from '../../types/questions'

export function QuestionBank() {
  const { 
    questions, 
    isLoading, 
    error, 
    fetchQuestions, 
    deleteQuestion,
    clearError 
  } = useQuestionStore()
  
  const { activeSubjects } = useSubjectStore()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<QuestionFilters>({})
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    fetchQuestions(filters)
  }, [fetchQuestions, filters])

  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.question_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (question.explanation && question.explanation.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesSearch
  })

  const handleDelete = async (question: Question) => {
    if (window.confirm(`Are you sure you want to delete this question? This action cannot be undone.`)) {
      try {
        await deleteQuestion(question.id)
      } catch (error) {
        console.error('Failed to delete question:', error)
      }
    }
  }

  // const getQuestionTypeIcon = (type: string) => {
  //   switch (type) {
  //     case 'multiple_choice':
  //       return <CheckCircle className="h-4 w-4" />
  //     case 'short_answer':
  //       return <Edit className="h-4 w-4" />
  //     case 'essay':
  //       return <Edit className="h-4 w-4" />
  //     case 'true_false':
  //       return <XCircle className="h-4 w-4" />
  //     case 'fill_blank':
  //       return <Edit className="h-4 w-4" />
  //     default:
  //       return <Edit className="h-4 w-4" />
  //   }
  // }

  const getQuestionTypeLabel = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return 'Multiple Choice'
      case 'short_answer':
        return 'Short Answer'
      case 'essay':
        return 'Essay'
      case 'true_false':
        return 'True/False'
      case 'fill_blank':
        return 'Fill in the Blank'
      default:
        return 'Question'
    }
  }

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

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          <p className="text-lg font-medium">Error loading questions</p>
          <p className="text-sm">{error}</p>
        </div>
        <button
          onClick={() => {
            clearError()
            fetchQuestions()
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
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Question Bank</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage and practice with your questions
          </p>
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
              placeholder="Search questions..."
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
                Subject
              </label>
              <select
                value={filters.subject_id || ''}
                onChange={(e) => setFilters({ ...filters, subject_id: e.target.value || undefined })}
                className="input w-full"
              >
                <option value="">All Subjects</option>
                {activeSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
              </label>
              <select
                value={filters.question_type || ''}
                onChange={(e) => setFilters({ ...filters, question_type: e.target.value as any || undefined })}
                className="input w-full"
              >
                <option value="">All Types</option>
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty
              </label>
              <select
                value={filters.difficulty || ''}
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value as any || undefined })}
                className="input w-full"
              >
                <option value="">All Levels</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <LoadingSpinner size="lg" text="Loading questions..." />
        </div>
      ) : filteredQuestions.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            <Edit className="h-12 w-12 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {searchQuery || Object.keys(filters).length > 0 ? 'No questions found' : 'No questions yet'}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {searchQuery || Object.keys(filters).length > 0 
              ? 'Try adjusting your search or filters'
              : 'Generate your first questions to start practicing'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredQuestions.map((question) => (
            <div key={question.id} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className={cn(
                    'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                    getDifficultyColor(question.difficulty)
                  )}>
                    {question.difficulty}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {getQuestionTypeLabel(question.question_type)}
                  </span>
                  {question.is_ai_generated && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                      AI Generated
                    </span>
                  )}
                </div>

                <div className="relative">
                  <button className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-gray-900 dark:text-white font-medium mb-3">
                  {question.question_text}
                </p>

                {question.question_type === 'multiple_choice' && question.options && (
                  <div className="space-y-2">
                    {question.options.map((option: string, index: number) => (
                      <div key={index} className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                          {String.fromCharCode(65 + index)}.
                        </span>
                        <span className="text-gray-700 dark:text-gray-300">
                          {option}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correct Answer:
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {question.correct_answer}
                      </p>
                    </div>
                    {question.explanation && (
                      <button
                        onClick={() => setSelectedQuestion(question)}
                        className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                      >
                        <Eye className="h-4 w-4 mr-1 inline" />
                        View Explanation
                      </button>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <button className="btn btn-outline btn-sm">
                      Practice
                    </button>
                    <button
                      onClick={() => handleDelete(question)}
                      className="btn btn-outline btn-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setSelectedQuestion(null)} />

            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="mb-4">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Question Details
                  </h3>
                  <p className="text-gray-900 dark:text-white font-medium mb-4">
                    {selectedQuestion.question_text}
                  </p>
                  
                  {selectedQuestion.explanation && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Explanation:
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {selectedQuestion.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setSelectedQuestion(null)}
                  className="btn btn-primary btn-md w-full sm:w-auto"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}