"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "@/components/student/StatCard";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  CheckCircle2,
  Clock3,
  AlertCircle,
  BookMarked,
  ArrowRight,
  Play,
  Bot,
  Search,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};

function formatDate(date) {
  if (!date) return "Recently enrolled";

  return new Date(date).toLocaleDateString("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getGreeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}


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

/* ---------- Page ---------- */

export default function StudentDashboardPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [completedLessons, setCompletedLessons] = useState(0);
  const [quizCount, setQuizCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadDashboard = useCallback(async () => {
    setLoading(true);
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

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, role, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) throw profileError;

      if (profileData?.role && profileData.role !== "student") {
        router.replace(
          profileData.role === "admin" ? "/admin/dashboard" : "/teacher"
        );
        return;
      }

      setProfile({
        ...profileData,
        email: profileData?.email || user.email || "",
        full_name:
          profileData?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student",
      });

      const { data: enrollmentData, error: enrollmentError } = await supabase
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

      if (enrollmentError) throw enrollmentError;

      const enrolledCourses = (enrollmentData || [])
        .map((item) => ({
          ...item.courses,
          enrolled_at: item.enrolled_at,
          enrollment_id: item.id,
        }))
        .filter((course) => course.id && course.published === true);

      setCourses(enrolledCourses);

      // Statistics are optional. Their failure should not break the dashboard.
      const [progressResult, attemptsResult] = await Promise.all([
        supabase
          .from("progress")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .eq("completed", true),

        supabase
          .from("quiz_attempts")
          .select("id", { count: "exact", head: true })
          .eq("student_id", user.id)
          .not("completed_at", "is", null),
      ]);

      setCompletedLessons(progressResult.error ? 0 : progressResult.count || 0);
      setQuizCount(attemptsResult.error ? 0 : attemptsResult.count || 0);
    } catch (err) {
      console.error("Student dashboard error:", err);
      setError(
        err?.message || "We couldn't load your dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }, [router, supabase]);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return courses;

    return courses.filter(
      (course) =>
        course.title?.toLowerCase().includes(query) ||
        course.subject?.toLowerCase().includes(query) ||
        course.level?.toLowerCase().includes(query)
    );
  }, [courses, search]);

  const firstName = profile?.full_name?.trim().split(/\s+/)[0] || "Student";

  // Most recently enrolled course, used for the hero shortcut.
  const latestCourse = courses[0];

  return (
    <div className="space-y-8">
      {/* Error message */}
      {error && (
        <div
          role="alert"
          className="flex flex-col gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 sm:flex-row sm:items-center sm:justify-between"
        >
          <div className="flex items-start gap-2">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p>{error}</p>
          </div>

          <button
            type="button"
            onClick={loadDashboard}
            className="self-start font-semibold underline underline-offset-2 sm:self-auto"
          >
            Try again
          </button>
        </div>
      )}

      {/* Welcome */}
      <section className="relative overflow-hidden rounded-3xl bg-[#0b1b33] px-4 py-5 text-white sm:px-9 sm:py-10">
        {/* Decorative shapes */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#4776e6]/30 blur-3xl"
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

            <Link
              href="/student/ai-assistant"
              className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white outline-none transition hover:bg-white/20 focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <Bot size={16} />
              Ask the AI assistant
            </Link>
          </div>
        </div>
      </section>

      {/* Learning statistics */}
      <section aria-labelledby="stats-heading">
        <h2 id="stats-heading" className="sr-only">
          Your learning at a glance
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard
            title="Enrolled courses"
            value={courses.length}
            subtitle="Published courses you can open"
            icon={BookOpen}
            color={COLORS.blue}
            loading={loading}
          />

          <StatCard
            title="Completed lessons"
            value={completedLessons}
            subtitle="Lessons marked complete"
            icon={CheckCircle2}
            color={COLORS.teal}
            loading={loading}
          />

          <StatCard
            title="Quizzes completed"
            value={quizCount}
            subtitle="Submitted quiz attempts"
            icon={ClipboardList}
            color={COLORS.purple}
            loading={loading}
          />
        </div>
      </section>

      {/* Enrolled courses */}
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

      {/* Quick actions */}
      <section
        aria-label="Quick actions"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <Link
          href="/student/ai-assistant"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 outline-none transition hover:border-[#4776e6]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 sm:p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4776e6]/10 text-[#4776e6]">
            <Bot size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#0b1b33]">Get help with a lesson</h3>
            <p className="mt-1 text-sm text-slate-500">
              Ask the AI assistant to explain anything you're stuck on.
            </p>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#4776e6]"
          />
        </Link>

        <Link
          href="/student/quizzes"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 outline-none transition hover:border-[#20b8a6]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#20b8a6]/60 sm:p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#20b8a6]/10 text-[#20b8a6]">
            <ClipboardList size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#0b1b33]">Practice and review</h3>
            <p className="mt-1 text-sm text-slate-500">
              Take available quizzes and review your results.
            </p>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#20b8a6]"
          />
        </Link>
      </section>

      <footer className="border-t border-slate-200 py-5 text-center text-xs text-slate-400">
        © {new Date().getFullYear()} Sensey. Keep learning, one step at a time.
      </footer>
    </div>
  );
}