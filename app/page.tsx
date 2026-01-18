import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Mountain, Users, Trophy, Calendar } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          <div className="flex justify-center mb-6">
            <Mountain className="h-16 w-16 text-primary" />
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your Family's Personal Ski Coach in Your Pocket
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Premium ski instruction for families at Aspen, Vail, and beyond.
            Track progress, match with expert instructors, and accelerate your skiing journey.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="text-lg px-8">
                Get Started
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mt-20 max-w-5xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Users className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Multi-Child Management</h3>
            <p className="text-gray-600">
              One parent account manages all your children's profiles, lessons, and progress
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Trophy className="h-12 w-12 text-success mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Detailed skill assessments, personalized feedback, and gamified achievements
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6 text-center">
            <Calendar className="h-12 w-12 text-accent mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Smart Scheduling</h3>
            <p className="text-gray-600">
              Family calendar, lesson coordination, and pre-lesson readiness checklists
            </p>
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Create Your Family Account</h4>
                <p className="text-gray-600">
                  Sign up as a parent and add profiles for each of your children in minutes
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Assess Skills & Match Instructors</h4>
                <p className="text-gray-600">
                  Each child completes a fun skill assessment and gets matched with the perfect instructor
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                3
              </div>
              <div>
                <h4 className="text-xl font-bold mb-2">Book Lessons & Track Progress</h4>
                <p className="text-gray-600">
                  Schedule lessons, receive pre-lesson prep, and watch your children's skills grow with detailed feedback
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-20">
        <div className="container mx-auto px-4 text-center">
          <p>&copy; 2026 Parell.ai - Premium Ski Instruction Platform</p>
        </div>
      </footer>
    </div>
  )
}
