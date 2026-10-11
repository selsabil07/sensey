
const activities = [
  {
    title: 'New student registered',
    description: 'A new student joined Sensey',
    time: '10 minutes ago',
    color: '#4776e6',
    icon: '＋',
  },
  {
    title: 'Course published',
    description: 'Introduction to Mathematics',
    time: '35 minutes ago',
    color: '#20b8a6',
    icon: '▤',
  },
  {
    title: 'Teacher account created',
    description: 'A new teacher was added',
    time: '1 hour ago',
    color: '#fe5933',
    icon: '♙',
  },
  {
    title: 'Learning milestone reached',
    description: 'A student completed a course',
    time: '2 hours ago',
    color: '#9274e8',
    icon: '✦',
  },
]

export default function RecentActivity() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm ">
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

      <div className="mt-6 space-y-5">
        {activities.map((activity, index) => (
          <div key={activity.title} className="flex gap-3">
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
              <p className="mt-1 text-sm text-slate-500">
                {activity.description}
              </p>
              <p className="mt-2 text-xs text-slate-400">
                {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}