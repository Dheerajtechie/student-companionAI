import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { Settings } from 'lucide-react'

export function SettingsPage() {
  return (
    <>
      <Helmet>
        <title>Settings - Study Companion</title>
        <meta name="description" content="Customize your Study Companion experience." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Customize your Study Companion experience
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Settings Panel
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Application settings and preferences coming soon
          </p>
        </div>
      </div>
    </>
  )
}