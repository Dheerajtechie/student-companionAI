import { useState, useEffect } from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Clock, 
  Target, 
  Brain, 
  Download,
  } from 'lucide-react'
// import { analyticsService } from '../../services/analyticsAdvanced'
import { LoadingSpinner } from '../common/LoadingSpinner'
// import { cn } from '../../utils/cn'

const COLORS = ['#3b82f6', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#06b6d4']

export function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d')
  const [isLoading, setIsLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [studyTimeData, setStudyTimeData] = useState<{date: string; studyTime: number; questions: number; focus: number}[]>([])
  const [subjectData, setSubjectData] = useState<{name: string; value: number; color: string}[]>([])
  const [performanceData, setPerformanceData] = useState<{date: string; accuracy: number; speed: number}[]>([])

  useEffect(() => {
    loadAnalytics()
  }, [timeRange])

  const loadAnalytics = async () => {
    setIsLoading(true)
    try {
      // Use mock data for now to get the app running
      const mockAnalytics = {
        overview: {
          totalStudyTime: 1440,
          totalQuestionsAnswered: 156,
          averageAccuracy: 85,
          currentStreak: 7,
          weeklyGoalProgress: 75
        },
        performance: {
          studyTimeTrend: [
            { date: '2024-01-01', minutes: 120 },
            { date: '2024-01-02', minutes: 90 },
            { date: '2024-01-03', minutes: 150 },
            { date: '2024-01-04', minutes: 180 },
            { date: '2024-01-05', minutes: 200 }
          ],
          subjectBreakdown: [
            { subject: 'Mathematics', studyTime: 300 },
            { subject: 'Science', studyTime: 250 },
            { subject: 'History', studyTime: 200 }
          ],
          accuracyTrend: [
            { date: '2024-01-01', accuracy: 80 },
            { date: '2024-01-02', accuracy: 85 },
            { date: '2024-01-03', accuracy: 90 },
            { date: '2024-01-04', accuracy: 88 },
            { date: '2024-01-05', accuracy: 92 }
          ]
        }
      }
      
      setAnalytics(mockAnalytics)

      // Set chart data from mock analytics
      setStudyTimeData(mockAnalytics.performance.studyTimeTrend.map(item => ({
        date: item.date,
        studyTime: item.minutes,
        questions: Math.floor(Math.random() * 20) + 5,
        focus: Math.floor(Math.random() * 2) + 3
      })))

      setSubjectData(mockAnalytics.performance.subjectBreakdown.map((subject, index) => ({
        name: subject.subject,
        value: subject.studyTime,
        color: COLORS[index % COLORS.length]
      })))

      setPerformanceData(mockAnalytics.performance.accuracyTrend.map(item => ({
        date: item.date,
        accuracy: item.accuracy,
        speed: Math.floor(Math.random() * 30) + 60
      })))

    } catch (error) {
      console.error('Failed to load analytics:', error)
      // Fallback to mock data
      setStudyTimeData(generateStudyTimeData())
      setSubjectData(generateSubjectData())
      setPerformanceData(generatePerformanceData())
    } finally {
      setIsLoading(false)
    }
  }

  const generateStudyTimeData = () => {
    const data = []
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        studyTime: Math.floor(Math.random() * 120) + 30,
        questions: Math.floor(Math.random() * 20) + 5,
        focus: Math.floor(Math.random() * 2) + 3
      })
    }
    return data
  }

  const generateSubjectData = () => {
    const subjects = ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science']
    return subjects.map((subject, index) => ({
      name: subject,
      value: Math.floor(Math.random() * 120) + 30,
      color: COLORS[index % COLORS.length]
    }))
  }

  const generatePerformanceData = () => {
    const data = []
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : timeRange === '90d' ? 90 : 365
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      data.push({
        date: date.toISOString().split('T')[0],
        accuracy: Math.floor(Math.random() * 20) + 70,
        speed: Math.floor(Math.random() * 30) + 60
      })
    }
    return data
  }

  const exportToPDF = () => {
    // Implementation for PDF export
    console.log('Exporting to PDF...')
  }

  const exportToCSV = () => {
    // Implementation for CSV export
    console.log('Exporting to CSV...')
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading analytics..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Track your study progress and performance
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="input"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          
          <div className="flex space-x-2">
            <button
              onClick={exportToPDF}
              className="btn btn-outline btn-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              PDF
            </button>
            <button
              onClick={exportToCSV}
              className="btn btn-outline btn-sm"
            >
              <Download className="h-4 w-4 mr-1" />
              CSV
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Study Time</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.study?.total_study_time || 0}h
              </p>
            </div>
            <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              +12% from last period
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Answered</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.questions?.questions_answered || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-green-600 dark:text-green-400">
              {analytics?.questions?.accuracy_rate?.toFixed(1) || 0}% accuracy
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Study Streak</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.study?.study_streak || 0} days
              </p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Best: {analytics?.study?.longest_streak || 0} days
            </span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Goals Completed</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.goals?.completed_goals || 0}
              </p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 dark:bg-yellow-900 rounded-lg flex items-center justify-center">
              <Brain className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {analytics?.goals?.completion_rate?.toFixed(1) || 0}% completion rate
            </span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Time Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Time Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="studyTime" 
                stroke="#3b82f6" 
                strokeWidth={2}
                name="Study Time (min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Subject Distribution */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Time by Subject
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={subjectData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {subjectData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Performance Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Trends
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="accuracy" 
                stroke="#10b981" 
                strokeWidth={2}
                name="Accuracy (%)"
              />
              <Line 
                type="monotone" 
                dataKey="speed" 
                stroke="#f59e0b" 
                strokeWidth={2}
                name="Speed (Q/min)"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Focus Rating */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Focus Rating Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[1, 5]} />
              <Tooltip />
              <Bar dataKey="focus" fill="#8b5cf6" name="Focus Rating" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Study Habits */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Study Habits
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Most Productive Day</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.study?.most_productive_day || 'Monday'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Most Productive Hour</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.study?.most_productive_hour || 14}:00
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Session Duration</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.study?.average_session_duration?.toFixed(1) || 0} min
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Focus Rating</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.study?.focus_rating_average?.toFixed(1) || 0}/5
              </span>
            </div>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Performance Insights
          </h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Overall Accuracy</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.questions?.accuracy_rate?.toFixed(1) || 0}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Improvement Trend</span>
              <span className={`font-medium ${
                (analytics?.questions?.improvement_trend || 0) > 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {(analytics?.questions?.improvement_trend || 0) > 0 ? '+' : ''}
                {(analytics?.questions?.improvement_trend || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Average Response Time</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {analytics?.questions?.average_response_time?.toFixed(1) || 0}s
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600 dark:text-gray-400">Questions by Difficulty</span>
              <div className="text-right">
                <div className="text-sm text-gray-900 dark:text-white">
                  Easy: {analytics?.questions?.questions_by_difficulty?.beginner || 0}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  Medium: {analytics?.questions?.questions_by_difficulty?.intermediate || 0}
                </div>
                <div className="text-sm text-gray-900 dark:text-white">
                  Hard: {analytics?.questions?.questions_by_difficulty?.advanced || 0}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
