
const subjects = [
  { name: 'Mathematics', percentage: 35, color: '#fe5933' },
  { name: 'Languages', percentage: 25, color: '#4776e6' },
  { name: 'Science', percentage: 20, color: '#20b8a6' },
  { name: 'Programming', percentage: 12, color: '#9274e8' },
  { name: 'Other', percentage: 8, color: '#f5b942' },
]

export default function Pie() {
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

      <div className="flex flex-col items-center gap-6 py-6 sm:flex-row sm:justify-around">
        <div
          role="img"
          aria-label="Course distribution: Mathematics 35%, Languages 25%, Science 20%, Programming 12%, Other 8%"
          className="relative h-44 w-44 shrink-0 rounded-full"
          style={{ background: `conic-gradient(${gradient})` }}
        >
          <div className="absolute inset-7 flex flex-col items-center justify-center rounded-full bg-white">
            <span className="text-3xl font-bold text-[#0b1b33]">86</span>
            <span className="text-xs text-slate-500">Total courses</span>
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
                {subject.percentage}%
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}