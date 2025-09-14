import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { 
  BookOpen, 
  Clock, 
  HelpCircle, 
  Target, 
  TrendingUp,
  Calendar,
  Sparkles,
  Brain,
  Zap,
  Star
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { analyticsService } from '../services/analyticsAdvanced'
import { motion } from 'framer-motion'

const stats = [
  {
    name: 'Total Study Time',
    value: '24h 30m',
    change: '+12%',
    changeType: 'positive',
    icon: Clock,
  },
  {
    name: 'Questions Answered',
    value: '156',
    change: '+8%',
    changeType: 'positive',
    icon: HelpCircle,
  },
  {
    name: 'Active Subjects',
    value: '5',
    change: '+2',
    changeType: 'positive',
    icon: BookOpen,
  },
  {
    name: 'Goals Completed',
    value: '3',
    change: '+1',
    changeType: 'positive',
    icon: Target,
  },
]

const recentActivities = [
  {
    id: 1,
    type: 'study',
    title: 'Completed React study session',
    time: '2 hours ago',
    icon: BookOpen,
  },
  {
    id: 2,
    type: 'question',
    title: 'Answered 15 JavaScript questions',
    time: '4 hours ago',
    icon: HelpCircle,
  },
  {
    id: 3,
    type: 'goal',
    title: 'Achieved weekly study goal',
    time: '1 day ago',
    icon: Target,
  },
  {
    id: 4,
    type: 'spaced-repetition',
    title: 'Reviewed 20 flashcards',
    time: '2 days ago',
    icon: TrendingUp,
  },
]

export function DashboardPage() {
  const { user } = useAuthStore()
  const [analytics, setAnalytics] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    if (!user) return
    
    try {
      setIsLoading(true)
      // Use mock data for now
      const data = {
        overview: {
          totalStudyTime: 1440,
          totalQuestionsAnswered: 156,
          averageAccuracy: 85,
          currentStreak: 7,
          weeklyGoalProgress: 75
        }
      }
      setAnalytics(data)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const getMotivationalMessage = () => {
    const messages = [
      "Ready to continue your learning journey? Let's make today productive!",
      "Every expert was once a beginner. Keep pushing forward!",
      "Knowledge is power, and you're building it one study session at a time.",
      "Success is the sum of small efforts repeated day in and day out.",
      "Your future self will thank you for the effort you put in today."
    ]
    return messages[Math.floor(Math.random() * messages.length)]
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-96">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <Helmet>
        <title>Dashboard - Study Companion</title>
        <meta name="description" content="Your personalized study dashboard with insights and progress tracking." />
      </Helmet>

      <div className="space-y-6">
        {/* Enhanced Welcome section with glassmorphism */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden"
        >
          <div className="glass-card-dark p-8 text-white">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-700 opacity-90"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-2 flex items-center">
                    <Sparkles className="h-8 w-8 mr-3 text-yellow-300 animate-pulse" />
                    {getGreeting()}, {user?.full_name || 'Student'}!
                  </h1>
                  <p className="text-blue-100 text-lg">
                    {getMotivationalMessage()}
                  </p>
                </div>
                <div className="hidden md:block">
                  <motion.div
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Brain className="h-16 w-16 text-blue-200" />
                  </motion.div>
                </div>
              </div>
              
              {/* Quick stats in welcome section */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center">
                    <Clock className="h-6 w-6 mr-2 text-blue-200" />
                    <div>
                      <p className="text-sm text-blue-100">Today's Goal</p>
                      <p className="text-xl font-bold">{analytics?.overview?.totalStudyTime || 0} min</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-green-200" />
                    <div>
                      <p className="text-sm text-blue-100">Current Streak</p>
                      <p className="text-xl font-bold">{analytics?.overview?.currentStreak || 0} days</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                  <div className="flex items-center">
                    <Star className="h-6 w-6 mr-2 text-yellow-200" />
                    <div>
                      <p className="text-sm text-blue-100">Accuracy</p>
                      <p className="text-xl font-bold">{analytics?.overview?.averageAccuracy || 0}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Enhanced Stats grid with glassmorphism */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <motion.div 
              key={stat.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="glass-card hover-lift hover-glow p-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {stat.name}
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stat.value}
                  </p>
                </div>
                <motion.div 
                  className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <stat.icon className="h-6 w-6 text-white" />
                </motion.div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${
                  stat.changeType === 'positive' 
                    ? 'text-green-600 dark:text-green-400' 
                    : 'text-red-600 dark:text-red-400'
                }`}>
                  {stat.change}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  from last week
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Enhanced Quick actions */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="glass-card p-6"
          >
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 flex items-center">
              <Zap className="h-5 w-5 mr-2 text-yellow-500" />
              Quick Actions
            </h2>
            <div className="space-y-4">
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center p-4 text-left glass-button rounded-lg hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all duration-300"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Start Study Session</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Begin a focused study session</p>
                </div>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center p-4 text-left glass-button rounded-lg hover:bg-green-50/50 dark:hover:bg-green-900/20 transition-all duration-300"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <HelpCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Practice Questions</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Test your knowledge with AI</p>
                </div>
              </motion.button>
              
              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center p-4 text-left glass-button rounded-lg hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all duration-300"
              >
                <div className="h-12 w-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mr-4 shadow-lg">
                  <TrendingUp className="h-6 w-6 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 dark:text-white">Review Flashcards</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Spaced repetition practice</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Recent activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Activity
            </h2>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center">
                  <div className="h-10 w-10 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center mr-3">
                    <activity.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.title}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Study calendar */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Study Calendar
            </h2>
            <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">
              View all
            </button>
          </div>
          <div className="text-center py-8">
            <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">
              Calendar view coming soon
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}