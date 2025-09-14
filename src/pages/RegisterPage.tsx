import { Helmet } from 'react-helmet-async'
import { RegisterForm } from '../components/auth/RegisterForm'

export function RegisterPage() {
  return (
    <>
      <Helmet>
        <title>Sign Up - Study Companion</title>
        <meta name="description" content="Create your Study Companion account and start your personalized learning journey." />
      </Helmet>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="bg-white dark:bg-gray-800 shadow-xl rounded-lg p-8">
            <RegisterForm />
          </div>
        </div>
      </div>
    </>
  )
}