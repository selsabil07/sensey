
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()

  useEffect(() => {
    const supabase = createClient()
    let active = true

    async function redirectUser() {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser()

      if (!active) return

      if (authError || !user) {
        router.replace('/sign-in')
        return
      }

      const { data: profile, error: profileError } =
        await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single()

      if (!active) return

      if (profileError || !profile) {
        console.error('Profile lookup failed:', profileError)
        router.replace('/sign-in')
        return
      }

      switch (profile.role) {
        case 'student':
          router.replace('/student/dashboard')
          break
        case 'teacher':
          router.replace('/teacher/dashboard')
          break
        case 'admin':
          router.replace('/admin/dashboard')
          break
        default:
          router.replace('/sign-in')
      }
    }

    redirectUser()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b1b33] text-white">
      Loading your dashboard...
    </div>
  )
}