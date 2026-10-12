'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const activityStyles = {
  student: { color: '#4776e6', icon: '＋' },
  course: { color: '#20b8a6', icon: '▤' },
  teacher: { color: '#fe5933', icon: '♙' },
  milestone: { color: '#9274e8', icon: '✦' },
}

function timeAgo(dateString) {
  if (!dateString) return 'Recently'

  const date = new Date(dateString)
  const seconds = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000))

  if (Number.isNaN(date.getTime())) return 'Recently'
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`

  return date.toLocaleDateString()
}

export default function RecentActivity() {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchActivities() {
      try {
        const supabase = createClient()

        const [
          { data: students, error: studentsError },
          { data: teachers, error: teachersError },
          { data: courses, error: coursesError },
          { data: progress, error: progressError },
        ] = await Promise.all([
          supabase
            .from('profiles')
            .select('id, full_name, created_at')
            .eq('role', 'student')
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('profiles')
            .select('id, full_name, created_at')
            .eq('role', 'teacher')
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('courses')
            .select('id, title, created_at, published')
            .eq('published', true)
            .order('created_at', { ascending: false })
            .limit(5),

          supabase
            .from('progress')
            .select('id, student_id, completed, updated_at')
            .eq('completed', true)
            .order('updated_at', { ascending: false })
            .limit(5),
        ])

        if (studentsError) throw studentsError
        if (teachersError) throw teachersError
        if (coursesError) throw coursesError
        if (progressError) throw progressError

        const events = [
          ...(students ?? []).map((student) => ({
            id: `student-${student.id}`,
            title: 'New student registered',
            description: student.full_name || 'A new student joined Sensey',
            date: student.created_at,
            ...activityStyles.student,
          })),

          ...(teachers ?? []).map((teacher) => ({
            id: `teacher-${teacher.id}`,
            title: 'Teacher account created',
            description: teacher.full_name || 'A new teacher was added',
            date: teacher.created_at,
            ...activityStyles.teacher,
          })),

          ...(courses ?? []).map((course) => ({
            id: `course-${course.id}`,
            title: 'Course published',
            description: course.title || 'A course was published',
            date: course.created_at,
            ...activityStyles.course,
          })),

          ...(progress ?? []).map((item) => ({
            id: `progress-${item.id}`,
            title: 'Learning milestone reached',
            description: 'A student completed a lesson',
            date: item.updated_at,
            ...activityStyles.milestone,
          })),
        ]

        events.sort(
          (a, b) => new Date(b.date || 0) - new Date(a.date || 0)
        )

        if (!cancelled) setActivities(events.slice(0, 4))
      } catch (err) {
        console.error('Failed to load recent activity:', err)

        if (!cancelled) {
          setError(err.message || 'Could not load recent activity.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchActivities()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b33]">
            Recent activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            What's happening on Sensey
          </p>
        </div>

        <span className="rounded-lg bg-orange-50 px-3 py-1.5 text-xs font-semibold text-[#fe5933]">
          Latest
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load activity: {error}
        </p>
      )}

      <div className="mt-6 space-y-5">
        {loading ? (
          <p className="py-6 text-center text-sm text-slate-400">
            Loading recent activity...
          </p>
        ) : !error && activities.length === 0 ? (
          <p className="py-6 text-center text-sm text-slate-400">
            No activity recorded yet.
          </p>
        ) : (
          activities.map((activity, index) => (
            <div key={activity.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-lg"
                  style={{
                    color: activity.color,
                    backgroundColor: `${activity.color}18`,
                  }}
                >
                  {activity.icon}
                </div>

                {index !== activities.length - 1 && (
                  <div className="mt-2 min-h-4 w-px flex-1 bg-slate-100" />
                )}
              </div>

              <div className="min-w-0 flex-1 pb-1">
                <p className="text-sm font-semibold text-[#0b1b33]">
                  {activity.title}
                </p>
                <p className="mt-1 break-words text-sm text-slate-500">
                  {activity.description}
                </p>
                <p className="mt-2 text-xs text-slate-400">
                  {timeAgo(activity.date)}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  )
}
