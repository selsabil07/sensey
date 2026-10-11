
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // 1. Read the incoming request
    const body = await request.json()
    const { full_name, email, password } = body

    if (
      !full_name?.trim() ||
      !email?.trim() ||
      !password ||
      password.length < 8
    ) {
      return NextResponse.json(
        {
          error:
            'Full name, valid email, and a password of at least 8 characters are required.',
        },
        { status: 400 }
      )
    }

    // 2. Create a Supabase client using the current user's cookies
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
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    // 3. Verify the logged-in user
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

    // 4. Check the role from the database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can create teacher accounts.' },
        { status: 403 }
      )
    }

    // 5. Use the secret key only on the server
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // 6. Create the teacher's Auth account
    const {
      data: { user: newTeacher },
      error: createError,
    } = await adminSupabase.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: false,
      user_metadata: {
        full_name: full_name.trim(),
      },
    })

    if (createError) {
      return NextResponse.json(
        { error: createError.message },
        { status: 400 }
      )
    }

    // 7. Set the teacher role in the profile
    const { error: updateError } = await adminSupabase
      .from('profiles')
      .update({ role: 'teacher' })
      .eq('id', newTeacher.id)

    if (updateError) {
      // Avoid leaving an account that was created without its role.
      await adminSupabase.auth.admin.deleteUser(newTeacher.id)

      return NextResponse.json(
        { error: 'Could not assign the teacher role.' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        message: 'Teacher account created successfully.',
        teacher: {
          id: newTeacher.id,
          email: newTeacher.email,
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create teacher error:', error)

    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    )
  }
}