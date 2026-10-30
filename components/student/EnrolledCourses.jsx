import React from 'react'
import { ArrowRight, Search,BookMarked, Clock3, BookOpen, Play } from 'lucide-react'
import Link from 'next/link'


function CourseSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="h-44 animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
        <div className="h-11 w-full animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

const EnrolledCourses = ({search, filteredCourses, loading, error}) => {

  function formatDate(date) {
    if (!date) return "Recently enrolled";
  
    return new Date(date).toLocaleDateString("en", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }
  

  return (
    <div>
      <section aria-labelledby="courses-heading">
        <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h2
              id="courses-heading"
              className="text-lg font-bold text-[#0b1b33]"
            >
              Continue learning
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Your enrolled courses, newest first.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 transition focus-within:border-[#4776e6] focus-within:ring-4 focus-within:ring-[#4776e6]/10 sm:w-72">
              <Search size={18} className="shrink-0 text-slate-400" />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Filter your courses..."
                aria-label="Filter enrolled courses"
                className="w-full min-w-0 bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>

            <Link
              href="/student/courses"
              className="inline-flex items-center gap-2 whitespace-nowrap text-sm font-semibold text-[#4776e6] outline-none transition hover:text-[#0b1b33] focus-visible:underline"
            >
              View all courses
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            <CourseSkeleton />
            <CourseSkeleton />
            <CourseSkeleton />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-10 text-center">
            <p className="text-sm text-slate-500">
              We couldn't load your courses. Use "Try again" above to reload.
            </p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4776e6]/10 text-[#4776e6]">
              <BookMarked size={27} />
            </div>

            <h3 className="mt-4 text-base font-bold text-[#0b1b33]">
              {search ? "No matching courses" : "You're not enrolled yet"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {search
                ? "Try a different course title, subject or level."
                : "Browse the published courses and enroll in one to start learning."}
            </p>

            {!search && (
              <Link
                href="/student/courses"
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0b1b33] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#142c4c]"
              >
                Browse courses
                <ArrowRight size={16} />
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredCourses.slice(0, 6).map((course) => (
                <article
                  key={course.enrollment_id}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-shadow duration-200 hover:shadow-lg"
                >
                  <div className="relative h-44 shrink-0 overflow-hidden bg-gradient-to-br from-[#0b1b33] to-[#4776e6]">
                    {course.thumbnail_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={course.thumbnail_url}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <BookOpen
                          size={52}
                          strokeWidth={1.2}
                          className="text-white/80"
                        />
                      </div>
                    )}

                    <span className="absolute left-3 top-3 rounded-lg bg-white/95 px-3 py-1.5 text-xs font-semibold text-[#0b1b33]">
                      {course.subject || "Course"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
                      {course.level && (
                        <span className="rounded-md bg-slate-100 px-2.5 py-1">
                          {course.level}
                        </span>
                      )}

                      <span className="flex items-center gap-1">
                        <Clock3 size={13} />
                        Joined {formatDate(course.enrolled_at)}
                      </span>
                    </div>

                    <h3 className="mt-3 line-clamp-2 text-lg font-bold text-[#0b1b33]">
                      {course.title}
                    </h3>

                    <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-5 text-slate-500">
                      {course.description ||
                        "Open this course to explore its learning materials."}
                    </p>

                    <div className="mt-auto pt-5">
                      <Link
                        href={`/student/courses/${course.id}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1b33] px-4 py-3 text-sm font-semibold text-white outline-none transition hover:bg-[#fe5933] focus-visible:ring-2 focus-visible:ring-[#fe5933]/70 focus-visible:ring-offset-2"
                      >
                        <Play size={16} />
                        Open course
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filteredCourses.length > 6 && (
              <div className="mt-6 text-center">
                <Link
                  href="/student/courses"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-[#4776e6] hover:text-[#0b1b33]"
                >
                  See {filteredCourses.length - 6} more{" "}
                  {filteredCourses.length - 6 === 1 ? "course" : "courses"}
                  <ArrowRight size={16} />
                </Link>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  )
}

export default EnrolledCourses