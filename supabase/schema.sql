-- Parell Student App Database Schema
-- Complete schema with Row Level Security policies

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PARENTS TABLE
-- =====================================================
CREATE TABLE parents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  emergency_contact_name TEXT,
  emergency_contact_phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for parents
ALTER TABLE parents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own data"
  ON parents FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Parents can update own data"
  ON parents FOR UPDATE
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Parents can insert own data"
  ON parents FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

-- =====================================================
-- STUDENTS TABLE
-- =====================================================
CREATE TABLE students (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  age INTEGER NOT NULL CHECK (age >= 5 AND age <= 18),
  skill_level DECIMAL(3,1) DEFAULT 0.0 CHECK (skill_level >= 0 AND skill_level <= 10),
  avatar_url TEXT,
  goals TEXT[],
  preferences JSONB DEFAULT '{}',
  special_needs TEXT,
  languages TEXT[] DEFAULT ARRAY['English'],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_students_parent_id ON students(parent_id);

-- RLS Policies for students
ALTER TABLE students ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view own children"
  ON students FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can insert own children"
  ON students FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can update own children"
  ON students FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can delete own children"
  ON students FOR DELETE
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

-- =====================================================
-- STUDENT SKILLS TABLE (Detailed breakdown)
-- =====================================================
CREATE TABLE student_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  skill_name TEXT NOT NULL,
  skill_level DECIMAL(3,1) DEFAULT 0.0 CHECK (skill_level >= 0 AND skill_level <= 10),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, skill_name)
);

-- Index for faster queries
CREATE INDEX idx_student_skills_student_id ON student_skills(student_id);

-- RLS Policies for student_skills
ALTER TABLE student_skills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view children's skills"
  ON student_skills FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "System can manage student skills"
  ON student_skills FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- INSTRUCTORS TABLE
-- =====================================================
CREATE TABLE instructors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name TEXT NOT NULL,
  email TEXT UNIQUE,
  phone TEXT,
  bio TEXT,
  certifications TEXT[],
  specializations TEXT[],
  languages TEXT[] DEFAULT ARRAY['English'],
  child_specialist BOOLEAN DEFAULT false,
  rating_avg DECIMAL(2,1) DEFAULT 0.0 CHECK (rating_avg >= 0 AND rating_avg <= 5),
  total_lessons INTEGER DEFAULT 0,
  years_experience INTEGER,
  avatar_url TEXT,
  intro_video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for instructors (publicly viewable)
ALTER TABLE instructors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Instructors are publicly viewable"
  ON instructors FOR SELECT
  USING (true);

-- =====================================================
-- LESSONS TABLE
-- =====================================================
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  lesson_date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  max_students INTEGER DEFAULT 1,
  lesson_type TEXT NOT NULL CHECK (lesson_type IN ('private', 'semi-private', 'group')),
  focus_area TEXT,
  location TEXT,
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for faster queries
CREATE INDEX idx_lessons_instructor_date ON lessons(instructor_id, lesson_date);
CREATE INDEX idx_lessons_date ON lessons(lesson_date);

-- RLS Policies for lessons
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Lessons are viewable by bookers"
  ON lessons FOR SELECT
  USING (true);

-- =====================================================
-- BOOKINGS TABLE (Links students to lessons)
-- =====================================================
CREATE TABLE bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lesson_id UUID NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
  booking_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(lesson_id, student_id)
);

-- Indexes for faster queries
CREATE INDEX idx_bookings_student_id ON bookings(student_id);
CREATE INDEX idx_bookings_parent_id ON bookings(parent_id);
CREATE INDEX idx_bookings_lesson_id ON bookings(lesson_id);

-- RLS Policies for bookings
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their bookings"
  ON bookings FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Parents can create bookings for their children"
  ON bookings FOR INSERT
  WITH CHECK (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Parents can update their bookings"
  ON bookings FOR UPDATE
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

-- =====================================================
-- LESSON FEEDBACK TABLE
-- =====================================================
CREATE TABLE lesson_feedback (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  instructor_notes TEXT,
  skills_improved JSONB DEFAULT '{}',
  media_urls TEXT[],
  skill_level_before DECIMAL(3,1),
  skill_level_after DECIMAL(3,1),
  next_steps TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Index for faster queries
CREATE INDEX idx_lesson_feedback_booking_id ON lesson_feedback(booking_id);

-- RLS Policies for lesson_feedback
ALTER TABLE lesson_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view feedback for their children"
  ON lesson_feedback FOR SELECT
  USING (booking_id IN (
    SELECT id FROM bookings WHERE student_id IN (
      SELECT id FROM students WHERE parent_id IN (
        SELECT id FROM parents WHERE auth_user_id = auth.uid()
      )
    )
  ));

-- =====================================================
-- REVIEWS TABLE
-- =====================================================
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  skills_improved TEXT[],
  instructor_response TEXT,
  is_public BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(booking_id)
);

-- Indexes for faster queries
CREATE INDEX idx_reviews_student_id ON reviews(student_id);
CREATE INDEX idx_reviews_instructor_id ON reviews(instructor_id);

-- RLS Policies for reviews
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their reviews"
  ON reviews FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can create reviews"
  ON reviews FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can update their reviews within 7 days"
  ON reviews FOR UPDATE
  USING (
    parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid())
    AND created_at > NOW() - INTERVAL '7 days'
  );

CREATE POLICY "Public reviews are viewable by all"
  ON reviews FOR SELECT
  USING (is_public = true);

-- =====================================================
-- RE-MATCH REQUESTS TABLE
-- =====================================================
CREATE TABLE rematch_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  current_instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  reason TEXT[] NOT NULL,
  detailed_feedback TEXT,
  preferences TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'rejected')),
  new_instructor_id UUID REFERENCES instructors(id) ON DELETE SET NULL,
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX idx_rematch_student_id ON rematch_requests(student_id);
CREATE INDEX idx_rematch_status ON rematch_requests(status);

-- RLS Policies for rematch_requests
ALTER TABLE rematch_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their rematch requests"
  ON rematch_requests FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can create rematch requests"
  ON rematch_requests FOR INSERT
  WITH CHECK (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

-- =====================================================
-- ACHIEVEMENTS TABLE (Predefined badges)
-- =====================================================
CREATE TABLE achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  icon TEXT,
  category TEXT NOT NULL CHECK (category IN ('milestone', 'skill', 'social', 'progression', 'special')),
  requirement JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS Policies for achievements (publicly viewable)
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Achievements are publicly viewable"
  ON achievements FOR SELECT
  USING (true);

-- =====================================================
-- STUDENT ACHIEVEMENTS TABLE (Student's earned badges)
-- =====================================================
CREATE TABLE student_achievements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, achievement_id)
);

-- Index for faster queries
CREATE INDEX idx_student_achievements_student_id ON student_achievements(student_id);

-- RLS Policies for student_achievements
ALTER TABLE student_achievements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children's achievements"
  ON student_achievements FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  parent_id UUID NOT NULL REFERENCES parents(id) ON DELETE CASCADE,
  student_id UUID REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lesson_reminder', 'feedback_ready', 'achievement_unlocked', 'booking_confirmed', 'system')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT false,
  action_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for faster queries
CREATE INDEX idx_notifications_parent_id ON notifications(parent_id);
CREATE INDEX idx_notifications_read ON notifications(read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);

-- RLS Policies for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their notifications"
  ON notifications FOR SELECT
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

CREATE POLICY "Parents can update their notifications"
  ON notifications FOR UPDATE
  USING (parent_id IN (SELECT id FROM parents WHERE auth_user_id = auth.uid()));

-- =====================================================
-- RECOMMENDATIONS TABLE
-- =====================================================
CREATE TABLE recommendations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('lesson', 'terrain', 'dining', 'equipment', 'event', 'social')),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  action_url TEXT,
  priority INTEGER DEFAULT 0,
  shown_at TIMESTAMP WITH TIME ZONE,
  clicked_at TIMESTAMP WITH TIME ZONE,
  dismissed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Index for faster queries
CREATE INDEX idx_recommendations_student_id ON recommendations(student_id);
CREATE INDEX idx_recommendations_type ON recommendations(type);

-- RLS Policies for recommendations
ALTER TABLE recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view recommendations for their children"
  ON recommendations FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

CREATE POLICY "Parents can update recommendations for their children"
  ON recommendations FOR UPDATE
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

-- =====================================================
-- STREAKS TABLE (Track lesson streaks)
-- =====================================================
CREATE TABLE streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  streak_type TEXT NOT NULL CHECK (streak_type IN ('consecutive_days', 'weekly_consistency', 'seasonal')),
  current_count INTEGER DEFAULT 0,
  best_count INTEGER DEFAULT 0,
  last_activity_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, streak_type)
);

-- Index for faster queries
CREATE INDEX idx_streaks_student_id ON streaks(student_id);

-- RLS Policies for streaks
ALTER TABLE streaks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Parents can view their children's streaks"
  ON streaks FOR SELECT
  USING (student_id IN (
    SELECT id FROM students WHERE parent_id IN (
      SELECT id FROM parents WHERE auth_user_id = auth.uid()
    )
  ));

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply update_updated_at trigger to relevant tables
CREATE TRIGGER update_parents_updated_at BEFORE UPDATE ON parents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_students_updated_at BEFORE UPDATE ON students
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_instructors_updated_at BEFORE UPDATE ON instructors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_lessons_updated_at BEFORE UPDATE ON lessons
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to update instructor rating after new review
CREATE OR REPLACE FUNCTION update_instructor_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE instructors
  SET rating_avg = (
    SELECT AVG(rating)::DECIMAL(2,1)
    FROM reviews
    WHERE instructor_id = NEW.instructor_id
  ),
  total_lessons = total_lessons + 1
  WHERE id = NEW.instructor_id;
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER after_review_insert AFTER INSERT ON reviews
  FOR EACH ROW EXECUTE FUNCTION update_instructor_rating();

-- =====================================================
-- SEED DATA - Sample Achievements
-- =====================================================
INSERT INTO achievements (name, description, icon, category, requirement) VALUES
  ('First Lesson', 'Complete your first ski lesson', 'trophy', 'milestone', '{"lessons_count": 1}'),
  ('5 Lessons', 'Complete 5 ski lessons', 'star', 'milestone', '{"lessons_count": 5}'),
  ('10 Lessons', 'Complete 10 ski lessons', 'award', 'milestone', '{"lessons_count": 10}'),
  ('25 Lessons', 'Complete 25 ski lessons', 'medal', 'milestone', '{"lessons_count": 25}'),
  ('First Black Diamond', 'Conquer your first black diamond run', 'mountain', 'skill', '{"black_diamond_runs": 1}'),
  ('Powder Master', 'Master skiing in powder conditions', 'cloud-snow', 'skill', '{"powder_level": 7}'),
  ('Mogul Crusher', 'Master skiing moguls', 'activity', 'skill', '{"mogul_level": 7}'),
  ('Perfect Student', 'Receive all 5-star reviews', 'heart', 'social', '{"all_five_star": true}'),
  ('Level Up', 'Advance to the next skill level', 'trending-up', 'progression', '{"level_increase": 1}'),
  ('Early Bird', 'Take 5 morning lessons', 'sunrise', 'special', '{"morning_lessons": 5}'),
  ('Family Ski Day', 'Complete a lesson with siblings', 'users', 'social', '{"sibling_lesson": true}');
