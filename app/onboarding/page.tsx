'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { Slider } from '@/components/ui/slider'
import { Mountain, ArrowRight, ArrowLeft, Check } from 'lucide-react'

const SKILL_CATEGORIES = [
  { name: 'parallel_turns', label: 'Parallel Turns', description: 'Ability to make smooth parallel turns' },
  { name: 'moguls', label: 'Moguls', description: 'Skiing bumpy terrain' },
  { name: 'powder', label: 'Powder Skiing', description: 'Skiing in deep snow' },
  { name: 'steep_terrain', label: 'Steep Terrain', description: 'Confidence on steep slopes' },
  { name: 'speed_control', label: 'Speed Control', description: 'Ability to control speed' },
  { name: 'terrain_park', label: 'Terrain Park', description: 'Jumps and features' },
]

const GOALS = [
  'Improve technique',
  'Build confidence',
  'Learn new terrain',
  'Competition prep',
  'Have fun',
  'Safety skills',
]

type Step = 'student-info' | 'skill-assessment' | 'goals-preferences' | 'complete'

export default function OnboardingPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<Step>('student-info')
  const [studentData, setStudentData] = useState({
    firstName: '',
    age: 8,
    specialNeeds: '',
    languages: ['English'],
  })
  const [skillLevels, setSkillLevels] = useState<Record<string, number>>({
    parallel_turns: 5,
    moguls: 5,
    powder: 5,
    steep_terrain: 5,
    speed_control: 5,
    terrain_park: 5,
  })
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [preferences, setPreferences] = useState({
    teachingStyle: '',
    pace: '',
  })

  const calculateOverallSkillLevel = () => {
    const values = Object.values(skillLevels)
    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    return Math.round(avg * 10) / 10
  }

  const getProgressPercentage = () => {
    switch (step) {
      case 'student-info':
        return 25
      case 'skill-assessment':
        return 50
      case 'goals-preferences':
        return 75
      case 'complete':
        return 100
      default:
        return 0
    }
  }

  const handleSubmit = async () => {
    setLoading(true)

    try {
      const supabase = createClient()

      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      // Get parent record
      const { data: parent } = await supabase
        .from('parents')
        .select('id')
        .eq('auth_user_id', user.id)
        .single()

      if (!parent) throw new Error('Parent record not found')

      // Create student
      const { data: student, error: studentError } = await supabase
        .from('students')
        .insert({
          parent_id: parent.id,
          first_name: studentData.firstName,
          age: studentData.age,
          skill_level: calculateOverallSkillLevel(),
          special_needs: studentData.specialNeeds || null,
          languages: studentData.languages,
          goals: selectedGoals,
          preferences: {
            teaching_style: preferences.teachingStyle,
            pace: preferences.pace,
          },
        })
        .select()
        .single()

      if (studentError) throw studentError

      // Create student skills
      const skillInserts = Object.entries(skillLevels).map(([skillName, level]) => ({
        student_id: student.id,
        skill_name: skillName,
        skill_level: level,
      }))

      const { error: skillsError } = await supabase
        .from('student_skills')
        .insert(skillInserts)

      if (skillsError) throw skillsError

      toast({
        title: 'Success!',
        description: `${studentData.firstName}'s profile has been created.`,
      })

      setStep('complete')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An error occurred',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'student-info':
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Child's First Name *</Label>
              <Input
                id="firstName"
                value={studentData.firstName}
                onChange={(e) => setStudentData({ ...studentData, firstName: e.target.value })}
                placeholder="Alex"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="age">Age * (5-18)</Label>
              <Input
                id="age"
                type="number"
                min={5}
                max={18}
                value={studentData.age}
                onChange={(e) => setStudentData({ ...studentData, age: parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="specialNeeds">Special Needs or Medical Information (Optional)</Label>
              <Input
                id="specialNeeds"
                value={studentData.specialNeeds}
                onChange={(e) => setStudentData({ ...studentData, specialNeeds: e.target.value })}
                placeholder="Any important information for the instructor"
              />
            </div>

            <Button
              onClick={() => setStep('skill-assessment')}
              className="w-full"
              disabled={!studentData.firstName || !studentData.age}
            >
              Next: Skill Assessment <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )

      case 'skill-assessment':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-gray-700">
                Rate {studentData.firstName}'s current comfort level in each skill area (0 = No experience, 10 = Expert)
              </p>
            </div>

            {SKILL_CATEGORIES.map((category) => (
              <div key={category.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div>
                    <Label>{category.label}</Label>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </div>
                  <span className="font-mono font-bold text-lg">{skillLevels[category.name]}</span>
                </div>
                <Slider
                  value={[skillLevels[category.name]]}
                  onValueChange={(value) =>
                    setSkillLevels({ ...skillLevels, [category.name]: value[0] })
                  }
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
              </div>
            ))}

            <div className="bg-primary/10 p-4 rounded-lg">
              <p className="text-sm font-semibold">
                Overall Skill Level: <span className="text-xl font-mono">{calculateOverallSkillLevel()}</span> / 10
              </p>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep('student-info')} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button onClick={() => setStep('goals-preferences')} className="flex-1">
                Next: Goals <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )

      case 'goals-preferences':
        return (
          <div className="space-y-6">
            <div>
              <Label className="text-lg mb-3 block">What are {studentData.firstName}'s skiing goals?</Label>
              <p className="text-sm text-gray-600 mb-4">Select up to 3 goals</p>
              <div className="grid grid-cols-2 gap-3">
                {GOALS.map((goal) => (
                  <Button
                    key={goal}
                    type="button"
                    variant={selectedGoals.includes(goal) ? 'default' : 'outline'}
                    onClick={() => {
                      if (selectedGoals.includes(goal)) {
                        setSelectedGoals(selectedGoals.filter((g) => g !== goal))
                      } else if (selectedGoals.length < 3) {
                        setSelectedGoals([...selectedGoals, goal])
                      }
                    }}
                    className="h-auto py-3"
                  >
                    {selectedGoals.includes(goal) && <Check className="mr-2 h-4 w-4" />}
                    {goal}
                  </Button>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-lg mb-3 block">Preferred Teaching Style</Label>
              <div className="grid grid-cols-2 gap-3">
                {['Patient', 'Challenging', 'Fun', 'Technical'].map((style) => (
                  <Button
                    key={style}
                    type="button"
                    variant={preferences.teachingStyle === style ? 'default' : 'outline'}
                    onClick={() => setPreferences({ ...preferences, teachingStyle: style })}
                    className="h-auto py-3"
                  >
                    {preferences.teachingStyle === style && <Check className="mr-2 h-4 w-4" />}
                    {style}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex gap-4">
              <Button onClick={() => setStep('skill-assessment')} variant="outline" className="flex-1">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
              </Button>
              <Button
                onClick={handleSubmit}
                className="flex-1"
                disabled={loading || selectedGoals.length === 0 || !preferences.teachingStyle}
              >
                {loading ? 'Creating Profile...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )

      case 'complete':
        return (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="h-16 w-16 bg-success text-white rounded-full flex items-center justify-center">
                <Check className="h-8 w-8" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-2">All Set!</h3>
              <p className="text-gray-600">
                {studentData.firstName}'s profile has been created. You can now explore instructor matches and book lessons.
              </p>
            </div>
            <div className="space-y-3">
              <Button onClick={() => router.push('/dashboard')} className="w-full" size="lg">
                Go to Dashboard
              </Button>
              <Button
                onClick={() => {
                  setStep('student-info')
                  setStudentData({ firstName: '', age: 8, specialNeeds: '', languages: ['English'] })
                  setSkillLevels({
                    parallel_turns: 5,
                    moguls: 5,
                    powder: 5,
                    steep_terrain: 5,
                    speed_control: 5,
                    terrain_park: 5,
                  })
                  setSelectedGoals([])
                  setPreferences({ teachingStyle: '', pace: '' })
                }}
                variant="outline"
                className="w-full"
              >
                Add Another Child
              </Button>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'student-info':
        return 'Student Information'
      case 'skill-assessment':
        return 'Skill Assessment'
      case 'goals-preferences':
        return 'Goals & Preferences'
      case 'complete':
        return 'Profile Created!'
      default:
        return ''
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Mountain className="h-12 w-12 text-primary mx-auto mb-4" />
          <h1 className="text-3xl font-bold">Create Student Profile</h1>
          <p className="text-gray-600 mt-2">Let's set up {studentData.firstName || 'your child'}'s ski profile</p>
        </div>

        {step !== 'complete' && (
          <div className="mb-8">
            <div className="flex justify-between mb-2 text-sm text-gray-600">
              <span>Step {getProgressPercentage() / 25} of 4</span>
              <span>{getProgressPercentage()}%</span>
            </div>
            <Progress value={getProgressPercentage()} className="h-2" />
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle()}</CardTitle>
            {step === 'student-info' && (
              <CardDescription>
                Basic information about your child
              </CardDescription>
            )}
            {step === 'skill-assessment' && (
              <CardDescription>
                Help us understand {studentData.firstName}'s current skiing ability
              </CardDescription>
            )}
            {step === 'goals-preferences' && (
              <CardDescription>
                What would {studentData.firstName} like to achieve?
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>{renderStep()}</CardContent>
        </Card>
      </div>
    </div>
  )
}
