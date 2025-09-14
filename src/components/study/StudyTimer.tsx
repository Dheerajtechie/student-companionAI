import { useState, useEffect, useRef } from 'react'
import { Play, Pause, Square, Settings } from 'lucide-react'
import { useStudySessionStore } from '../../stores/studySessionStore'
import { useSubjectStore } from '../../stores/subjectStore'
import { cn } from '../../utils/cn'

export function StudyTimer() {
  const { 
    timer, 
    pomodoroSettings, 
    startTimer, 
    pauseTimer, 
    resumeTimer, 
    stopTimer, 
    resetTimer,
    startSession,
    completeSession,
    updateTimerSettings
  } = useStudySessionStore()
  
  const { activeSubjects } = useSubjectStore()
  const [selectedSubject, setSelectedSubject] = useState<string>('')
  const [sessionTitle, setSessionTitle] = useState('')
  const [showSettings, setShowSettings] = useState(false)
  const [focusRating, setFocusRating] = useState<number>(5)
  const [notes, setNotes] = useState('')
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  // const audioRef = useRef<HTMLAudioElement | null>(null)

  // Timer effect
  useEffect(() => {
    if (timer.isRunning && timer.timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        useStudySessionStore.getState().updateSessionInState('timer', {
          duration_minutes: Math.floor((timer.timeRemaining - 1) / 60)
        })
      }, 1000)
    } else if (timer.timeRemaining === 0 && timer.isRunning) {
      // Timer finished
      handleTimerComplete()
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timer.isRunning, timer.timeRemaining])

  // Audio notification
  useEffect(() => {
    if (timer.timeRemaining === 0 && timer.isRunning) {
      playNotificationSound()
    }
  }, [timer.timeRemaining, timer.isRunning])

  const playNotificationSound = () => {
    if (pomodoroSettings.sound_enabled) {
      // Create a simple beep sound
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      oscillator.type = 'sine'
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime)
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5)
      
      oscillator.start(audioContext.currentTime)
      oscillator.stop(audioContext.currentTime + 0.5)
    }
  }

  const handleTimerComplete = async () => {
    if (timer.currentSession) {
      try {
        await completeSession(timer.currentSession.id, focusRating, notes)
      } catch (error) {
        console.error('Failed to complete session:', error)
      }
    }
    
    stopTimer()
    
    // Auto-start break if enabled
    if (pomodoroSettings.auto_start_breaks) {
      const nextSessionType = timer.sessionType === 'study' ? 'short_break' : 'study'
      setTimeout(() => {
        startTimer(nextSessionType)
      }, 1000)
    }
  }

  const handleStart = () => {
    if (!selectedSubject) {
      alert('Please select a subject')
      return
    }
    
    if (!sessionTitle.trim()) {
      alert('Please enter a session title')
      return
    }

    startTimer('study')
    
    // Create study session
    startSession({
      subject_id: selectedSubject,
      title: sessionTitle,
      duration_minutes: pomodoroSettings.study_duration
    })
  }

  const handlePause = () => {
    if (timer.isPaused) {
      resumeTimer()
    } else {
      pauseTimer()
    }
  }

  const handleStop = () => {
    stopTimer()
    resetTimer()
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  const getProgressPercentage = () => {
    const totalTime = pomodoroSettings.study_duration * 60
    return ((totalTime - timer.timeRemaining) / totalTime) * 100
  }

  const getSessionTypeLabel = () => {
    switch (timer.sessionType) {
      case 'study':
        return 'Study Time'
      case 'short_break':
        return 'Short Break'
      case 'long_break':
        return 'Long Break'
      default:
        return 'Study Time'
    }
  }

  return (
    <div className="space-y-6">
      {/* Timer Display */}
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 text-center">
        <div className="mb-8">
          <div className="relative w-64 h-64 mx-auto mb-6">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                className="text-gray-200 dark:text-gray-700"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                stroke="currentColor"
                strokeWidth="8"
                fill="none"
                strokeDasharray="283"
                strokeDashoffset={283 - (283 * getProgressPercentage()) / 100}
                className="text-blue-500"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">
                {formatTime(timer.timeRemaining)}
              </span>
            </div>
          </div>
          
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            {getSessionTypeLabel()}
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            Session {timer.completedSessions + 1} of 4
          </p>
        </div>

        {/* Controls */}
        <div className="flex justify-center space-x-4">
          {!timer.isRunning && timer.timeRemaining === pomodoroSettings.study_duration * 60 && (
            <button
              onClick={handleStart}
              className="btn btn-primary btn-lg"
            >
              <Play className="h-5 w-5 mr-2" />
              Start
            </button>
          )}
          
          {timer.isRunning && (
            <button
              onClick={handlePause}
              className="btn btn-secondary btn-lg"
            >
              {timer.isPaused ? (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Resume
                </>
              ) : (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              )}
            </button>
          )}
          
          {timer.timeRemaining < pomodoroSettings.study_duration * 60 && (
            <button
              onClick={handleStop}
              className="btn btn-outline btn-lg"
            >
              <Square className="h-5 w-5 mr-2" />
              Stop
            </button>
          )}
          
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="btn btn-ghost btn-lg"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Session Setup */}
      {!timer.isRunning && timer.timeRemaining === pomodoroSettings.study_duration * 60 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Session Setup
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Subject
              </label>
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="input w-full"
              >
                <option value="">Select a subject</option>
                {activeSubjects.map((subject) => (
                  <option key={subject.id} value={subject.id}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Session Title
              </label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="What are you studying?"
                className="input w-full"
              />
            </div>
          </div>
        </div>
      )}

      {/* Session Completion */}
      {timer.timeRemaining === 0 && !timer.isRunning && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Session Complete! 🎉
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Focus Rating (1-5)
              </label>
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFocusRating(rating)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 flex items-center justify-center transition-colors',
                      focusRating === rating
                        ? 'border-blue-500 bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                        : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                    )}
                  >
                    {rating}
                  </button>
                ))}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did the session go?"
                rows={3}
                className="input w-full resize-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Settings */}
      {showSettings && (
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Timer Settings
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Study Duration (minutes)
              </label>
              <input
                type="number"
                value={pomodoroSettings.study_duration}
                onChange={(e) => updateTimerSettings({ study_duration: parseInt(e.target.value) })}
                min="1"
                max="60"
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Short Break (minutes)
              </label>
              <input
                type="number"
                value={pomodoroSettings.short_break_duration}
                onChange={(e) => updateTimerSettings({ short_break_duration: parseInt(e.target.value) })}
                min="1"
                max="30"
                className="input w-full"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Long Break (minutes)
              </label>
              <input
                type="number"
                value={pomodoroSettings.long_break_duration}
                onChange={(e) => updateTimerSettings({ long_break_duration: parseInt(e.target.value) })}
                min="1"
                max="60"
                className="input w-full"
              />
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={pomodoroSettings.auto_start_breaks}
                onChange={(e) => updateTimerSettings({ auto_start_breaks: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Auto-start breaks
              </span>
            </label>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={pomodoroSettings.sound_enabled}
                onChange={(e) => updateTimerSettings({ sound_enabled: e.target.checked })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Sound notifications
              </span>
            </label>
          </div>
        </div>
      )}
    </div>
  )
}