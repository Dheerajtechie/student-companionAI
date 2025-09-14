import { Helmet } from 'react-helmet-async'
import { DashboardLayout } from '../components/dashboard/DashboardLayout'
import { SpacedRepetitionReview } from '../components/spaced-repetition/SpacedRepetitionReview'

export function SpacedRepetitionPage() {
  return (
    <>
      <Helmet>
        <title>Spaced Repetition - Study Companion</title>
        <meta name="description" content="Review flashcards using spaced repetition for better retention." />
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Spaced Repetition</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Review flashcards with scientifically-proven spaced repetition
          </p>
        </div>

        <SpacedRepetitionReview />
      </div>
    </>
  )
}
