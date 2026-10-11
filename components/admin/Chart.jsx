
'use client'

import { useState } from 'react'

const weeklyActivity = [
  { day: 'Mon', students: 120, lessons: 75 },
  { day: 'Tue', students: 180, lessons: 110 },
  { day: 'Wed', students: 145, lessons: 95 },
  { day: 'Thu', students: 240, lessons: 155 },
  { day: 'Fri', students: 205, lessons: 130 },
  { day: 'Sat', students: 290, lessons: 190 },
  { day: 'Sun', students: 250, lessons: 165 },
]

export default function Chart() {
  const [period, setPeriod] = useState('This week')

  const width = 600
  const height = 230
  const left = 42
  const right = 12
  const top = 16
  const bottom = 30
  const maxValue = 320

  const getX = (index) =>
    left +
    (index * (width - left - right)) /
      (weeklyActivity.length - 1)

  const getY = (value) =>
    height - bottom -
    (value / maxValue) * (height - top - bottom)

  const makePoints = (key) =>
    weeklyActivity
      .map((item, index) => `${getX(index)},${getY(item[key])}`)
      .join(' ')

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

      <div className="mt-4 w-full overflow-hidden">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label={`Weekly learning activity chart, selected period: ${period}`}
          className="h-auto w-full"
        >
          {[0, 80, 160, 240, 320].map((value) => (
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

          <polygon
            points={`${left},${getY(0)} ${makePoints('students')} ${getX(6)},${getY(0)}`}
            fill="#fe5933"
            opacity="0.08"
          />

          <polyline
            points={makePoints('students')}
            fill="none"
            stroke="#fe5933"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          <polyline
            points={makePoints('lessons')}
            fill="none"
            stroke="#4776e6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {weeklyActivity.map((item, index) => (
            <g key={item.day}>
              <circle
                cx={getX(index)}
                cy={getY(item.students)}
                r="3.5"
                fill="#fe5933"
                stroke="white"
                strokeWidth="1.5"
              />
              <circle
                cx={getX(index)}
                cy={getY(item.lessons)}
                r="3.5"
                fill="#4776e6"
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
      </div>
    </section>
  )
}