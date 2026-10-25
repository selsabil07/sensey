"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  Clock3,
  Circle,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  Inbox,
  ArrowUpRight,
  GraduationCap,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import SummaryCard from "@/components/student/SummaryCard";
import EmptyState from "@/components/student/EmptyState";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};

const STATUS_FILTERS = ["All", "Completed", "In progress", "Not started"];

function normalizeRelation(value) {
  return Array.isArray(value) ? value[0] : value;
}

function getCourseStatus(course) {
  if (course.totalLessons > 0 && course.completedLessons >= course.totalLessons) {
    return "Completed";
  }
  if (course.completedLessons > 0) return "In progress";
  return "Not started";
}

function formatDate(value) {
  if (!value) return "No activity yet";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No activity yet";
  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ProgressBar({ value, color = COLORS.blue }) {
  const safeValue = Math.min(100, Math.max(0, Number(value) || 0));

  return (
    <div
      className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`${safeValue}% complete`}
    >
      <div
        className="h-full rounded-full transition-all duration-500"
        style={{ width: `${safeValue}%`, backgroundColor: color }}
      />
    </div>
  );
}

function CourseProgressCard({ course, onContinue }) {
  const status = getCourseStatus(course);
  const statusColor =
    status === "Completed"
      ? COLORS.teal
      : status === "In progress"
        ? COLORS.blue
        : "#64748b";

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{ color: statusColor, backgroundColor: `${statusColor}14` }}
        >
          {status === "Completed" ? (
            <CheckCircle2 size={23} />
          ) : status === "In progress" ? (
            <TrendingUp size={23} />
          ) : (
            <BookOpen size={23} />
          )}
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{ color: statusColor, backgroundColor: `${statusColor}14` }}
        >
          {status}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: COLORS.blue }}
        >
          {course.subject || "Course"}
        </p>
        <h3 className="mt-2 text-lg font-bold leading-snug text-[#0b1b33]">
          {course.title}
        </h3>

        <div className="mt-5 flex items-center justify-between gap-3 text-sm">
          <span className="text-slate-500">Course progress</span>
          <span className="font-bold text-[#0b1b33]">{course.percentage}%</span>
        </div>
        <div className="mt-2">
          <ProgressBar
            value={course.percentage}
            color={status === "Completed" ? COLORS.teal : COLORS.blue}
          />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <span>
            {course.completedLessons} of {course.totalLessons} lessons completed
          </span>
          <span className="flex items-center gap-1.5">
            <Clock3 size={14} />
            {formatDate(course.lastActivity)}
          </span>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onContinue(course)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90"
          style={{ backgroundColor: COLORS.navy, color: "#fff" }}
        >
          <span>{status === "Completed" ? "Review course" : "Continue learning"}</span>
          <ArrowUpRight size={17} />
        </button>
      </div>
    </article>
  );
}


export default function StudentProgressPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadProgress = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);
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

        // Load courses the student is enrolled in, including their lessons.
        const { data: enrollments, error: enrollmentError } = await supabase
          .from("enrollments")
          .select(`
            course_id,
            courses (
              id,
              title,
              subject,
              thumbnail_url,
              lessons (
                id,
                title,
                order_index
              )
            )
          `)
          .eq("student_id", user.id);

        if (enrollmentError) throw enrollmentError;

        const enrolledCourses = (enrollments || [])
          .map((enrollment) => normalizeRelation(enrollment.courses))
          .filter(Boolean);

        const courseIds = [...new Set(enrolledCourses.map((course) => course.id))];

        if (courseIds.length === 0) {
          setCourses([]);
          return;
        }

        const { data: progressRows, error: progressError } = await supabase
          .from("progress")
          .select("id, student_id, lesson_id, completed, completed_at, updated_at")
          .eq("student_id", user.id);

        if (progressError) throw progressError;

        const progressByLesson = new Map(
          (progressRows || []).map((row) => [row.lesson_id, row])
        );

        const normalizedCourses = enrolledCourses.map((course) => {
          const lessons = [...(course.lessons || [])].sort(
            (a, b) => (a.order_index ?? 0) - (b.order_index ?? 0)
          );
          const completedLessons = lessons.filter(
            (lesson) => progressByLesson.get(lesson.id)?.completed === true
          ).length;
          const totalLessons = lessons.length;
          const percentage =
            totalLessons > 0
              ? Math.round((completedLessons / totalLessons) * 100)
              : 0;

          const activityDates = lessons
            .map((lesson) => {
              const row = progressByLesson.get(lesson.id);
              return row?.completed_at || row?.updated_at || null;
            })
            .filter(Boolean)
            .map((date) => new Date(date).getTime())
            .filter((date) => Number.isFinite(date));

          const lastActivity =
            activityDates.length > 0
              ? new Date(Math.max(...activityDates)).toISOString()
              : null;

          return {
            ...course,
            lessons,
            totalLessons,
            completedLessons,
            percentage,
            lastActivity,
          };
        });

        setCourses(normalizedCourses);
      } catch (err) {
        console.error("Failed to load student progress:", err);
        setError(err?.message || "We couldn't load your learning progress.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  const filteredCourses = useMemo(() => {
    const query = search.trim().toLowerCase();

    return courses
      .filter((course) => {
        const status = getCourseStatus(course);
        if (statusFilter !== "All" && status !== statusFilter) return false;

        if (query) {
          const searchable = [course.title, course.subject]
            .filter(Boolean)
            .join(" ")
            .toLowerCase();
          if (!searchable.includes(query)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (b.percentage !== a.percentage) return b.percentage - a.percentage;
        return a.title.localeCompare(b.title);
      });
  }, [courses, search, statusFilter]);

  const totalLessons = courses.reduce((sum, course) => sum + course.totalLessons, 0);
  const completedLessons = courses.reduce(
    (sum, course) => sum + course.completedLessons,
    0
  );
  const overallPercentage =
    totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
  const completedCourses = courses.filter(
    (course) => getCourseStatus(course) === "Completed"
  ).length;
  const activeCourses = courses.filter(
    (course) => getCourseStatus(course) === "In progress"
  ).length;

  function continueCourse(course) {
    router.push(`/student/courses/${course.id}`);
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-7 lg:p-9">
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <GraduationCap size={17} />
              Student learning
              <span className="text-slate-300">/</span>
              <span style={{ color: COLORS.blue }}>Progress</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1b33] sm:text-4xl">
              My Progress
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Track completed lessons and see how far you have come in each course.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadProgress({ refresh: true })}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </section>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={TrendingUp}
            label="Overall progress"
            value={`${overallPercentage}%`}
            color={COLORS.blue}
          />
          <SummaryCard
            icon={CheckCircle2}
            label="Lessons completed"
            value={`${completedLessons}/${totalLessons}`}
            color={COLORS.teal}
          />
          <SummaryCard
            icon={BookOpen}
            label="Courses in progress"
            value={activeCourses}
            color={COLORS.orange}
          />
          <SummaryCard
            icon={GraduationCap}
            label="Courses completed"
            value={completedCourses}
            color={COLORS.purple}
          />
        </section>

        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search courses or subjects..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {STATUS_FILTERS.map((filter) => {
                const active = statusFilter === filter;
                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setStatusFilter(filter)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                    style={{
                      backgroundColor: active ? COLORS.navy : "#f1f5f9",
                      color: active ? "#fff" : "#64748b",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
          </div>
        )}

        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0b1b33]">Your courses</h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading your progress..."
                  : `${filteredCourses.length} ${
                      filteredCourses.length === 1 ? "course" : "courses"
                    } found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <LoaderCircle size={34} className="animate-spin text-[#4776e6]" />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading your learning progress...
              </p>
            </div>
          ) : filteredCourses.length === 0 && !error ? (
            <EmptyState
              hasFilters={Boolean(search || statusFilter !== "All")}
              onReset={() => {
                setSearch("");
                setStatusFilter("All");
              }}
            />
          ) : (
            !error && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredCourses.map((course) => (
                  <CourseProgressCard
                    key={course.id}
                    course={course}
                    onContinue={continueCourse}
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
