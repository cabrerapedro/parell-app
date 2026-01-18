# Parell Student App 🏔️

**Your Family's Personal Ski Coach in Your Pocket**

A premium ski instruction platform designed for families at resorts like Aspen and Vail. Parents manage multiple children's ski lesson profiles from a single account, with intelligent instructor matching, gamified progress tracking, and comprehensive family coordination features.

## 🎯 Product Overview

Parell.ai transforms the ski lesson experience from booking to mastery. This student-facing application enables parents to:

- Create and manage multiple student profiles for their children
- Complete gamified skill assessments for each child
- Match students with perfect instructors using AI algorithms
- Track detailed progress and skill improvements
- Coordinate family ski schedules and sibling lessons
- Earn achievements and maintain learning streaks
- Access comprehensive lesson history and analytics

**Think: "Strava meets Duolingo for skiing, with multi-child family management"**

## 🚀 Features Implemented

### ✅ Core Features (MVP)

1. **Parent Account System**
   - Secure authentication with Supabase Auth
   - Email/password signup and login
   - Emergency contact management
   - Single parent account manages all children

2. **Multi-Child Profile Management**
   - Unlimited student profiles per parent account
   - Profile switcher in dashboard header
   - Individual avatars and preferences per child
   - Age-appropriate content customization (5-18 years)

3. **Intelligent Onboarding Flow**
   - 4-step guided profile creation
   - Student information collection
   - Gamified skill assessment (6 skill categories)
   - Goals and teaching style preferences
   - Real-time progress tracking

4. **Skill Assessment System**
   - Interactive slider-based assessments
   - 6 skill categories tracked individually:
     - Parallel Turns
     - Moguls
     - Powder Skiing
     - Steep Terrain
     - Speed Control
     - Terrain Park
   - 0-10 scale with decimal precision
   - Automatic overall skill level calculation

5. **Family Dashboard**
   - Quick student profile switcher
   - Real-time skill level display
   - Stat cards (lessons, hours, achievements)
   - Skill breakdown visualization
   - Goals and achievements display
   - Quick action shortcuts

6. **Database Schema**
   - Complete PostgreSQL schema with Row Level Security (RLS)
   - 13 interconnected tables:
     - parents, students, student_skills
     - instructors, lessons, bookings
     - lesson_feedback, reviews
     - rematch_requests
     - achievements, student_achievements
     - notifications, recommendations, streaks
   - Automated triggers for timestamps and ratings
   - Comprehensive security policies

### 🔄 Pending Features

The following features are architected in the database schema but not yet implemented in the UI:

- Instructor matching algorithm and display
- Lesson booking and scheduling system
- Pre-lesson readiness checklists
- Post-lesson feedback and reviews
- Complete gamification system (badges, streaks, challenges)
- Lesson history and analytics hub
- Smart recommendations engine
- Family calendar coordination
- Re-match request workflow
- Photo/video storage and galleries

## 🛠️ Tech Stack

**Frontend:**
- **Next.js 15** - App Router with Server Components
- **TypeScript** - Strict mode enabled
- **Tailwind CSS** - Utility-first styling with custom color palette
- **shadcn/ui** - Premium component library
- **React Query** - Server state management
- **Zustand** - Client state management (ready to use)
- **Framer Motion** - Animations (ready to use)
- **React Hook Form + Zod** - Form validation (ready to use)

**Backend:**
- **Supabase PostgreSQL** - Relational database with RLS
- **Supabase Auth** - Authentication and session management
- **Supabase Realtime** - Live updates (ready to use)
- **Supabase Storage** - Media storage (ready to use)
- **Next.js API Routes** - Backend endpoints

**Design System:**
- Premium mountain-inspired color palette:
  - Primary: `#1E40AF` (Deep sky blue)
  - Secondary: `#3B82F6` (Bright blue)
  - Accent: `#F59E0B` (Sunrise gold)
  - Success: `#10B981` (Pine green)
- Inter font family for text
- JetBrains Mono for stats/numbers
- 8px border radius standard
- Shadow-lg elevation for cards

## 📦 Project Structure

```
parell-app/
├── app/                      # Next.js App Router
│   ├── layout.tsx           # Root layout with providers
│   ├── page.tsx             # Landing page
│   ├── signup/              # Parent signup flow
│   ├── login/               # Authentication
│   ├── onboarding/          # Student profile creation
│   └── dashboard/           # Main dashboard
├── components/
│   ├── ui/                  # shadcn/ui components
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── avatar.tsx
│   │   ├── progress.tsx
│   │   ├── slider.tsx
│   │   └── ...
│   └── providers.tsx        # React Query provider
├── lib/
│   ├── supabase/
│   │   ├── client.ts       # Browser client
│   │   └── server.ts       # Server client
│   └── utils.ts            # Utility functions
├── types/
│   └── database.ts         # TypeScript types for all tables
├── supabase/
│   └── schema.sql          # Complete database schema with RLS
├── hooks/
│   └── use-toast.ts        # Toast notifications
├── middleware.ts           # Auth middleware
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies

```

## 🚦 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (free tier works)
- Git

### Installation

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd parell-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up Supabase:**

   a. Create a new Supabase project at [supabase.com](https://supabase.com)

   b. Go to Settings → API to get your credentials

   c. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   d. Update `.env.local` with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

4. **Run the database schema:**

   In your Supabase project:
   - Go to SQL Editor
   - Copy the contents of `supabase/schema.sql`
   - Run the SQL script

   This creates:
   - All 13 tables with proper relationships
   - Row Level Security policies
   - Indexes for performance
   - Triggers for automatic updates
   - Seed data for achievements

5. **Start the development server:**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

6. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage Guide

### For Parents

1. **Sign Up (First Time):**
   - Click "Get Started" on the homepage
   - Enter your information and emergency contact
   - Create a secure password
   - Verify your email

2. **Add Your First Child:**
   - Complete the 4-step onboarding process
   - Enter child's name and age
   - Complete skill assessment (7 minutes)
   - Set goals and preferences

3. **Dashboard:**
   - View your child's profile and stats
   - Switch between children using the profile dropdown
   - Track skill progression
   - Book lessons (coming soon)

4. **Add More Children:**
   - Click "Add Another Child" in profile dropdown
   - Repeat onboarding for each child
   - Each child gets their own profile and progress

## 🗃️ Database Schema

### Key Tables

**parents**: Parent/guardian accounts
- Links to auth.users via auth_user_id
- Stores emergency contact information
- One parent → many students

**students**: Child profiles
- Belongs to a parent
- Stores skill level, goals, preferences
- Age-restricted (5-18)

**student_skills**: Detailed skill breakdown
- Individual scores for 6 skill categories
- Updated after each lesson
- Tracks progression over time

**instructors**: Instructor profiles
- Certifications and specializations
- Child specialist flag
- Average rating and total lessons

**lessons + bookings**: Lesson scheduling
- Links students to lessons
- Tracks status (scheduled, completed, cancelled)
- Multiple students can book same lesson

**lesson_feedback + reviews**: Post-lesson
- Instructor notes and skill improvements
- Parent reviews and ratings
- Before/after skill level tracking

See `supabase/schema.sql` for complete schema with RLS policies.

## 🎨 Design Principles

1. **Premium Feel:**
   - Clean, minimal interface
   - Generous whitespace
   - Professional color palette
   - Smooth animations (<300ms)

2. **Family-Oriented:**
   - Easy profile switching
   - Age-appropriate content
   - Clear parent controls
   - Child-friendly language

3. **Mobile-First:**
   - Responsive design
   - Touch-friendly (44px targets)
   - Works on all devices
   - Progressive Web App ready

4. **Gamification:**
   - Achievement badges
   - Progress visualization
   - Skill level progression
   - Motivational language

## 🔐 Security

- **Authentication:** Supabase Auth with email verification
- **Row Level Security:** All tables protected with RLS policies
- **Data Isolation:** Parents only see their own children's data
- **Secure Cookies:** HTTP-only, secure, same-site
- **Middleware:** Protected routes require authentication
- **Input Validation:** Client and server-side validation

## 🚀 Deployment

### Deploy to Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_APP_URL`

## 📝 Development Roadmap

### Phase 1: MVP (Current)
- ✅ Parent authentication
- ✅ Multi-child profiles
- ✅ Skill assessment
- ✅ Basic dashboard
- ✅ Database schema

### Phase 2: Booking System
- ⏳ Instructor matching UI
- ⏳ Lesson booking flow
- ⏳ Calendar integration
- ⏳ Pre-lesson checklists

### Phase 3: Post-Lesson
- ⏳ Feedback system
- ⏳ Review submission
- ⏳ Progress tracking
- ⏳ Photo/video galleries

### Phase 4: Engagement
- ⏳ Achievement system
- ⏳ Streaks and challenges
- ⏳ Recommendations engine
- ⏳ Social features

### Phase 5: Advanced
- ⏳ Family calendar
- ⏳ Sibling coordination
- ⏳ Analytics dashboard
- ⏳ Re-match workflow

## 🤝 Contributing

This is a proprietary application for Parell.ai. For internal development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

Proprietary - © 2026 Parell.ai

## 🆘 Support

For technical support or questions:
- Email: support@parell.ai
- Documentation: [docs.parell.ai](https://docs.parell.ai)

## 🎉 Acknowledgments

Built with modern technologies:
- Next.js team for the incredible framework
- Supabase for the backend platform
- shadcn for the beautiful component library
- Vercel for hosting and deployment

---

**Parell.ai** - Transforming ski instruction, one family at a time. 🏔️⛷️
