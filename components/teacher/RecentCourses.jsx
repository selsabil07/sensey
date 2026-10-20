import React from 'react'
import Link from "next/link";
import { BookOpen, Plus, Clock, GraduationCap, ArrowUpRight } from "lucide-react";


const RecentCourses = ({ courses }) => {

  return (
    <div>
                  <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">My Recent Courses</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Manage the courses you're teaching.
                </p>
              </div>

              <Link
                href="/teacher/courses"
                className="shrink-0 text-sm font-semibold text-[#fe5933] hover:underline"
              >
                View all
              </Link>
            </div>

            {courses.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-5 py-10 text-center">
                <BookOpen
                  size={34}
                  className="mx-auto mb-3 text-slate-300"
                />

                <h3 className="font-semibold">No courses yet</h3>

                <p className="mx-auto mt-2 max-w-xs text-sm text-slate-500">
                  Create your first course to start building your classroom.
                </p>

                <Link
                  href="/teacher/courses/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-lg bg-[#0b1b33] px-4 py-2.5 text-sm font-medium text-white hover:bg-[#172e4e]"
                >
                  <Plus size={16} />
                  Create your first course
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {courses.slice(0, 5).map((course) => (
                  <div
                    key={course.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 hover:bg-slate-50 sm:gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2ff] text-[#4776e6]">
                      <GraduationCap size={22} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold">
                        {course.title || "Untitled course"}
                      </h3>

                      <p className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                        <Clock size={13} />
                        Created{" "}
                        {course.created_at
                          ? new Date(course.created_at).toLocaleDateString()
                          : "recently"}
                      </p>
                    </div>

                    <Link
                      href={`/teacher/courses/${course.id}/edit`}
                      aria-label={`Manage ${course.title}`}
                      className="rounded-lg p-2 text-slate-400 hover:bg-white hover:text-[#fe5933]"
                    >
                      <ArrowUpRight size={19} />
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>

    </div>
  )
}

export default RecentCourses