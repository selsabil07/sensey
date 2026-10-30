"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  BookOpen,
  GraduationCap,
  LoaderCircle,
  AlertCircle,
  BookMarked,
  Filter,
  RefreshCw,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import SummaryCard from "@/components/student/SummaryCard";
import CourseCard from "@/components/student/CourseCard";
import EmptyState from "@/components/student/EmptyState";
import Link from "next/link";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};

const FILTERS = ["All courses", "In progress", "Recently added"];

function normalizeCourse(course) {
  // Supabase relationships may return an object or an array.
  return Array.isArray(course) ? course[0] : course;
}

function getInitials(name = "Course") {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}




export default function StudentCoursesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All subjects");
  const [activeFilter, setActiveFilter] = useState("All courses");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadCourses = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.role === "admin") {
          router.replace("/admin/dashboard");
          return;
        }

        if (profile?.role === "teacher") {
          router.replace("/teacher");
          return;
        }

        const { data, error: coursesError } = await supabase
          .from("enrollments")
          .select(`
            id,
            enrolled_at,
            courses (
              id,
              title,
              description,
              subject,
              level,
              thumbnail_url,
              published
            )
          `)
          .eq("student_id", user.id)
          .order("enrolled_at", { ascending: false });

        if (coursesError) throw coursesError;

        const normalizedCourses = (data || [])
          .map((enrollment) => {
            const course = normalizeCourse(enrollment.courses);

            if (!course || !course.id || course.published !== true) {
              return null;
            }

            return {
              ...course,
              enrollment_id: enrollment.id,
              enrolled_at: enrollment.enrolled_at,
            };
          })
          .filter(Boolean);

        setCourses(normalizedCourses);
      } catch (err) {
        console.error("Failed to load student courses:", err);
        setError(
          err?.message || "Something went wrong while loading your courses."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    loadCourses();
  }, [loadCourses]);

  const subjects = useMemo(() => {
    const uniqueSubjects = [
      ...new Set(
        courses
          .map((course) => course.subject?.trim())
          .filter(Boolean)
      ),
    ];

    return ["All subjects", ...uniqueSubjects.sort()];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    let result = [...courses];

    const normalizedSearch = search.trim().toLowerCase();

    if (normalizedSearch) {
      result = result.filter((course) =>
        [
          course.title,
          course.description,
          course.subject,
          course.level,
        ].some((value) =>
          String(value || "").toLowerCase().includes(normalizedSearch)
        )
      );
    }

    if (selectedSubject !== "All subjects") {
      result = result.filter(
        (course) => course.subject === selectedSubject
      );
    }

    if (activeFilter === "Recently added") {
      result.sort(
        (a, b) =>
          new Date(b.enrolled_at || 0).getTime() -
          new Date(a.enrolled_at || 0).getTime()
      );
    }

    return result;
  }, [courses, search, selectedSubject, activeFilter]);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">


        <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-7 lg:p-6">
          {/* Page heading */}
          <section className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
            <div>
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-500">
                <GraduationCap size={17} />
                Student learning
                <span className="text-slate-300">/</span>
                <span className="text-[#4776e6]">My courses</span>
              </div>

              <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1b33] sm:text-4xl">
                My Courses
              </h1>

              <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500 sm:text-base">
                Pick up where you left off and keep building your knowledge,
                one lesson at a time.
              </p>
            </div>

            <button
              type="button"
              onClick={() => loadCourses({ refresh: true })}
              disabled={loading || refreshing}
              className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 sm:self-auto"
            >
              <Link href={'/courses'}>
              view all the courses
              </Link>
              
            </button>
          </section>


          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <SummaryCard
              icon={BookOpen}
              label="Enrolled courses"
              value={courses.length}
              accent={COLORS.blue}
            />

            <SummaryCard
              icon={GraduationCap}
              label="Subjects"
              value={subjects.length - 1}
              accent={COLORS.teal}
            />

            <SummaryCard
              icon={BookMarked}
              label="Courses shown"
              value={filteredCourses.length}
              accent={COLORS.orange}
            />
          </section>

          {/* Search and filters */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-md">
                <Search
                  size={19}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search by course, subject, or level..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:bg-white focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
                  <Filter size={17} />
                  <span>Subject</span>
                </div>

                <select
                  value={selectedSubject}
                  onChange={(event) =>
                    setSelectedSubject(event.target.value)
                  }
                  className="min-w-40 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4776e6] focus:ring-4 focus:ring-blue-100"
                >
                  {subjects.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-2">
              {FILTERS.map((filter) => {
                const active = activeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setActiveFilter(filter)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                    style={{
                      backgroundColor: active ? COLORS.navy : "#f1f5f9",
                      color: active ? "#ffffff" : "#64748b",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </section>

          {/* Course grid */}
          <section>
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-[#0b1b33]">
                  Your learning library
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {loading
                    ? "Loading your courses..."
                    : `${filteredCourses.length} ${
                        filteredCourses.length === 1 ? "course" : "courses"
                      } found`}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-5 flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-2">
                  <AlertCircle size={19} className="mt-0.5 shrink-0" />
                  <div>
                    <p className="font-semibold">
                      We couldn't load your courses.
                    </p>
                    <p className="mt-1 break-words">{error}</p>
                  </div>
                </div>

                <button
                  onClick={() => loadCourses({ refresh: true })}
                  className="shrink-0 rounded-lg border border-red-200 bg-white px-3 py-2 font-semibold hover:bg-red-100"
                >
                  Try again
                </button>
              </div>
            )}

            {loading ? (
              <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
                <LoaderCircle
                  size={34}
                  className="animate-spin text-[#4776e6]"
                />
                <p className="mt-4 text-sm font-medium text-slate-500">
                  Loading your learning library...
                </p>
              </div>
            ) : !error && filteredCourses.length === 0 ? (
              <div className="grid grid-cols-1">
                <EmptyState
                  search={Boolean(search || selectedSubject !== "All subjects")}
                  onClear={() => {
                    setSearch("");
                    setSelectedSubject("All subjects");
                  }}
                />
              </div>
            ) 
            : (
              !error && (
                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
                  {filteredCourses.map((course, index) => (
                    <CourseCard
                      key={course.enrollment_id}
                      course={course}
                      index={index}
                      COLORS={COLORS}
                    />
                  ))}
                </div>
              )
            )}
          </section>
        </main>
      </div>
  );
}


