'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const COLORS = {
  students: '#fe5933',
  lessons: '#4776e6',
}

function getBuckets(period) {
  const now = new Date()
  const buckets = []

  if (period === 'This week') {
    const today = new Date(now)
    const mondayOffset = (today.getDay() + 6) % 7
    today.setDate(today.getDate() - mondayOffset)
    today.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const start = new Date(today)
      start.setDate(today.getDate() + i)

      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      buckets.push({
        label: start.toLocaleDateString('en', { weekday: 'short' }),
        start,
        end,
      })
    }
  } else if (period === 'This month') {
    const monthStart = new Date(
      now.getFullYear(),
      now.getMonth(),
      1
    )

    for (let i = 0; i < 5; i++) {
      const start = new Date(monthStart)
      start.setDate(1 + i * 7)

      if (start.getMonth() !== now.getMonth()) break

      const end = new Date(start)
      end.setDate(start.getDate() + 7)

      buckets.push({
        label: `Week ${i + 1}`,
        start,
        end,
      })
    }
  } else {
    for (let i = 0; i < 12; i++) {
      const start = new Date(now.getFullYear(), i, 1)
      const end = new Date(now.getFullYear(), i + 1, 1)

      buckets.push({
        label: start.toLocaleDateString('en', {
          month: 'short',
        }),
        start,
        end,
      })
    }
  }

  return buckets
}

export default function Chart() {
  const [period, setPeriod] = useState('This week')
  const [activity, setActivity] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchActivity() {
      setLoading(true)
      setError('')

      try {
        const buckets = getBuckets(period)
        const firstBucket = buckets[0]
        const lastBucket = buckets[buckets.length - 1]

        if (!firstBucket || !lastBucket) {
          throw new Error('Could not determine the selected date range.')
        }

        const supabase = createClient()

        // Assumes progress contains student_id, completed and updated_at.
        const { data, error: queryError } = await supabase
          .from('progress')
          .select('student_id, completed, updated_at')
          .gte('updated_at', firstBucket.start.toISOString())
          .lt('updated_at', lastBucket.end.toISOString())

        if (queryError) throw queryError

        const results = buckets.map((bucket) => {
          const rows = (data ?? []).filter((row) => {
            const date = new Date(row.updated_at)
            return date >= bucket.start && date < bucket.end
          })

          const activeStudents = new Set(
            rows
              .map((row) => row.student_id)
              .filter(Boolean)
          )

          const completedLessons = rows.filter(
            (row) => row.completed === true
          ).length

          return {
            day: bucket.label,
            students: activeStudents.size,
            lessons: completedLessons,
          }
        })

        if (!cancelled) setActivity(results)
      } catch (err) {
        console.error('Failed to load learning activity:', err)

        if (!cancelled) {
          setError(
            err.message || 'Could not load learning activity.'
          )
          setActivity([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchActivity()

    return () => {
      cancelled = true
    }
  }, [period])

  const width = 600
  const height = 230
  const left = 42
  const right = 12
  const top = 16
  const bottom = 30

  const maxDataValue = Math.max(
    0,
    ...activity.map((item) =>
      Math.max(item.students, item.lessons)
    )
  )

  const maxValue = Math.max(5, Math.ceil(maxDataValue / 5) * 5)
  const tickStep = maxValue <= 20 ? 5 : Math.ceil(maxValue / 4)

  const getX = (index) =>
    activity.length <= 1
      ? width / 2
      : left +
        (index * (width - left - right)) /
          (activity.length - 1)

  const getY = (value) =>
    height -
    bottom -
    (value / maxValue) * (height - top - bottom)

  const makePoints = (key) =>
    activity
      .map((item, index) => `${getX(index)},${getY(item[key])}`)
      .join(' ')

  const ticks = Array.from(
    { length: Math.ceil(maxValue / tickStep) + 1 },
    (_, index) => index * tickStep
  ).filter((value) => value <= maxValue)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b33]">
            Learning activity
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Student engagement across the platform
          </p>
        </div>

        <select
          value={period}
          onChange={(event) => setPeriod(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none focus:border-[#fe5933]"
        >
          <option>This week</option>
          <option>This month</option>
          <option>This year</option>
        </select>
      </div>

      <div className="mt-5 flex flex-wrap gap-5 text-xs font-medium text-slate-500">
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#fe5933]" />
          Active students
        </span>
        <span className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-[#4776e6]" />
          Lessons completed
        </span>
      </div>

      {error && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load activity: {error}
        </p>
      )}

      {loading ? (
        <div className="mt-4 flex h-56 items-center justify-center text-sm text-slate-400">
          Loading learning activity...
        </div>
      ) : !error && (
        <div className="mt-4 w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${width} ${height}`}
            role="img"
            aria-label={`${period} learning activity chart`}
            className="h-auto w-full"
          >
            {ticks.map((value) => (
              <g key={value}>
                <line
                  x1={left}
                  x2={width - right}
                  y1={getY(value)}
                  y2={getY(value)}
                  stroke="#e9edf3"
                  strokeDasharray="4 5"
                />
                <text
                  x={left - 8}
                  y={getY(value) + 4}
                  fontSize="10"
                  fill="#94a3b8"
                  textAnchor="end"
                >
                  {value}
                </text>
              </g>
            ))}

            {activity.length > 1 && (
              <>
                <polygon
                  points={`${getX(0)},${getY(0)} ${makePoints('students')} ${getX(activity.length - 1)},${getY(0)}`}
                  fill={COLORS.students}
                  opacity="0.08"
                />

                <polyline
                  points={makePoints('students')}
                  fill="none"
                  stroke={COLORS.students}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <polyline
                  points={makePoints('lessons')}
                  fill="none"
                  stroke={COLORS.lessons}
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </>
            )}

            {activity.map((item, index) => (
              <g key={item.day}>
                <circle
                  cx={getX(index)}
                  cy={getY(item.students)}
                  r="3.5"
                  fill={COLORS.students}
                  stroke="white"
                  strokeWidth="1.5"
                />
                <circle
                  cx={getX(index)}
                  cy={getY(item.lessons)}
                  r="3.5"
                  fill={COLORS.lessons}
                  stroke="white"
                  strokeWidth="1.5"
                />
                <text
                  x={getX(index)}
                  y={height - 7}
                  fontSize="11"
                  fill="#94a3b8"
                  textAnchor="middle"
                >
                  {item.day}
                </text>
              </g>
            ))}
          </svg>

          {activity.length === 0 && (
            <p className="text-center text-sm text-slate-400">
              No learning activity recorded for this period.
            </p>
          )}
        </div>
      )}
    </section>
  )
}
