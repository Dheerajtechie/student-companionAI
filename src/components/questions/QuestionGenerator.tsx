import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { 
  Sparkles, 
  HelpCircle, 
  FileText, 
  CheckSquare, 
  Type,
  Loader2,
  Plus,
  Brain,
  Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestionStore } from '../../stores/questionStore'
import { useSubjectStore } from '../../stores/subjectStore'
import { cn } from '../../utils/cn'
import type { GenerateQuestionsRequest } from '../../types/questions'

const generatorSchema = z.object({
  subject_id: z.string().min(1, 'Please select a subject'),
  topic: z.string().optional(),
  question_type: z.enum(['multiple_choice', 'short_answer', 'essay', 'true_false', 'fill_blank']),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
  count: z.number().min(1).max(20),
  include_explanations: z.boolean(),
})

type GeneratorFormData = z.infer<typeof generatorSchema>

export function QuestionGenerator() {
  const { generateQuestions, isLoading } = useQuestionStore()
  const { activeSubjects } = useSubjectStore()
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedQuestions, setGeneratedQuestions] = useState<any[]>([])

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    reset
  } = useForm<GeneratorFormData>({
    resolver: zodResolver(generatorSchema),
    defaultValues: {
      subject_id: '',
      topic: '',
      question_type: 'multiple_choice',
      difficulty: 'beginner',
      count: 5,
      include_explanations: true,
    }
  })

  const questionType = watch('question_type')

  const onSubmit = async (data: GeneratorFormData) => {
    setIsGenerating(true)
    try {
      const request: GenerateQuestionsRequest = {
        subject_id: data.subject_id,
        topic: data.topic,
        question_type: data.question_type,
        difficulty: data.difficulty,
        count: data.count,
        include_explanations: data.include_explanations,
      }

      const questions = await generateQuestions(request)
      setGeneratedQuestions(questions)
    } catch (error) {
      console.error('Failed to generate questions:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getQuestionTypeIcon = (type: string) => {
    switch (type) {
      case 'multiple_choice':
        return <CheckSquare className="h-5 w-5" />
      case 'short_answer':
        return <Type className="h-5 w-5" />
      case 'essay':
        return <FileText className="h-5 w-5" />
      case 'true_false':
        return <HelpCircle className="h-5 w-5" />
      case 'fill_blank':
        return <Type className="h-5 w-5" />
      default:
        return <HelpCircle className="h-5 w-5" />
    }
  }

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

  return (
    <div className="space-y-6">
      {/* Enhanced Generator Form with Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card p-8"
      >
        <div className="flex items-center mb-8">
          <motion.div 
            className="h-12 w-12 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-lg flex items-center justify-center mr-4 shadow-lg"
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <Brain className="h-6 w-6 text-white" />
          </motion.div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
              <Sparkles className="h-6 w-6 mr-2 text-purple-500 animate-pulse" />
              AI Question Generator
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Generate personalized questions using advanced AI
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subject Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject *
              </label>
              <select
                {...register('subject_id')}
                className={cn(
                  'input w-full',
                  errors.subject_id && 'border-red-500 focus-visible:ring-red-500'
                )}
              >
                <option value="">Select a subject</option>
                {activeSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
              {errors.subject_id && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.subject_id.message}
                </p>
              )}
            </div>

            {/* Topic */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Specific Topic (optional)
              </label>
              <input
                {...register('topic')}
                type="text"
                placeholder="e.g., React Hooks, Calculus Derivatives"
                className="input w-full"
              />
            </div>

            {/* Question Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Question Type
              </label>
              <select
                {...register('question_type')}
                className="input w-full"
              >
                <option value="multiple_choice">Multiple Choice</option>
                <option value="short_answer">Short Answer</option>
                <option value="essay">Essay</option>
                <option value="true_false">True/False</option>
                <option value="fill_blank">Fill in the Blank</option>
              </select>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                {...register('difficulty')}
                className="input w-full"
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            {/* Count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Number of Questions
              </label>
              <input
                {...register('count', { valueAsNumber: true })}
                type="number"
                min="1"
                max="20"
                className={cn(
                  'input w-full',
                  errors.count && 'border-red-500 focus-visible:ring-red-500'
                )}
              />
              {errors.count && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.count.message}
                </p>
              )}
            </div>

            {/* Include Explanations */}
            <div className="flex items-center">
              <input
                {...register('include_explanations')}
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Include detailed explanations
              </label>
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={isGenerating || isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="relative w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-lg shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center justify-center">
              {isGenerating || isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                  <span className="text-lg">Generating Questions...</span>
                </>
              ) : (
                <>
                  <Zap className="h-6 w-6 mr-3" />
                  <span className="text-lg">Generate AI Questions</span>
                </>
              )}
            </div>
            {isGenerating && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.3 }}
                transition={{ duration: 0.5 }}
              />
            )}
          </motion.button>
        </form>
      </motion.div>

      {/* Enhanced Generated Questions with Animations */}
      <AnimatePresence>
        {generatedQuestions.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="glass-card p-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <Sparkles className="h-6 w-6 mr-2 text-green-500" />
                Generated Questions ({generatedQuestions.length})
              </h3>
              <motion.button
                onClick={() => {
                  setGeneratedQuestions([])
                  reset()
                }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="glass-button px-4 py-2 rounded-lg font-medium"
              >
                Generate New
              </motion.button>
            </div>

            <div className="space-y-6">
              {generatedQuestions.map((question, index) => (
                <motion.div 
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="glass-card p-6 hover-lift"
                >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                      Question {index + 1}
                    </span>
                    <span className={cn(
                      'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
                      getDifficultyColor(question.difficulty)
                    )}>
                      {question.difficulty}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {getQuestionTypeLabel(question.question_type)}
                    </span>
                  </div>
                  <div className="flex items-center text-gray-400">
                    {getQuestionTypeIcon(question.question_type)}
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-gray-900 dark:text-white font-medium mb-3">
                    {question.question_text}
                  </p>

                  {question.question_type === 'multiple_choice' && question.options && (
                    <div className="space-y-2">
                      {question.options.map((option: string, optionIndex: number) => (
                        <div key={optionIndex} className="flex items-center space-x-2">
                          <span className="text-sm font-medium text-gray-500 dark:text-gray-400 w-6">
                            {String.fromCharCode(65 + optionIndex)}.
                          </span>
                          <span className="text-gray-700 dark:text-gray-300">
                            {option}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Correct Answer:
                      </p>
                      <p className="text-sm text-gray-900 dark:text-white">
                        {question.correct_answer}
                      </p>
                    </div>
                    <motion.button 
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="glass-button px-4 py-2 rounded-lg font-medium flex items-center"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add to Bank
                    </motion.button>
                  </div>

                  {question.explanation && (
                    <div className="mt-3">
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Explanation:
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {question.explanation}
                      </p>
                    </div>
                  )}
                </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}