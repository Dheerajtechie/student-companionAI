import { useState, useEffect } from 'react'
import { 
  Brain, 
  RotateCcw, 
  CheckCircle, 
  XCircle, 
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { useSpacedRepetitionStore } from '../../stores/spacedRepetitionStore'
import { LoadingSpinner } from '../common/LoadingSpinner'
import { cn } from '../../utils/cn'

export function SpacedRepetitionReview() {
  const { 
    cards, 
    currentCard, 
    isLoading, 
    fetchCards, 
    startReview,
    answerCard,
    completeReview
  } = useSpacedRepetitionStore()
  
  const [showAnswer, setShowAnswer] = useState(false)
  const [reviewStarted, setReviewStarted] = useState(false)
  const [reviewComplete, setReviewComplete] = useState(false)
  const [reviewStats, setReviewStats] = useState({
    total: 0,
    correct: 0,
    incorrect: 0,
    skipped: 0
  })

  useEffect(() => {
    fetchCards()
  }, [fetchCards])

  const handleStartReview = () => {
    startReview()
    setReviewStarted(true)
    setReviewStats({ total: cards.length, correct: 0, incorrect: 0, skipped: 0 })
  }

  const handleAnswer = async (quality: number) => {
    if (!currentCard) return

    try {
      await answerCard(currentCard.id, quality)
      
      // Update stats
      setReviewStats(prev => ({
        ...prev,
        correct: quality >= 3 ? prev.correct + 1 : prev.correct,
        incorrect: quality < 3 ? prev.incorrect + 1 : prev.incorrect
      }))

      setShowAnswer(false)
    } catch (error) {
      console.error('Failed to answer card:', error)
    }
  }

  const handleSkip = async () => {
    if (!currentCard) return

    try {
      await answerCard(currentCard.id, 0) // 0 = skipped
      setReviewStats(prev => ({ ...prev, skipped: prev.skipped + 1 }))
      setShowAnswer(false)
    } catch (error) {
      console.error('Failed to skip card:', error)
    }
  }

  const handleCompleteReview = () => {
    completeReview()
    setReviewComplete(true)
  }

  const getQualityLabel = (quality: number) => {
    switch (quality) {
      case 5:
        return 'Perfect'
      case 4:
        return 'Good'
      case 3:
        return 'Hard'
      case 2:
        return 'Wrong'
      case 1:
        return 'Very Wrong'
      default:
        return 'Skip'
    }
  }

  const getQualityColor = (quality: number) => {
    switch (quality) {
      case 5:
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 4:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 3:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 2:
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 1:
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading flashcards..." />
      </div>
    )
  }

  if (cards.length === 0) {
    return (
      <div className="text-center py-12">
        <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No flashcards available
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          Create some flashcards to start your spaced repetition practice
        </p>
      </div>
    )
  }

  if (reviewComplete) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Review Complete! 🎉
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Great job on completing your spaced repetition review
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {reviewStats.total}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Cards
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {reviewStats.correct}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Correct
            </div>
          </div>
          <div className="bg-red-50 dark:bg-red-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
              {reviewStats.incorrect}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Incorrect
            </div>
          </div>
          <div className="bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
              {reviewStats.skipped}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Skipped
            </div>
          </div>
        </div>

        <button
          onClick={() => {
            setReviewComplete(false)
            setReviewStarted(false)
            setShowAnswer(false)
          }}
          className="btn btn-primary"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Start New Review
        </button>
      </div>
    )
  }

  if (!reviewStarted) {
    const dueCards = cards.filter(card => new Date(card.next_review_date) <= new Date())
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-6">
          <div className="h-16 w-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Brain className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Spaced Repetition Review
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Review your flashcards using scientifically-proven spaced repetition
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {cards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Cards
            </div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {dueCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Due for Review
            </div>
          </div>
          <div className="bg-green-50 dark:bg-green-900 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              {cards.length - dueCards.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Not Due Yet
            </div>
          </div>
        </div>

        <button
          onClick={handleStartReview}
          disabled={dueCards.length === 0}
          className="btn btn-primary btn-lg"
        >
          <Brain className="h-5 w-5 mr-2" />
          Start Review ({dueCards.length} cards)
        </button>

        {dueCards.length === 0 && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
            No cards are due for review right now. Check back later!
          </p>
        )}
      </div>
    )
  }

  if (!currentCard) {
    return (
      <div className="text-center py-12">
        <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
          No more cards to review
        </h3>
        <p className="text-gray-500 dark:text-gray-400 mb-4">
          You've completed all available cards for today
        </p>
        <button
          onClick={handleCompleteReview}
          className="btn btn-primary"
        >
          Complete Review
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
              Card {cards.indexOf(currentCard) + 1} of {cards.length}
            </span>
            <span className={cn(
              'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium',
              getQualityColor(currentCard.ease_factor >= 2.5 ? 4 : currentCard.ease_factor >= 2.0 ? 3 : 2)
            )}>
              Ease: {currentCard.ease_factor.toFixed(1)}
            </span>
          </div>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
          >
            Skip
          </button>
        </div>

        <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {currentCard.front_text}
          </h3>
          
          {!showAnswer ? (
            <button
              onClick={() => setShowAnswer(true)}
              className="btn btn-outline"
            >
              Show Answer
            </button>
          ) : (
            <div>
              <div className="mb-4">
                <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Answer:
                </h4>
                <p className="text-gray-900 dark:text-white">
                  {currentCard.back_text}
                </p>
              </div>

              {currentCard.explanation && (
                <div className="mb-6">
                  <h4 className="text-md font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Explanation:
                  </h4>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentCard.explanation}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  How well did you know this?
                </p>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                  {[5, 4, 3, 2, 1].map((quality) => (
                    <button
                      key={quality}
                      onClick={() => handleAnswer(quality)}
                      className={cn(
                        'p-3 rounded-lg border-2 transition-all hover:scale-105',
                        getQualityColor(quality)
                      )}
                    >
                      <div className="text-center">
                        <div className="text-lg font-bold">
                          {quality === 5 && <TrendingUp className="h-5 w-5 mx-auto" />}
                          {quality === 4 && <CheckCircle className="h-5 w-5 mx-auto" />}
                          {quality === 3 && <Minus className="h-5 w-5 mx-auto" />}
                          {quality === 2 && <XCircle className="h-5 w-5 mx-auto" />}
                          {quality === 1 && <TrendingDown className="h-5 w-5 mx-auto" />}
                        </div>
                        <div className="text-xs font-medium mt-1">
                          {getQualityLabel(quality)}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
