
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value)
          })

          supabaseResponse = NextResponse.next({
            request,
          })

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  // Verify the authenticated user
  const { data, error } = await supabase.auth.getClaims()
  const user = data?.claims

  const pathname = request.nextUrl.pathname

  // Redirect unauthenticated users away from protected pages
  if (!user || error) {
    if (
      pathname.startsWith('/student') ||
      pathname.startsWith('/teacher') ||
      pathname.startsWith('/admin')
    ) {
      return NextResponse.redirect(
        new URL('/sign-in', request.url)
      )
    }

    return supabaseResponse
  }

  // Fetch the role from the database, not user-provided metadata
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.sub)
    .single()

  if (profileError || !profile) {
    console.error('Profile lookup failed:', profileError)

    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  const role = profile.role

  // Protect student routes
  if (
    pathname.startsWith('/student') &&
    role !== 'student'
  ) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  // Protect teacher routes
  if (
    pathname.startsWith('/teacher') &&
    role !== 'teacher' &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  // Protect admin routes
  if (
    pathname.startsWith('/admin') &&
    role !== 'admin'
  ) {
    return NextResponse.redirect(
      new URL('/sign-in', request.url)
    )
  }

  return supabaseResponse
}