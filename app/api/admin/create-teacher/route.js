
import { createServerClient } from '@supabase/ssr'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    // 1. Read and validate the request
    const body = await request.json()

    const {
      full_name,
      number,
      subject,
      email,
      password,
      confirmPassword,
    } = body

    if (
      !full_name?.trim() ||
      !number?.trim() ||
      !subject?.trim() ||
      !email?.trim() ||
      !password ||
      !confirmPassword
    ) {
      return NextResponse.json(
        { error: 'Please fill in all fields.' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must contain at least 8 characters.' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match.' },
        { status: 400 }
      )
    }

    // 2. Create a client using the current user's cookies
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

    // 4. Verify the user's admin role
    const { data: profile, error: profileError } =
      await supabase
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

    // 5. Create a server-only Supabase admin client
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

    // 6. Create the teacher's authentication account
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

    if (!newTeacher) {
      return NextResponse.json(
        { error: 'Teacher account could not be created.' },
        { status: 500 }
      )
    }

    // 7. Save the teacher's profile
    const { error: profileSaveError } =
      await adminSupabase
        .from('profiles')
        .upsert(
          {
            id: newTeacher.id,
            full_name: full_name.trim(),
            role: 'teacher',
            number: number.trim(),
            subject: subject.trim(),
          },
          { onConflict: 'id' }
        )

    // 8. Roll back Auth account if profile saving fails
    if (profileSaveError) {
      console.error(
        'Teacher profile save error:',
        profileSaveError
      )

      await adminSupabase.auth.admin.deleteUser(
        newTeacher.id
      )

      return NextResponse.json(
        { error: 'Could not save the teacher profile.' },
        { status: 500 }
      )
    }

    // 9. Return success
    return NextResponse.json(
      {
        message: 'Teacher account created successfully.',
        teacher: {
          id: newTeacher.id,
          email: newTeacher.email,
          full_name: full_name.trim(),
          number: number.trim(),
          subject: subject.trim(),
          role: 'teacher',
          
        },
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Create teacher API error:', error)

    return NextResponse.json(
      { error: 'An unexpected server error occurred.' },
      { status: 500 }
    )
  }
}
