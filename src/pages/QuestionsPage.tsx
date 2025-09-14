import { useState } from 'react'
import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { QuestionGenerator } from '../components/questions/QuestionGenerator'
import { QuestionBank } from '../components/questions/QuestionBank'
import { Sparkles, BookOpen } from 'lucide-react'

export function QuestionsPage() {
  const [activeTab, setActiveTab] = useState<'generate' | 'bank'>('generate')

  return (
    <DashboardLayout>
      <Helmet>
        <title>Questions - Study Companion</title>
        <meta name="description" content="Practice with AI-generated questions and test your knowledge." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Questions</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Generate AI-powered questions and practice with your question bank
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('generate')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'generate'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <Sparkles className="h-4 w-4 mr-2 inline" />
              Generate Questions
            </button>
            <button
              onClick={() => setActiveTab('bank')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'bank'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <BookOpen className="h-4 w-4 mr-2 inline" />
              Question Bank
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'generate' ? <QuestionGenerator /> : <QuestionBank />}
      </div>
    </DashboardLayout>
  )
}