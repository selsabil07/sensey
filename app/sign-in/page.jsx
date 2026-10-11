
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e) => {
    e.preventDefault()

    setLoading(true)
    setError('')

    const supabase = createClient()

    try {
      // 1. Sign in with Supabase Auth
      const { data, error: loginError } =
        await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

      if (loginError) {
        setError('Invalid email or password.')
        return
      }

      // 2. Get the user's role from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('id, role')
        .eq('id', data.user.id)
        .maybeSingle()

      console.log('Authenticated user:', data.user.id)
      console.log('Profile returned:', profile)


      if (profileError) {
        setError(`Profile lookup failed: ${profileError.message}`)
        return
      }

      if (!profile) {
        setError('No profile exists for this account.')
        return
      }

      // 3. Redirect according to the database role
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
          await supabase.auth.signOut()
          setError(
            'Your account has an invalid role. Please contact the administrator.'
          )
          return
      }

      router.refresh()
    } catch (err) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0b1b33] px-6 py-10">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-bold text-[#0b1b33]">
            Sense<span className="text-[#fe5933]">y</span>
          </Link>

          <h1 className="mt-6 text-3xl font-bold text-[#0b1b33]">
            Welcome back
          </h1>

          <p className="mt-2 text-gray-500">
            Sign in to continue with Sensey
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#fe5933] focus:ring-1 focus:ring-[#fe5933]"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-700"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              autoComplete="current-password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-300 px-4 py-3 outline-none focus:border-[#fe5933] focus:ring-1 focus:ring-[#fe5933]"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[#fe5933] px-4 py-3 font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Don't have an account?{' '}
          <Link
            href="/signup"
            className="font-semibold text-[#fe5933] hover:underline"
          >
            Sign up as a student
          </Link>
        </p>
      </div>
    </main>
  )
}