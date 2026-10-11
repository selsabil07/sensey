'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSignup = async (e) => {
    e.preventDefault()

    setError('')
    setSuccess('')

    // Validate fields
    if (!fullName || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.')
      return
    }

    // Check password length
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }

    // Check passwords
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Check terms
    if (!acceptedTerms) {
      setError('Please accept the Terms & Conditions.')
      return
    }

    try {
      setLoading(true)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      })

      if (error) {
        setError(error.message)
        return
      }

      // If email confirmation is enabled
      if (data.user && !data.session) {
        setSuccess(
          'Account created successfully! Please check your email to confirm your account.'
        )
        return
      }

      // If email confirmation is disabled
      if (data.user && data.session) {
        router.push('/student')
        router.refresh()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#071426] px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo / Brand */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-4xl font-bold text-white">
              Sensey
            </h1>
          </Link>

          <p className="mt-3 text-gray-400">
            Learn smarter. Grow faster.
          </p>
        </div>

        {/* Signup Card */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-8 shadow-xl backdrop-blur-md">

          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-white">
              Create your account
            </h2>

            <p className="mt-2 text-sm text-gray-400">
              Start your learning journey with Sensey.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-5">

            {/* Full Name */}
            <div>
              <label
                htmlFor="fullName"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Full name
              </label>

              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full name"
                autoComplete="name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#fe5933]"
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Email
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#fe5933]"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Password
              </label>

              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#fe5933]"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Confirm password
              </label>

              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="new-password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none placeholder:text-gray-500 focus:border-[#fe5933]"
              />
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[#fe5933]"
              />

              <label
                htmlFor="terms"
                className="text-sm leading-5 text-gray-400"
              >
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="text-[#fe5933] hover:underline"
                >
                  Terms & Conditions
                </Link>
              </label>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-[#fe5933] px-4 py-3 font-semibold text-white transition hover:bg-[#e94d2b] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          {/* Login */}
          <p className="mt-6 text-center text-sm text-gray-400">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-[#fe5933] hover:underline"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}