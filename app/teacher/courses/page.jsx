"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
BookOpen,
Plus,
Search,
BookOpenCheck,
GraduationCap,
LoaderCircle,
RefreshCw,
AlertCircle,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import CourseCard from "@/components/teacher/CourseCard";

export default function TeacherCoursesPage() {
const [courses, setCourses] = useState([]);
const [search, setSearch] = useState("");
const [filter, setFilter] = useState("all");
const [loading, setLoading] = useState(true);
const [error, setError] = useState("");

const loadCourses = useCallback(async () => {
setLoading(true);
setError("");

try {
  const supabase = createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) throw authError;

  if (!user) {
    window.location.assign("/sign-in");
    return;
  }

  // Fetch only the courses belonging to the signed-in teacher.
  const { data, error: coursesError } = await supabase
    .from("courses")
    .select(
      "id, teacher_id, title, description, subject, level, thumbnail_url, published, created_at, updated_at"
    )
    .eq("teacher_id", user.id)
    .order("created_at", { ascending: false });

  if (coursesError) throw coursesError;

  setCourses(data || []);
} catch (err) {
  console.error("Could not load teacher courses:", err);
  setError(err.message || "Something went wrong while loading courses.");
} finally {
  setLoading(false);
}

}, []);

useEffect(() => {
loadCourses();
}, [loadCourses]);

// Your database stores publication state in the boolean published.
const getStatus = (course) => {
return course.published === true ? "published" : "draft";
};

const filteredCourses = useMemo(() => {
return courses.filter((course) => {
const query = search.trim().toLowerCase();

  const matchesSearch = [
    course.title,
    course.description,
    course.subject,
    course.level,
  ].some((value) => String(value || "").toLowerCase().includes(query));

  const matchesFilter =
    filter === "all" || getStatus(course) === filter;

  return matchesSearch && matchesFilter;
});

}, [courses, search, filter]);

const publishedCount = courses.filter(
(course) => course.published === true
).length;

const draftCount = courses.filter(
(course) => course.published === false
).length;

return (
<main className="min-h-full w-full bg-[#f5f7fb] px-4 py-6 text-[#17243b] sm:px-6 lg:px-8 lg:py-8">
<div className="mx-auto w-full max-w-[1500px] space-y-7">

    {/* Heading */}
    <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
      <div>
        <div className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[#fe5933]">
          <span className="h-2 w-2 rounded-full bg-[#fe5933]" />
          Teaching workspace
        </div>

        <h1 className="text-2xl font-bold tracking-tight text-[#0b1b33] sm:text-3xl">
          My Courses
        </h1>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Manage your courses, organize lessons, and share knowledge with your students.
        </p>
      </div>

      <Link
        href="/teacher/courses/create"
        className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94b27] hover:shadow-md sm:self-center"
      >
        <Plus size={18} />
        Create Course
      </Link>
    </header>

    {/* Statistics */}
    <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <SummaryCard
        label="Total Courses"
        value={courses.length}
        icon={BookOpen}
        color="#4776e6"
        background="#edf2ff"
      />

      <SummaryCard
        label="Published"
        value={publishedCount}
        icon={BookOpenCheck}
        color="#159b83"
        background="#e6faf5"
      />

      <SummaryCard
        label="Drafts"
        value={draftCount}
        icon={GraduationCap}
        color="#fe5933"
        background="#fff0e9"
      />
    </section>

    {/* Search and filters */}
    <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#0b1b33]">
            Course library
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Find courses by title, subject, description, or level.
          </p>
        </div>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row xl:w-auto">
          <div className="relative min-w-0 flex-1 sm:min-w-[240px] xl:w-72">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#fe5933] focus:bg-white focus:ring-4 focus:ring-orange-100/70"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[
              { label: "All", value: "all" },
              { label: "Published", value: "published" },
              { label: "Drafts", value: "draft" },
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFilter(option.value)}
                aria-pressed={filter === option.value}
                className={`rounded-xl px-3.5 py-2.5 text-xs font-semibold transition sm:text-sm ${
                  filter === option.value
                    ? "bg-[#0b1b33] text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {option.label}
              </button>
            ))}

            <button
              type="button"
              onClick={loadCourses}
              disabled={loading}
              aria-label="Refresh courses"
              title="Refresh courses"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-orange-50 hover:text-[#fe5933] disabled:opacity-50"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
            </button>
          </div>
        </div>
      </div>
    </section>

    {/* Error state */}
    {error && (
      <div
        role="alert"
        className="flex flex-col gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="flex items-start gap-3">
          <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-600" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              Could not load courses
            </p>
            <p className="mt-1 break-words text-sm text-red-700">
              {error}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={loadCourses}
          className="self-start rounded-lg bg-white px-4 py-2 text-sm font-semibold text-red-700 ring-1 ring-red-200 hover:bg-red-100 sm:self-center"
        >
          Try again
        </button>
      </div>
    )}

    {/* Course results */}
    {loading ? (
      <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-slate-200/80 bg-white">
        <div className="text-center">
          <LoaderCircle
            size={32}
            className="mx-auto animate-spin text-[#fe5933]"
          />
          <p className="mt-3 text-sm text-slate-500">
            Loading your courses...
          </p>
        </div>
      </div>
    ) : !error && filteredCourses.length === 0 ? (
      <div className="rounded-2xl border border-slate-200/80 bg-white px-5 py-16 text-center shadow-sm">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#edf2ff] text-[#4776e6]">
          <BookOpen size={30} />
        </div>

        <h2 className="mt-5 text-lg font-bold text-[#0b1b33]">
          {courses.length === 0
            ? "Your classroom starts here"
            : "No courses found"}
        </h2>

        <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
          {courses.length === 0
            ? "You haven't created any courses yet. Create your first course to get started."
            : "Try a different search term or status filter."}
        </p>

        {courses.length === 0 && (
          <Link
            href="/teacher/courses/create"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b27]"
          >
            <Plus size={18} />
            Create your first course
          </Link>
        )}
      </div>
    ) : !error ? (
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-bold text-[#0b1b33]">
            Your courses
          </h2>
          <span className="rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-200">
            {filteredCourses.length}{" "}
            {filteredCourses.length === 1 ? "course" : "courses"}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 2xl:grid-cols-3">
          {filteredCourses.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              status={getStatus(course)}
            />
          ))}
        </div>
      </section>
    ) : null}
  </div>
</main>

);
}

function SummaryCard({ label, value, icon: Icon, color, background }) {
return (
<article className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:shadow-md sm:p-6">
<div className="flex items-center justify-between gap-4">
<div>
<p className="text-sm font-medium text-slate-500">{label}</p>
<p className="mt-3 text-3xl font-bold tracking-tight text-[#0b1b33]">
{value}
</p>
</div>

    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: background, color }}
    >
      <Icon size={23} />
    </div>
  </div>
</article>

);
}