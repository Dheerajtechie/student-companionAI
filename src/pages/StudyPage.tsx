import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { StudyTimer } from '../components/study/StudyTimer'

export function StudyPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Study - Study Companion</title>
        <meta name="description" content="Start focused study sessions with the Pomodoro timer." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Session</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Focus on your studies with the Pomodoro technique
          </p>
        </div>

        <StudyTimer />
      </div>
    </DashboardLayout>
  )
}