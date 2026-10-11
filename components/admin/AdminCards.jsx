"use client"

const AdminCards = () => {

    const COLORS = {
  navy: '#0b1b33',
  orange: '#fe5933',
  blue: '#4776e6',
  teal: '#20b8a6',
  purple: '#9274e8',
}

    function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
    users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
    book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
    chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" transform="translate(-1 -1) scale(1.08)" /></>,
    bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <><path d="m18 6-12 12M6 6l12 12" /></>,
    logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
  }
    return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths[name] || paths.dashboard}
    </svg>
  )
    }

    const stats = [
  {
    label: 'Total students',
    value: '2,845',
    change: '+12.8%',
    detail: 'vs. last month',
    icon: 'users',
    color: '#4776e6',
    bg: '#edf2ff',
    points: '0,25 12,20 24,23 36,12 48,16 60,5 72,9',
  },
  {
    label: 'Total teachers',
    value: '124',
    change: '+8.4%',
    detail: 'vs. last month',
    icon: 'book',
    color: '#fe5933',
    bg: '#fff0eb',
    points: '0,20 12,23 24,14 36,18 48,8 60,12 72,3',
  },
  {
    label: 'Active courses',
    value: '86',
    change: '+6.2%',
    detail: 'vs. last month',
    icon: 'chart',
    color: '#20b8a6',
    bg: '#e6f8f5',
    points: '0,24 12,15 24,19 36,10 48,14 60,4 72,7',
  },

]
  return (
    <section>


            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-3">
              {stats.map((stat) => (
                <article
                  key={stat.label}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
                >
                  <div className="flex items-start justify-start gap-1">
                    <span
                      className="flex h-11 w-11 items-center justify-center rounded-xl"
                      style={{
                        backgroundColor: stat.bg,
                        color: stat.color,
                      }}
                    >
                      <Icon name={stat.icon} size={21} />
                    </span>
                      <p className="mt-5 text-sm font-medium text-slate-500">
                        {stat.label}
                      </p>
                    
                  </div>

                  

                  <div className="mt-2 flex flex-wrap items-baseline justify-srart gap-2">
                    <span className="text-3xl font-bold tracking-tight text-[#0b1b33]">
                      {stat.value}
                    </span>
                    
                  </div>

                 
                </article>
              ))}
            </div>
          </section>
  )
}

export default AdminCards
