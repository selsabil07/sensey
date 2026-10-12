
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
import Link from 'next/link'


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
    <div className="bg-[#b2c9f5de] min-h-screen ">

      <main className=" min-w-0 p-1  ">
        {/* Dashboard content */}
        <div className="  space-y-7">


          {/* Statistics */}
          <section>
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-[#0b1b33]">
                Platform overview
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Key metrics at a glance
              </p>
              </div>
              
              <Link href="/admin/create-teacher">
                <button className= "rounded-xl border-gray-600 border p-4 bg-orange-600 text-white" >create a teacher account</button>
              </Link>
              
            </div>

            <AdminCards />

          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.6fr_1fr]">
            <Chart />
            <Pie />
          </section>

          {/* Activity and popular courses */}

            <section className="grid grid-cols-1 items-start gap-6 lg:grid-cols-5 2xl:grid-cols-[0.85fr_1.5fr]">
              <div className="min-w-0 lg:col-span-2">
                <RecentActivity />
              </div>

              <div className="min-w-0 lg:col-span-3">
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