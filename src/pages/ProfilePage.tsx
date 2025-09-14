import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { User } from 'lucide-react'

export function ProfilePage() {
  return (
    <>
      <Helmet>
        <title>Profile - Study Companion</title>
        <meta name="description" content="Manage your profile and account settings." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Profile</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your profile and account information
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
          <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Profile Management
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Profile settings and preferences coming soon
          </p>
        </div>
      </div>
    </>
  )
}