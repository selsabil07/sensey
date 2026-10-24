import React from 'react'
import { Play, BookOpen } from 'lucide-react' 
import Link from 'next/link'

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}


const Welcome = ({loading, latestCourse, firstName, courses}) => {
  return (
    <div>
        <section className="relative overflow-hidden rounded-3xl bg-[#0b1b33] px-4 py-5 text-white sm:px-9 sm:py-10">
        {/* Decorative shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-[#4776e6]/30 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 right-1/4 h-56 w-56 rounded-full bg-[#fe5933]/20 blur-3xl"
        />

        <div className="relative max-w-2xl">
          {loading ? (
            <div className="space-y-3">
              <div className="h-8 w-64 animate-pulse rounded-lg bg-white/10" />
              <div className="h-4 w-80 max-w-full animate-pulse rounded bg-white/10" />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {getGreeting()}, {firstName}
              </h2>
              <p className="mt-2 text-sm leading-6 text-slate-300 sm:text-base">
                {courses.length > 0
                  ? `You're enrolled in ${courses.length} ${
                      courses.length === 1 ? "course" : "courses"
                    } and have completed ${completedLessons} ${
                      completedLessons === 1 ? "lesson" : "lessons"
                    }. Pick up where you left off.`
                  : "Enroll in a course to start learning. Your lessons, quizzes and progress will show up here."}
              </p>
            </>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            {latestCourse ? (
              <Link
                href={`/student/courses/${latestCourse.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white outline-none transition hover:bg-[#ec4a25] focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <Play size={16} />
                Resume latest course
              </Link>
            ) : (
              <Link
                href="/student/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white outline-none transition hover:bg-[#ec4a25] focus-visible:ring-2 focus-visible:ring-white/70"
              >
                <BookOpen size={16} />
                Browse courses
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  )
}

export default Welcome