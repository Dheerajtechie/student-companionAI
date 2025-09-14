import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { AnalyticsDashboard } from '../components/analytics/AnalyticsDashboard'

export function AnalyticsPage() {
  return (
    <DashboardLayout>
      <Helmet>
        <title>Analytics - Study Companion</title>
        <meta name="description" content="View your study analytics and performance insights." />
      </Helmet>

      <AnalyticsDashboard />
    </DashboardLayout>
  )
}