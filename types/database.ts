export type Parent = {
  id: string
  auth_user_id: string
  full_name: string
  email: string
  phone: string | null
  emergency_contact_name: string | null
  emergency_contact_phone: string | null
  created_at: string
  updated_at: string
}

export type Student = {
  id: string
  parent_id: string
  first_name: string
  age: number
  skill_level: number
  avatar_url: string | null
  goals: string[] | null
  preferences: Record<string, any>
  special_needs: string | null
  languages: string[]
  created_at: string
  updated_at: string
}

export type StudentSkill = {
  id: string
  student_id: string
  skill_name: string
  skill_level: number
  updated_at: string
}

export type Instructor = {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  bio: string | null
  certifications: string[] | null
  specializations: string[] | null
  languages: string[]
  child_specialist: boolean
  rating_avg: number
  total_lessons: number
  years_experience: number | null
  avatar_url: string | null
  intro_video_url: string | null
  created_at: string
  updated_at: string
}

export type Lesson = {
  id: string
  instructor_id: string | null
  lesson_date: string
  start_time: string
  duration: number
  max_students: number
  lesson_type: 'private' | 'semi-private' | 'group'
  focus_area: string | null
  location: string | null
  status: 'scheduled' | 'completed' | 'cancelled'
  created_at: string
  updated_at: string
}

export type Booking = {
  id: string
  lesson_id: string
  student_id: string
  parent_id: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  booking_notes: string | null
  created_at: string
  updated_at: string
}

export type LessonFeedback = {
  id: string
  booking_id: string
  instructor_notes: string | null
  skills_improved: Record<string, any>
  media_urls: string[] | null
  skill_level_before: number | null
  skill_level_after: number | null
  next_steps: string | null
  created_at: string
}

export type Review = {
  id: string
  booking_id: string
  student_id: string
  parent_id: string
  instructor_id: string | null
  rating: number
  comment: string | null
  skills_improved: string[] | null
  instructor_response: string | null
  is_public: boolean
  created_at: string
  updated_at: string
}

export type RematchRequest = {
  id: string
  student_id: string
  parent_id: string
  current_instructor_id: string | null
  reason: string[]
  detailed_feedback: string | null
  preferences: string | null
  status: 'pending' | 'in_review' | 'resolved' | 'rejected'
  new_instructor_id: string | null
  admin_notes: string | null
  created_at: string
  resolved_at: string | null
}

export type Achievement = {
  id: string
  name: string
  description: string
  icon: string | null
  category: 'milestone' | 'skill' | 'social' | 'progression' | 'special'
  requirement: Record<string, any>
  created_at: string
}

export type StudentAchievement = {
  id: string
  student_id: string
  achievement_id: string
  unlocked_at: string
}

export type Notification = {
  id: string
  parent_id: string
  student_id: string | null
  type: 'lesson_reminder' | 'feedback_ready' | 'achievement_unlocked' | 'booking_confirmed' | 'system'
  title: string
  message: string
  read: boolean
  action_url: string | null
  created_at: string
}

export type Recommendation = {
  id: string
  student_id: string
  type: 'lesson' | 'terrain' | 'dining' | 'equipment' | 'event' | 'social'
  title: string
  description: string
  action_url: string | null
  priority: number
  shown_at: string | null
  clicked_at: string | null
  dismissed_at: string | null
  created_at: string
  expires_at: string | null
}

export type Streak = {
  id: string
  student_id: string
  streak_type: 'consecutive_days' | 'weekly_consistency' | 'seasonal'
  current_count: number
  best_count: number
  last_activity_date: string | null
  created_at: string
  updated_at: string
}

// Combined types for joined queries
export type BookingWithDetails = Booking & {
  lesson: Lesson & { instructor: Instructor | null }
  student: Student
  feedback?: LessonFeedback
  review?: Review
}

export type StudentWithSkills = Student & {
  skills: StudentSkill[]
  achievements: (StudentAchievement & { achievement: Achievement })[]
  streaks: Streak[]
}
