
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function PATCH(request) {
  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              request.cookies.set(name, value, options)
            })
          },
        },
      }
    )

    // Verify the current session
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'You must be signed in.' },
        { status: 401 }
      )
    }

    // Only admins can manage account status
    const { data: adminProfile, error: adminError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

    if (adminError || adminProfile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can manage accounts.' },
        { status: 403 }
      )
    }

    const { userId, isActive } = await request.json()

    if (
      typeof userId !== 'string' ||
      !userId ||
      typeof isActive !== 'boolean'
    ) {
      return NextResponse.json(
        { error: 'A valid userId and isActive value are required.' },
        { status: 400 }
      )
    }

    // Prevent changing your own account through this endpoint
    if (userId === user.id) {
      return NextResponse.json(
        { error: 'You cannot change your own account status.' },
        { status: 400 }
      )
    }

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY

    if (!serviceRoleKey) {
      console.error('Missing SUPABASE_SERVICE_ROLE_KEY')

      return NextResponse.json(
        { error: 'Server configuration error.' },
        { status: 500 }
      )
    }

    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      serviceRoleKey,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Find the target profile and restrict changes to
    // teachers and students.
    const { data: target, error: targetError } =
      await adminSupabase
        .from('profiles')
        .select('id, role, is_active')
        .eq('id', userId)
        .maybeSingle()

    if (targetError) {
      console.error('Target profile lookup failed:', targetError)

      return NextResponse.json(
        { error: 'Could not look up the user.' },
        { status: 500 }
      )
    }

    if (!target) {
      return NextResponse.json(
        { error: 'User not found.' },
        { status: 404 }
      )
    }

    if (!['teacher', 'student'].includes(target.role)) {
      return NextResponse.json(
        { error: 'Only teacher and student accounts can be changed here.' },
        { status: 403 }
      )
    }

    if (target.is_active === isActive) {
      return NextResponse.json({
        message: 'Account status is already up to date.',
        userId,
        isActive,
      })
    }

    // Disable or re-enable Supabase Auth sign-in.
    const { error: authUpdateError } =
      await adminSupabase.auth.admin.updateUserById(
        userId,
        {
          ban_duration: isActive ? 'none' : '876000h',
        }
      )

    if (authUpdateError) {
      console.error('Auth status update failed:', authUpdateError)

      return NextResponse.json(
        { error: 'Could not update the authentication status.' },
        { status: 500 }
      )
    }

    // Persist the status in the profile.
    const { error: profileUpdateError } =
      await adminSupabase
        .from('profiles')
        .update({ is_active: isActive })
        .eq('id', userId)

    if (profileUpdateError) {
      console.error(
        'Profile status update failed:',
        profileUpdateError
      )

      // Roll back the Auth ban if the profile update fails.
      const { error: rollbackError } =
        await adminSupabase.auth.admin.updateUserById(
          userId,
          {
            ban_duration: isActive ? '876000h' : 'none',
          }
        )

      if (rollbackError) {
        console.error('Auth rollback failed:', rollbackError)
      }

      return NextResponse.json(
        { error: 'Could not save the account status.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      message: isActive
        ? 'Account reactivated successfully.'
        : 'Account deactivated successfully.',
      userId,
      isActive,
    })
  } catch (error) {
    console.error('Account status API error:', error)

    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    )
  }
}
