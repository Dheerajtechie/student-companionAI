import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { SubjectList } from '../components/subjects/SubjectList'

export function SubjectsPage() {
  return (
    <>
      <Helmet>
        <title>Subjects - Study Companion</title>
        <meta name="description" content="Manage your study subjects and track your progress." />
      </Helmet>

      <SubjectList />
    </>
  )
}