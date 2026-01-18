'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Trophy,
  TrendingUp,
  Clock,
  MapPin,
  Plus,
  Users,
  Award,
  Mountain,
  ChevronDown,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { Student, StudentSkill, StudentAchievement } from '@/types/database'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type StudentWithDetails = Student & {
  skills?: StudentSkill[]
  achievements?: StudentAchievement[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [students, setStudents] = useState<StudentWithDetails[]>([])
  const [selectedStudent, setSelectedStudent] = useState<StudentWithDetails | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadStudents()
  }, [])

  const loadStudents = async () => {
    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      // Get parent record
      const { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!parent) {
        router.push('/login')
        return
      }

      // Get all students
      const { data: studentsData, error } = await supabase
        .from('students')
        .select(`
          *,
          skills:student_skills(*),
          achievements:student_achievements(*)
        `)
        .eq('parent_id', parent.id)
        .order('created_at', { ascending: true })

      if (error) throw error

      if (studentsData && studentsData.length > 0) {
        setStudents(studentsData)
        setSelectedStudent(studentsData[0])
      } else {
        // No students yet, redirect to onboarding
        router.push('/onboarding')
      }
    } catch (error) {
      console.error('Error loading students:', error)
    } finally {
      setLoading(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
  }

  const getSkillLevelLabel = (level: number): string => {
    if (level < 2) return 'Beginner'
    if (level < 4) return 'Novice'
    if (level < 6) return 'Intermediate'
    if (level < 8) return 'Advanced'
    return 'Expert'
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-primary mx-auto animate-pulse mb-4" />
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!selectedStudent) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Mountain className="h-12 w-12 text-primary mx-auto mb-4" />
          <p className="text-gray-600">No students found. Redirecting to onboarding...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header with Student Selector */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Mountain className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold">Parell</span>
            </div>

            {/* Student Selector */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={selectedStudent.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary text-white">
                      {getInitials(selectedStudent.first_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <div className="font-semibold">{selectedStudent.first_name}</div>
                    <div className="text-xs text-gray-500">
                      Level {selectedStudent.skill_level.toFixed(1)}
                    </div>
                  </div>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Switch Student Profile</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {students.map((student) => (
                  <DropdownMenuItem
                    key={student.id}
                    onClick={() => setSelectedStudent(student)}
                    className="flex items-center gap-3 cursor-pointer"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={student.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary text-white">
                        {getInitials(student.first_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="font-medium">{student.first_name}</div>
                      <div className="text-xs text-gray-500">
                        {student.age} years old • Level {student.skill_level.toFixed(1)}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/onboarding" className="cursor-pointer">
                    <Plus className="mr-2 h-4 w-4" />
                    Add Another Child
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            Welcome back, {selectedStudent.first_name}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to hit the slopes? Here's your skiing journey at a glance.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Skill Level</p>
                  <p className="text-2xl font-bold">{selectedStudent.skill_level.toFixed(1)}</p>
                  <p className="text-xs text-gray-500">{getSkillLevelLabel(selectedStudent.skill_level)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Lessons</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-500">Book your first!</p>
                </div>
                <Calendar className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Hours on Snow</p>
                  <p className="text-2xl font-bold">0</p>
                  <p className="text-xs text-gray-500">Time to ski!</p>
                </div>
                <Clock className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Achievements</p>
                  <p className="text-2xl font-bold">{selectedStudent.achievements?.length || 0}</p>
                  <p className="text-xs text-gray-500">Badges earned</p>
                </div>
                <Trophy className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Upcoming Lessons */}
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Lessons</CardTitle>
                <CardDescription>Your scheduled ski lessons</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No lessons scheduled yet</h3>
                  <p className="text-gray-600 mb-6">
                    Book your first lesson to get started with {selectedStudent.first_name}'s skiing journey!
                  </p>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Book First Lesson
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Skill Progress */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Skill Breakdown</CardTitle>
                <CardDescription>Current abilities across different skiing skills</CardDescription>
              </CardHeader>
              <CardContent>
                {selectedStudent.skills && selectedStudent.skills.length > 0 ? (
                  <div className="space-y-4">
                    {selectedStudent.skills.map((skill) => (
                      <div key={skill.id}>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm font-medium capitalize">
                            {skill.skill_name.replace('_', ' ')}
                          </span>
                          <span className="text-sm text-gray-600">{skill.skill_level}/10</span>
                        </div>
                        <Progress value={(skill.skill_level / 10) * 100} />
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-600 text-center py-8">No skill data available</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Goals */}
            <Card>
              <CardHeader>
                <CardTitle>Goals</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent.goals && selectedStudent.goals.length > 0 ? (
                  <div className="space-y-2">
                    {selectedStudent.goals.map((goal, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="h-2 w-2 bg-primary rounded-full" />
                        <span className="text-sm">{goal}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-600">No goals set yet</p>
                )}
              </CardContent>
            </Card>

            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                {selectedStudent.achievements && selectedStudent.achievements.length > 0 ? (
                  <div className="space-y-3">
                    {selectedStudent.achievements.slice(0, 3).map((achievement) => (
                      <div key={achievement.id} className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-accent/10 rounded-full flex items-center justify-center">
                          <Award className="h-5 w-5 text-accent" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium">Achievement Earned</p>
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.unlocked_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-600">
                      Complete lessons to earn achievements!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  <Users className="mr-2 h-4 w-4" />
                  Find Instructor
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MapPin className="mr-2 h-4 w-4" />
                  Resort Info
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}
