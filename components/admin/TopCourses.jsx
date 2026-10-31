
'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Users,
  BookOpen,
  GraduationCap,
  LoaderCircle,
  AlertCircle,
  ArrowRight,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const colors = ['#fe5933', '#4776e6', '#20b8a6', '#9274e8']

export default function TopCourses() {
  const [teachers, setTeachers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function loadTeachers() {
      try {
        setLoading(true)
        setError('')

        const supabase = createClient()

        // 1. Fetch teachers
        const { data: teacherData, error: teacherError } =
          await supabase
            .from('profiles')
            .select('id, full_name, subject, avatar_url')
            .eq('role', 'teacher')
            .eq('is_active', true)

        if (teacherError) throw teacherError

        if (!teacherData?.length) {
          if (!cancelled) setTeachers([])
          return
        }

        const teacherIds = teacherData.map((teacher) => teacher.id)

        // 2. Fetch their courses
        const { data: courseData, error: courseError } =
          await supabase
            .from('courses')
            .select('id, teacher_id')
            .in('teacher_id', teacherIds)

        if (courseError) throw courseError

        const courses = courseData || []
        const courseIds = courses.map((course) => course.id)

        // 3. Fetch enrollments
        let enrollmentData = []

        if (courseIds.length > 0) {
          const { data, error: enrollmentError } =
            await supabase
              .from('enrollments')
              .select('course_id, student_id')
              .in('course_id', courseIds)

          if (enrollmentError) throw enrollmentError

          enrollmentData = data || []
        }

        // 4. Calculate teacher statistics
        const results = teacherData.map((teacher) => {
          const teacherCourses = courses.filter(
            (course) => course.teacher_id === teacher.id
          )

          const teacherCourseIds = new Set(
            teacherCourses.map((course) => course.id)
          )

          const uniqueStudents = new Set(
            enrollmentData
              .filter((enrollment) =>
                teacherCourseIds.has(enrollment.course_id)
              )
              .map((enrollment) => enrollment.student_id)
          )

          return {
            ...teacher,
            courseCount: teacherCourses.length,
            studentCount: uniqueStudents.size,
          }
        })

        // Show teachers with the most enrolled students first
        results.sort((a, b) => b.studentCount - a.studentCount)

        if (!cancelled) setTeachers(results.slice(0, 4))
      } catch (err) {
        console.error('Failed to load teacher performance:', err)

        if (!cancelled) {
          setError(err.message || 'Could not load teacher performance.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadTeachers()

    return () => {
      cancelled = true
    }
  }, [])

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b33]">
            Teacher performance
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            An overview of teacher contributions
          </p>
        </div>

        <Link
          href="/admin/teachers"
          className="inline-flex items-center gap-1 text-sm font-semibold text-[#fe5933] hover:underline"
        >
          View all
          <ArrowRight size={15} />
        </Link>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 py-12 text-sm text-slate-400">
          <LoaderCircle size={18} className="animate-spin" />
          Loading teacher performance...
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={18} className="mt-0.5 shrink-0" />
          <p>{error}</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && teachers.length === 0 && (
        <div className="py-12 text-center">
          <Users size={32} className="mx-auto text-slate-300" />
          <p className="mt-3 text-sm font-semibold text-[#0b1b33]">
            No active teachers yet
          </p>
          <p className="mt-1 text-sm text-slate-400">
            Teacher statistics will appear here.
          </p>
        </div>
      )}

      {/* Teacher list */}
      {!loading && !error && teachers.length > 0 && (
        <div className="mt-6 space-y-4">
          {teachers.map((teacher, index) => (
            <div
              key={teacher.id}
              className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:bg-slate-50"
            >
              {/* Avatar */}
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl text-sm font-bold text-white"
                style={{ backgroundColor: colors[index % colors.length] }}
              >
                {teacher.avatar_url ? (
                  <img
                    src={teacher.avatar_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  (teacher.full_name || 'T')
                    .trim()
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              {/* Teacher info */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0b1b33]">
                  {teacher.full_name || 'Unnamed teacher'}
                </p>
                <p className="mt-1 truncate text-xs text-slate-400">
                  {teacher.subject || 'No subject specified'}
                </p>
              </div>

              {/* Statistics */}
              <div className="flex shrink-0 items-center gap-4">
                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#4776e6]">
                    <BookOpen size={14} />
                    <span className="text-sm font-bold">
                      {teacher.courseCount}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Courses
                  </p>
                </div>

                <div className="text-center">
                  <div className="flex items-center justify-center gap-1 text-[#20b8a6]">
                    <GraduationCap size={15} />
                    <span className="text-sm font-bold">
                      {teacher.studentCount}
                    </span>
                  </div>
                  <p className="mt-1 text-[10px] text-slate-400">
                    Students
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
