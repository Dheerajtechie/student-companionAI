export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          user_id: string
          email: string | null
          full_name: string | null
          avatar_url: string | null
          timezone: string
          study_preferences: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          study_preferences?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          email?: string | null
          full_name?: string | null
          avatar_url?: string | null
          timezone?: string
          study_preferences?: any
          created_at?: string
          updated_at?: string
        }
      }
      subjects: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          color: string
          icon: string
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          target_hours: number
          completed_hours: number
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          color?: string
          icon?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          target_hours?: number
          completed_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          color?: string
          icon?: string
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          target_hours?: number
          completed_hours?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      study_sessions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          description: string | null
          duration_minutes: number
          focus_rating: number | null
          notes: string | null
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          started_at: string
          ended_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          description?: string | null
          duration_minutes: number
          focus_rating?: number | null
          notes?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          description?: string | null
          duration_minutes?: number
          focus_rating?: number | null
          notes?: string | null
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          started_at?: string
          ended_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      questions: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          question_text: string
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
          options: any | null
          correct_answer: string
          explanation: string | null
          difficulty: 'beginner' | 'intermediate' | 'advanced'
          tags: string[]
          is_ai_generated: boolean
          ai_provider: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          question_text: string
          question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
          options?: any | null
          correct_answer: string
          explanation?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          tags?: string[]
          is_ai_generated?: boolean
          ai_provider?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          question_text?: string
          question_type?: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
          options?: any | null
          correct_answer?: string
          explanation?: string | null
          difficulty?: 'beginner' | 'intermediate' | 'advanced'
          tags?: string[]
          is_ai_generated?: boolean
          ai_provider?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      question_attempts: {
        Row: {
          id: string
          user_id: string
          question_id: string
          user_answer: string
          is_correct: boolean
          time_spent_seconds: number
          confidence_level: number | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          user_answer: string
          is_correct: boolean
          time_spent_seconds?: number
          confidence_level?: number | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          user_answer?: string
          is_correct?: boolean
          time_spent_seconds?: number
          confidence_level?: number | null
          created_at?: string
        }
      }
      spaced_repetition_cards: {
        Row: {
          id: string
          user_id: string
          question_id: string
          ease_factor: number
          interval_days: number
          repetitions: number
          next_review_date: string
          last_reviewed_at: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          question_id: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_date?: string
          last_reviewed_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          question_id?: string
          ease_factor?: number
          interval_days?: number
          repetitions?: number
          next_review_date?: string
          last_reviewed_at?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          subject_id: string | null
          title: string
          description: string | null
          goal_type: 'study_time' | 'questions_solved' | 'subjects_mastered' | 'exam_score' | 'custom'
          target_value: number
          current_value: number
          unit: string
          deadline: string | null
          priority: 'low' | 'medium' | 'high' | 'urgent'
          status: 'active' | 'completed' | 'paused' | 'cancelled'
          is_smart_goal: boolean
          smart_criteria: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id?: string | null
          title: string
          description?: string | null
          goal_type: 'study_time' | 'questions_solved' | 'subjects_mastered' | 'exam_score' | 'custom'
          target_value: number
          current_value?: number
          unit: string
          deadline?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          is_smart_goal?: boolean
          smart_criteria?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string | null
          title?: string
          description?: string | null
          goal_type?: 'study_time' | 'questions_solved' | 'subjects_mastered' | 'exam_score' | 'custom'
          target_value?: number
          current_value?: number
          unit?: string
          deadline?: string | null
          priority?: 'low' | 'medium' | 'high' | 'urgent'
          status?: 'active' | 'completed' | 'paused' | 'cancelled'
          is_smart_goal?: boolean
          smart_criteria?: any
          created_at?: string
          updated_at?: string
        }
      }
      study_plans: {
        Row: {
          id: string
          user_id: string
          subject_id: string
          title: string
          description: string | null
          plan_data: any
          is_ai_generated: boolean
          ai_provider: string | null
          start_date: string
          end_date: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subject_id: string
          title: string
          description?: string | null
          plan_data: any
          is_ai_generated?: boolean
          ai_provider?: string | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subject_id?: string
          title?: string
          description?: string | null
          plan_data?: any
          is_ai_generated?: boolean
          ai_provider?: string | null
          start_date?: string
          end_date?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          notification_type: 'study_reminder' | 'goal_achievement' | 'spaced_repetition' | 'exam_reminder' | 'general'
          is_read: boolean
          action_url: string | null
          metadata: any
          scheduled_for: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          notification_type: 'study_reminder' | 'goal_achievement' | 'spaced_repetition' | 'exam_reminder' | 'general'
          is_read?: boolean
          action_url?: string | null
          metadata?: any
          scheduled_for?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          notification_type?: 'study_reminder' | 'goal_achievement' | 'spaced_repetition' | 'exam_reminder' | 'general'
          is_read?: boolean
          action_url?: string | null
          metadata?: any
          scheduled_for?: string
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      difficulty_level: 'beginner' | 'intermediate' | 'advanced'
      question_type: 'multiple_choice' | 'short_answer' | 'essay' | 'true_false' | 'fill_blank'
      priority_level: 'low' | 'medium' | 'high' | 'urgent'
      goal_type: 'study_time' | 'questions_solved' | 'subjects_mastered' | 'exam_score' | 'custom'
      goal_status: 'active' | 'completed' | 'paused' | 'cancelled'
      notification_type: 'study_reminder' | 'goal_achievement' | 'spaced_repetition' | 'exam_reminder' | 'general'
      study_session_status: 'active' | 'completed' | 'paused' | 'cancelled'
    }
  }
}
