'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const subjectStyles = [
  { name: 'Mathematics', color: '#fe5933' },
  { name: 'Languages', color: '#4776e6' },
  { name: 'Science', color: '#20b8a6' },
  { name: 'Programming', color: '#9274e8' },
  { name: 'Other', color: '#f5b942' },
]

export default function Pie() {
  const [subjects, setSubjects] = useState([])
  const [totalCourses, setTotalCourses] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchSubjects() {
      try {
        const supabase = createClient()

        const { data, error: queryError } = await supabase
          .from('courses')
          .select('subject')

        if (queryError) throw queryError

        const courses = data ?? []
        const total = courses.length

        const counts = courses.reduce((result, course) => {
          const subject = subjectStyles.some(
            (item) => item.name.toLowerCase() ===
              String(course.subject ?? '').trim().toLowerCase()
          )
            ? subjectStyles.find(
                (item) => item.name.toLowerCase() ===
                  String(course.subject ?? '').trim().toLowerCase()
              ).name
            : 'Other'

          result[subject] = (result[subject] ?? 0) + 1
          return result
        }, {})

        const calculatedSubjects = subjectStyles.map((subject) => ({
          ...subject,
          percentage: total
            ? Math.round(((counts[subject.name] ?? 0) / total) * 100)
            : 0,
        }))

        if (!cancelled) {
          setSubjects(calculatedSubjects)
          setTotalCourses(total)
        }
      } catch (err) {
        console.error('Failed to load course subjects:', err)

        if (!cancelled) {
          setError(err.message || 'Could not load course subjects.')
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchSubjects()

    return () => {
      cancelled = true
    }
  }, [])

  let current = 0

  const gradient = subjects
    .map((subject) => {
      const start = current
      current += subject.percentage

      return `${subject.color} ${start}% ${current}%`
    })
    .join(', ')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div>
        <h2 className="text-lg font-bold text-[#0b1b33]">
          Courses by subject
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Distribution across learning categories
        </p>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load subjects: {error}
        </p>
      )}

      <div className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:justify-around">
        <div
          role="img"
          aria-label={
            loading
              ? 'Loading course distribution'
              : `Course distribution across ${totalCourses} courses`
          }
          className="relative h-44 w-44 shrink-0 rounded-full"
          style={{
            background: !loading && totalCourses > 0
              ? `conic-gradient(${gradient})`
              : '#e9edf3',
          }}
        >
          <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-[#0b1b33]">
              {loading ? '—' : totalCourses}
            </span>
            <span className="text-xs text-slate-500">
              {loading ? 'Loading...' : 'Total courses'}
            </span>
          </div>
        </div>

        <div className="w-full space-y-4">
          {subjects.map((subject) => (
            <div
              key={subject.name}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: subject.color }}
                />
                <span className="text-sm text-slate-600">
                  {subject.name}
                </span>
              </div>

              <span className="text-sm font-semibold text-[#0b1b33]">
                {loading ? '—' : `${subject.percentage}%`}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
