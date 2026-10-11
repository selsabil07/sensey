
// 'use client'

// import { useState } from 'react'
// import Link from 'next/link'
// import AdminCards from '@/components/admin/AdminCards'
// import Sidebar from '@/components/admin/Sidebar'

// const COLORS = {
//   navy: '#0b1b33',
//   orange: '#fe5933',
//   blue: '#4776e6',
//   teal: '#20b8a6',
//   purple: '#9274e8',
// }

// function Icon({ name, size = 20, strokeWidth = 1.8 }) {
//   const paths = {
//     dashboard: <><rect x="3" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="3" width="7" height="7" rx="1.5" /><rect x="14" y="14" width="7" height="7" rx="1.5" /><rect x="3" y="14" width="7" height="7" rx="1.5" /></>,
//     users: <><path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="10" cy="7" r="4" /><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" /></>,
//     book: <><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" /></>,
//     chart: <><path d="M3 3v18h18" /><path d="m19 9-5 5-4-4-5 5" /></>,
//     settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.6a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.6-1.4-2.4L7.3 15a8 8 0 0 1 0-2l-1.4-1.1 1.4-2.4 1.7.6a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.6 1.4 2.4-1.4 1.1a8 8 0 0 1-.1 2Z" transform="translate(-1 -1) scale(1.08)" /></>,
//     bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" /><path d="M10 21h4" /></>,
//     search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
//     arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
//     menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
//     close: <><path d="m18 6-12 12M6 6l12 12" /></>,
//     logout: <><path d="M10 17l5-5-5-5M15 12H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
//     calendar: <><rect x="3" y="5" width="18" height="16" rx="2" /><path d="M16 3v4M8 3v4M3 11h18" /></>,
//     clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
//     check: <path d="m5 12 4 4L19 6" />,
//     plus: <path d="M12 5v14M5 12h14" />,
//   }

//   return (
//     <svg
//       width={size}
//       height={size}
//       viewBox="0 0 24 24"
//       fill="none"
//       stroke="currentColor"
//       strokeWidth={strokeWidth}
//       strokeLinecap="round"
//       strokeLinejoin="round"
//       aria-hidden="true"
//       className="shrink-0"
//     >
//       {paths[name] || paths.dashboard}
//     </svg>
//   )
// }

// const navigation = [
//   { label: 'Overview', icon: 'dashboard', href: '/admin' },
//   { label: 'Teachers', icon: 'users', href: '/admin/teachers' },
//   { label: 'Students', icon: 'users', href: '/admin/students' },
//   { label: 'Courses', icon: 'book', href: '/admin/courses' },
//   { label: 'Analytics', icon: 'chart', href: '/admin/analytics' },
// ]



// const activity = [
//   {
//     initials: 'SA',
//     name: 'Sarah Ahmed',
//     action: 'published a new course',
//     subject: 'Introduction to Mathematics',
//     time: '5 min ago',
//     color: '#4776e6',
//   },
//   {
//     initials: 'MK',
//     name: 'Mohamed Karim',
//     action: 'joined Sensey as a student',
//     subject: 'Student registration',
//     time: '18 min ago',
//     color: '#fe5933',
//   },
//   {
//     initials: 'LN',
//     name: 'Lina Nour',
//     action: 'completed a course',
//     subject: 'English for Beginners',
//     time: '32 min ago',
//     color: '#20b8a6',
//   },
//   {
//     initials: 'YA',
//     name: 'Yacine Amrani',
//     action: 'created a new lesson',
//     subject: 'JavaScript Fundamentals',
//     time: '1 hour ago',
//     color: '#9274e8',
//   },
// ]

// const subjects = [
//   { name: 'Mathematics', value: 35, color: '#fe5933' },
//   { name: 'Languages', value: 25, color: '#4776e6' },
//   { name: 'Science', value: 20, color: '#20b8a6' },
//   { name: 'Programming', value: 12, color: '#9274e8' },
//   { name: 'Other', value: 8, color: '#d8dee9' },
// ]

// const weeklyActivity = [
//   { day: 'Mon', students: 42, lessons: 28 },
//   { day: 'Tue', students: 58, lessons: 38 },
//   { day: 'Wed', students: 47, lessons: 32 },
//   { day: 'Thu', students: 75, lessons: 49 },
//   { day: 'Fri', students: 62, lessons: 43 },
//   { day: 'Sat', students: 88, lessons: 55 },
//   { day: 'Sun', students: 70, lessons: 46 },
// ]

// function WeeklyChart() {
//   const width = 620
//   const height = 230
//   const left = 38
//   const right = 12
//   const top = 15
//   const bottom = 30
//   const chartWidth = width - left - right
//   const chartHeight = height - top - bottom

//   const getX = (index) =>
//     left + (index * chartWidth) / (weeklyActivity.length - 1)

//   const getY = (value) =>
//     top + chartHeight - (value / 100) * chartHeight

//   const makePoints = (key) =>
//     weeklyActivity
//       .map((item, index) => `${getX(index)},${getY(item[key])}`)
//       .join(' ')

//   return (
//     <div className="w-full">
//       <div className="mb-5 flex flex-wrap items-center gap-5 text-xs text-slate-500">
//         <span className="flex items-center gap-2">
//           <span className="h-2.5 w-2.5 rounded-full bg-[#fe5933]" />
//           Active students
//         </span>
//         <span className="flex items-center gap-2">
//           <span className="h-2.5 w-2.5 rounded-full bg-[#4776e6]" />
//           Lessons completed
//         </span>
//       </div>

//       <svg
//         viewBox={`0 0 ${width} ${height}`}
//         className="w-full overflow-visible"
//         role="img"
//         aria-label="Weekly activity line chart"
//       >
//         {[0, 25, 50, 75, 100].map((value) => (
//           <g key={value}>
//             <line
//               x1={left}
//               x2={width - right}
//               y1={getY(value)}
//               y2={getY(value)}
//               stroke="#e9edf4"
//               strokeDasharray="4 5"
//             />
//             <text
//               x={left - 10}
//               y={getY(value) + 4}
//               fontSize="10"
//               textAnchor="end"
//               fill="#94a3b8"
//             >
//               {value}
//             </text>
//           </g>
//         ))}

//         <polygon
//           points={`${left},${getY(0)} ${makePoints('students')} ${getX(6)},${getY(0)}`}
//           fill="#fe5933"
//           opacity="0.07"
//         />

//         <polyline
//           points={makePoints('students')}
//           fill="none"
//           stroke="#fe5933"
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />

//         <polyline
//           points={makePoints('lessons')}
//           fill="none"
//           stroke="#4776e6"
//           strokeWidth="3"
//           strokeLinecap="round"
//           strokeLinejoin="round"
//         />

//         {weeklyActivity.map((item, index) => (
//           <g key={item.day}>
//             <circle
//               cx={getX(index)}
//               cy={getY(item.students)}
//               r="4"
//               fill="#fff"
//               stroke="#fe5933"
//               strokeWidth="2.5"
//             />
//             <circle
//               cx={getX(index)}
//               cy={getY(item.lessons)}
//               r="3.5"
//               fill="#fff"
//               stroke="#4776e6"
//               strokeWidth="2.5"
//             />
//             <text
//               x={getX(index)}
//               y={height - 6}
//               fontSize="11"
//               textAnchor="middle"
//               fill="#94a3b8"
//             >
//               {item.day}
//             </text>
//           </g>
//         ))}
//       </svg>
//     </div>
//   )
// }

// function SubjectPieChart() {
//   let accumulated = 0

//   const gradient = subjects
//     .map((subject) => {
//       const start = accumulated
//       accumulated += subject.value
//       return `${subject.color} ${start}% ${accumulated}%`
//     })
//     .join(', ')

//   return (
//     <div className="flex flex-col items-center gap-7 sm:flex-row sm:items-center sm:justify-around">
//       <div
//         className="relative h-44 w-44 shrink-0 rounded-full"
//         style={{ background: `conic-gradient(${gradient})` }}
//         role="img"
//         aria-label="Course distribution by subject"
//       >
//         <div className="absolute inset-[23%] flex flex-col items-center justify-center rounded-full bg-white">
//           <span className="text-3xl font-bold tracking-tight text-[#0b1b33]">
//             86
//           </span>
//           <span className="mt-1 text-xs text-slate-400">Total courses</span>
//         </div>
//       </div>

//       <div className="w-full space-y-4 sm:w-auto sm:min-w-36">
//         {subjects.map((subject) => (
//           <div
//             key={subject.name}
//             className="flex items-center justify-between gap-5"
//           >
//             <span className="flex items-center gap-2.5 text-sm text-slate-600">
//               <span
//                 className="h-2.5 w-2.5 rounded-full"
//                 style={{ backgroundColor: subject.color }}
//               />
//               {subject.name}
//             </span>
//             <span className="text-sm font-semibold text-[#0b1b33]">
//               {subject.value}%
//             </span>
//           </div>
//         ))}
//       </div>
//     </div>
//   )
// }

// export default function AdminDashboardPage() {
//   const [menuOpen, setMenuOpen] = useState(false)
//   const [period, setPeriod] = useState('7 days')

//   return (
//     <main className="min-h-screen bg-[#f5f7fb] text-[#0b1b33]">
//       {menuOpen && (
//         <button
//           type="button"
//           aria-label="Close sidebar"
//           onClick={() => setMenuOpen(false)}
//           className="fixed inset-0 z-40 bg-[#0b1b33]/40 lg:hidden"
//         />
//       )}

//       {/* Sidebar */}
//       <Sidebar menuOpen={menuOpen} setMenuOpen={setMenuOpen} />

//       {/* Main content */}
//       <section className="min-w-0 lg:ml-[260px]">
//         {/* Header */}
//         <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between gap-3 border-b border-slate-100 bg-white/90 px-4 backdrop-blur-xl sm:px-7 lg:px-10">
//           <div className="flex min-w-0 items-center gap-3">
//             <button
//               type="button"
//               onClick={() => setMenuOpen(true)}
//               aria-label="Open menu"
//               className="rounded-xl border border-slate-200 p-2.5 text-slate-600 hover:bg-slate-50 lg:hidden"
//             >
//               <Icon name="menu" />
//             </button>

//             <div className="min-w-0">
//               <p className="text-xs text-slate-400">Workspace / Overview</p>
//               <h1 className="mt-1 truncate text-lg font-bold tracking-tight sm:text-xl">
//                 Dashboard overview
//               </h1>
//             </div>
//           </div>

//           <div className="flex items-center gap-2 sm:gap-4">
//             <div className="hidden items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 md:flex">
//               <Icon name="search" size={17} />
//               <input
//                 aria-label="Search dashboard"
//                 placeholder="Search anything..."
//                 className="w-36 bg-transparent text-sm outline-none placeholder:text-slate-400"
//               />
//               <kbd className="rounded border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] text-slate-400">
//                 /
//               </kbd>
//             </div>

//             <button
//               type="button"
//               aria-label="Notifications"
//               className="relative rounded-xl border border-slate-200 p-2.5 text-slate-500 transition hover:bg-slate-50"
//             >
//               <Icon name="bell" size={19} />
//               <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-white bg-[#fe5933]" />
//             </button>

//             <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0b1b33] text-xs font-bold text-white">
//               AD
//             </div>
//           </div>
//         </header>

//         <div className="mx-auto max-w-[1600px] space-y-7 p-4 sm:p-7 lg:p-10">
          

//           {/* Summary cards */}
//           <AdminCards />
          

//           {/* Charts */}
//           <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
//             <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 xl:col-span-3">
//               <div className="flex flex-wrap items-start justify-between gap-3">
//                 <div>
//                   <h2 className="text-base font-bold">Learning activity</h2>
//                   <p className="mt-1 text-xs text-slate-400">
//                     Student engagement throughout the week
//                   </p>
//                 </div>

//                 <select
//                   value={period}
//                   onChange={(e) => setPeriod(e.target.value)}
//                   aria-label="Chart time period"
//                   className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 outline-none focus:border-[#fe5933]"
//                 >
//                   <option>7 days</option>
//                   <option>30 days</option>
//                   <option>90 days</option>
//                 </select>
//               </div>

//               <div className="mt-7">
//                 <WeeklyChart />
//               </div>

//               <p className="mt-3 text-[11px] text-slate-400">
//                 Illustrative weekly data. Connect your analytics query to display real activity.
//               </p>
//             </article>

//             <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 xl:col-span-2">
//               <div>
//                 <h2 className="text-base font-bold">Course distribution</h2>
//                 <p className="mt-1 text-xs text-slate-400">
//                   Courses grouped by subject
//                 </p>
//               </div>

//               <div className="mt-7">
//                 <SubjectPieChart />
//               </div>

//               <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-4">
//                 <span className="text-xs text-slate-500">
//                   Most popular subject
//                 </span>
//                 <span className="rounded-lg bg-[#fff0eb] px-2.5 py-1.5 text-xs font-semibold text-[#fe5933]">
//                   Mathematics
//                 </span>
//               </div>
//             </article>
//           </section>

//           {/* Activity and course table */}
//           <section className="grid grid-cols-1 gap-5 xl:grid-cols-5">
//             <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 xl:col-span-3">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <h2 className="text-base font-bold">Recent activity</h2>
//                   <p className="mt-1 text-xs text-slate-400">
//                     Latest events across Sensey
//                   </p>
//                 </div>

//                 <button
//                   type="button"
//                   className="text-xs font-semibold text-[#fe5933] hover:underline"
//                 >
//                   View all
//                 </button>
//               </div>

//               <div className="mt-5 divide-y divide-slate-100">
//                 {activity.map((item) => (
//                   <div
//                     key={`${item.name}-${item.time}`}
//                     className="flex items-start gap-3 py-4 first:pt-1 last:pb-1"
//                   >
//                     <div
//                       className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold"
//                       style={{
//                         backgroundColor: `${item.color}15`,
//                         color: item.color,
//                       }}
//                     >
//                       {item.initials}
//                     </div>

//                     <div className="min-w-0 flex-1">
//                       <p className="text-sm leading-5 text-slate-700">
//                         <span className="font-semibold text-[#0b1b33]">
//                           {item.name}
//                         </span>{' '}
//                         {item.action}
//                       </p>
//                       <p className="mt-1 truncate text-xs text-slate-400">
//                         {item.subject}
//                       </p>
//                     </div>

//                     <span className="shrink-0 pt-1 text-[10px] text-slate-400 sm:text-xs">
//                       {item.time}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </article>

//             <article className="min-w-0 rounded-2xl border border-slate-100 bg-white p-5 sm:p-6 xl:col-span-2">
//               <div className="flex items-center justify-between gap-3">
//                 <div>
//                   <h2 className="text-base font-bold">Top courses</h2>
//                   <p className="mt-1 text-xs text-slate-400">
//                     Popular learning content
//                   </p>
//                 </div>

//                 <Link
//                   href="/admin/courses"
//                   className="text-xs font-semibold text-[#fe5933] hover:underline"
//                 >
//                   View all
//                 </Link>
//               </div>

//               <div className="mt-6 space-y-5">
//                 {[
//                   {
//                     name: 'Mathematics Essentials',
//                     teacher: 'Sarah Ahmed',
//                     students: 428,
//                     percent: 85,
//                     color: '#fe5933',
//                   },
//                   {
//                     name: 'English for Beginners',
//                     teacher: 'Lina Nour',
//                     students: 356,
//                     percent: 71,
//                     color: '#4776e6',
//                   },
//                   {
//                     name: 'JavaScript Fundamentals',
//                     teacher: 'Yacine Amrani',
//                     students: 294,
//                     percent: 59,
//                     color: '#20b8a6',
//                   },
//                   {
//                     name: 'General Science',
//                     teacher: 'Mohamed Karim',
//                     students: 213,
//                     percent: 43,
//                     color: '#9274e8',
//                   },
//                 ].map((course) => (
//                   <div key={course.name}>
//                     <div className="flex items-start justify-between gap-3">
//                       <div className="min-w-0">
//                         <p className="truncate text-sm font-semibold text-[#0b1b33]">
//                           {course.name}
//                         </p>
//                         <p className="mt-1 text-xs text-slate-400">
//                           {course.teacher}
//                         </p>
//                       </div>

//                       <span className="shrink-0 text-xs font-semibold text-slate-600">
//                         {course.students}
//                       </span>
//                     </div>

//                     <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-slate-100">
//                       <div
//                         className="h-full rounded-full transition-all"
//                         style={{
//                           width: `${course.percent}%`,
//                           backgroundColor: course.color,
//                         }}
//                       />
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </article>
//           </section>

//           <footer className="flex flex-col items-center justify-between gap-2 border-t border-slate-200/80 py-5 text-xs text-slate-400 sm:flex-row">
//             <p>© 2026 Sensey. Made for better learning.</p>
//             <p>Admin workspace · Dashboard preview</p>
//           </footer>
//         </div>
//       </section>
//     </main>
//   )
// }

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'


import Sidebar from '@/components/admin/Sidebar'
import AdminCards from '@/components/admin/AdminCards'
import Chart from '@/components/admin/Chart'
import Pie from '@/components/admin/Pie'
import RecentActivity from '@/components/admin/RecentActivity'
import TopCourses from '@/components/admin/TopCourses'


export default function AdminDashboard() {
  const [loggingOut, setLoggingOut] = useState(false)

  const router = useRouter()

  async function handleLogout() {
    if (loggingOut) return

    setLoggingOut(true)

    const supabase = createClient()
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Logout failed:', error.message)
      setLoggingOut(false)
      return
    }

    router.replace('/sign-in')
    router.refresh()
  }

  return (
    <div className="min-h-screen ">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={handleLogout}
      />

      <main className=" min-w-0 lg:ml-[260px] ">
        {/* Top bar */}
        

        {/* Dashboard content */}
        <div className="mx-auto max-w-[1600px] space-y-7">


          {/* Statistics */}
          <section>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-[#0b1b33]">
                Platform overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Key metrics at a glance
              </p>
            </div>

            <AdminCards />
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Chart />
            <Pie />
          </section>

          {/* Activity and popular courses */}
          <section className="grid  lg:grid-cols-5 items-start gap-6 2xl:grid-cols-[0.85fr_1.5fr]">
            <div className="lg:col-span-2 2xl:col-span-1">
              <RecentActivity />
            </div>
            <div className="lg:col-span-3 2xl:col-span-1">
              <TopCourses />
            </div>
            
          </section>

          {/* Footer */}
          <footer className="flex flex-col justify-between gap-2 border-t border-slate-200 pt-5 text-xs text-slate-400 sm:flex-row">
            <p>
              © {new Date().getFullYear()} Sensey. All rights reserved.
            </p>
            <p>Made for better learning.</p>
          </footer>
        </div>
      </main>
    </div>
  )
}