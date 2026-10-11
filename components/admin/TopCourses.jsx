
const courses = [
  {
    title: 'Mathematics Fundamentals',
    category: 'Mathematics',
    students: 842,
    completion: 82,
    color: '#fe5933',
  },
  {
    title: 'English for Beginners',
    category: 'Languages',
    students: 625,
    completion: 76,
    color: '#4776e6',
  },
  {
    title: 'Introduction to Programming',
    category: 'Programming',
    students: 493,
    completion: 68,
    color: '#20b8a6',
  },
  {
    title: 'General Science',
    category: 'Science',
    students: 387,
    completion: 71,
    color: '#9274e8',
  },
]

export default function TopCourses() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-[#0b1b33]">
            Top courses
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Your most popular learning content
          </p>
        </div>

        <a
          href="/admin/courses"
          className="text-sm font-semibold text-[#fe5933] hover:underline"
        >
          View all →
        </a>
      </div>

      <div className="mt-5 overflow-x-auto">
        <table className="w-full min-w-[430px] text-left">
          <thead>
            <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-3 pr-4 font-medium">Course</th>
              <th className="pb-3 pr-4 font-medium">Students</th>
              <th className="pb-3 font-medium">Completion</th>
            </tr>
          </thead>

          <tbody>
            {courses.map((course) => (
              <tr
                key={course.title}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="py-4 pr-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-1.5 shrink-0 rounded-full"
                      style={{ backgroundColor: course.color }}
                    />
                    <div>
                      <p className="text-sm font-semibold text-[#0b1b33]">
                        {course.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        {course.category}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="py-4 pr-4 text-sm font-medium text-slate-600">
                  {course.students.toLocaleString()}
                </td>

                <td className="py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-20 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${course.completion}%`,
                          backgroundColor: course.color,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-slate-600">
                      {course.completion}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}