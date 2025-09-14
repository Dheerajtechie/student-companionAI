import { useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'
import { useAuthStore } from './stores/authStore'
import { useSettingsStore, applyTheme } from './stores/settingsStore'
import { LoadingSpinner } from './components/common/LoadingSpinner'
import { EnhancedErrorBoundary } from './components/common/EnhancedErrorBoundary'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

// Pages
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { SubjectsPage } from './pages/SubjectsPage'
import { StudyPage } from './pages/StudyPage'
import { QuestionsPage } from './pages/QuestionsPage'
import { AnalyticsPage } from './pages/AnalyticsPage'
import { SpacedRepetitionPage } from './pages/SpacedRepetitionPage'
import { GoalsPage } from './pages/GoalsPage'
import { ProfilePage } from './pages/ProfilePage'
import { SettingsPage } from './pages/SettingsPage'

function App() {
  const { isAuthenticated, isLoading, initialize } = useAuthStore()
  const { settings } = useSettingsStore()

  useEffect(() => {
    // Initialize authentication
    initialize()
  }, [initialize])

  useEffect(() => {
    // Apply theme when settings change
    applyTheme(settings.theme)
  }, [settings.theme])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <EnhancedErrorBoundary>
      <Helmet>
        <title>Study Companion - AI-Powered Learning Platform</title>
        <meta name="description" content="Enhance your learning with AI-powered study tools, spaced repetition, and personalized analytics." />
        <meta name="theme-color" content="#3b82f6" />
      </Helmet>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <Routes>
          {/* Public routes */}
          <Route 
            path="/login" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />
            } 
          />
          <Route 
            path="/register" 
            element={
              isAuthenticated ? <Navigate to="/dashboard" replace /> : <RegisterPage />
            } 
          />

          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/subjects" 
            element={
              <ProtectedRoute>
                <SubjectsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/study" 
            element={
              <ProtectedRoute>
                <StudyPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/questions" 
            element={
              <ProtectedRoute>
                <QuestionsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute>
                <AnalyticsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/spaced-repetition" 
            element={
              <ProtectedRoute>
                <SpacedRepetitionPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/goals" 
            element={
              <ProtectedRoute>
                <GoalsPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <SettingsPage />
              </ProtectedRoute>
            } 
          />

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>
    </EnhancedErrorBoundary>
  )
}

export default App