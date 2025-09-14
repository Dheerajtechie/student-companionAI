import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { GoalList } from '../components/goals/GoalList'

export function GoalsPage() {
  return (
    <>
      <Helmet>
        <title>Goals - Study Companion</title>
        <meta name="description" content="Set and track your study goals for better motivation." />
      </Helmet>

      <GoalList />
    </>
  )
}
