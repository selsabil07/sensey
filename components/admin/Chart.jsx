
'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const BAR_COLOR = '#fe5933'

function getBuckets(period) {
  const now = new Date()
  const buckets = []

  if (period === 'This week') {
    const monday = new Date(now)
    const offset = (monday.getDay() + 6) % 7

    monday.setDate(monday.getDate() - offset)
    monday.setHours(0, 0, 0, 0)

    for (let i = 0; i < 7; i++) {
      const start = new Date(monday)
      start.setDate(monday.getDate() + i)

      const end = new Date(start)
      end.setDate(end.getDate() + 1)

      buckets.push({
        label: start.toLocaleDateString('en-US', {
          weekday: 'short',
        }),
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
        label: start.toLocaleDateString('en-US', {
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
  const [enrollments, setEnrollments] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchEnrollments() {
      setLoading(true)
      setError('')

      try {
        const buckets = getBuckets(period)
        const firstBucket = buckets[0]
        const lastBucket = buckets[buckets.length - 1]

        if (!firstBucket || !lastBucket) {
          throw new Error('Invalid date range.')
        }

        const supabase = createClient()

        const { data, error: queryError } = await supabase
          .from('enrollments')
          .select('id, enrolled_at')
          .gte('enrolled_at', firstBucket.start.toISOString())
          .lt('enrolled_at', lastBucket.end.toISOString())
          .order('enrolled_at', { ascending: true })

        if (queryError) throw queryError

        const results = buckets.map((bucket) => {
          const count = (data || []).filter((enrollment) => {
            const date = new Date(enrollment.enrolled_at)

            return date >= bucket.start && date < bucket.end
          }).length

          return {
            label: bucket.label,
            count,
          }
        })

        if (!cancelled) setEnrollments(results)
      } catch (err) {
        console.error('Failed to load enrollments:', err)

        if (!cancelled) {
          setError(
            err.message || 'Could not load enrollments.'
          )
          setEnrollments([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchEnrollments()

    return () => {
      cancelled = true
    }
  }, [period])

  const total = enrollments.reduce(
    (sum, item) => sum + item.count,
    0
  )

  const maxValue = Math.max(
    5,
    ...enrollments.map((item) => item.count)
  )

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b33]">
            Student enrollments
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            New course enrollments over time
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

      {/* Total */}
      {!loading && !error && (
        <div className="mt-6">
          <p className="text-sm text-slate-500">
            Total enrollments in this period
          </p>

          <p className="mt-1 text-3xl font-bold text-[#0b1b33]">
            {total.toLocaleString()}
          </p>
        </div>
      )}

      {/* Chart */}
      {loading ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          Loading enrollments...
        </div>
      ) : error ? (
        <p className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load enrollments: {error}
        </p>
      ) : total === 0 ? (
        <div className="flex h-56 items-center justify-center text-sm text-slate-400">
          No enrollments recorded during this period.
        </div>
      ) : (
        <div className="mt-8 flex h-56 items-end gap-2 sm:gap-4">
          {enrollments.map((item) => {
            const barHeight =
              (item.count / maxValue) * 100

            return (
              <div
                key={item.label}
                className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-slate-600">
                  {item.count}
                </span>

                <div className="flex h-full w-full items-end justify-center">
                  <div
                    className="w-full max-w-12 rounded-t-lg transition-all duration-300"
                    style={{
                      height: `${Math.max(barHeight, item.count > 0 ? 3 : 0)}%`,
                      backgroundColor: BAR_COLOR,
                    }}
                    title={`${item.count} enrollments`}
                  />
                </div>

                <span className="whitespace-nowrap text-[10px] text-slate-400 sm:text-xs">
                  {item.label}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}
