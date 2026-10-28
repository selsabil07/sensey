"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BookOpen,
  Search,
  ArrowRight,
  LoaderCircle,
  GraduationCap,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  BookMarked,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CourseCard from "@/components/public/CoursCard";
import Navbar from "@/components/public/Navbar";
import Footer from "@/components/public/Footer";

export default function CoursesPage() {
  const router = useRouter();

  const [supabase] = useState(() => createClient());
  const [courses, setCourses] = useState([]);
  const [enrolledCourseIds, setEnrolledCourseIds] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);

  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("All");
  const [loading, setLoading] = useState(true);
  const [enrollingId, setEnrollingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

const loadCourses = useCallback(async () => {
  setLoading(true);
  setError("");

  // 1. Load published courses independently of authentication.
  const { data: courseData, error: coursesError } = await supabase
    .from("courses")
    .select(
      "id, teacher_id, title, description, subject, level, thumbnail_url, published, created_at"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (coursesError) {
    console.error("Failed to load published courses:", coursesError);
    setError("We couldn't load the courses. Please try again.");
    setLoading(false);
    return;
  }

  setCourses(courseData || []);

  // 2. Authentication is optional for this public page.
  // getSession() reads the current local session; no session is normal.
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    console.warn("Could not read auth session:", sessionError);
  }

  const currentUser = session?.user ?? null;
  setUser(currentUser);

  // Visitors can browse published courses without signing in.
  if (!currentUser) {
    setUserRole(null);
    setEnrolledCourseIds([]);
    setLoading(false);
    return;
  }

  // 3. Get the role of a signed-in user.
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", currentUser.id)
    .maybeSingle();

  if (profileError) {
    console.error("Failed to load profile:", profileError);
    setUserRole(null);
    setEnrolledCourseIds([]);
    setLoading(false);
    return;
  }

  setUserRole(profile?.role ?? null);

  // 4. Load enrollments only for students.
  if (profile?.role === "student") {
    const { data: enrollments, error: enrollmentError } = await supabase
      .from("enrollments")
      .select("course_id")
      .eq("student_id", currentUser.id);

    if (enrollmentError) {
      console.error("Failed to load enrollments:", enrollmentError);
      setEnrolledCourseIds([]);
    } else {
      setEnrolledCourseIds(
        (enrollments || []).map((item) => item.course_id)
      );
    }
  } else {
    setEnrolledCourseIds([]);
  }

  setLoading(false);
}, [supabase]);

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

    return ["All", ...uniqueSubjects.sort()];
  }, [courses]);

  const filteredCourses = useMemo(() => {
    const term = search.trim().toLowerCase();

    return courses.filter((course) => {
      const matchesSearch =
        !term ||
        course.title?.toLowerCase().includes(term) ||
        course.description?.toLowerCase().includes(term) ||
        course.subject?.toLowerCase().includes(term) ||
        course.level?.toLowerCase().includes(term);

      const matchesSubject =
        selectedSubject === "All" ||
        course.subject === selectedSubject;

      return matchesSearch && matchesSubject;
    });
  }, [courses, search, selectedSubject]);

  async function handleEnroll(courseId) {
    setError("");
    setSuccess("");

    // Visitors must sign in before enrolling.
    if (!user) {
      router.push("/sign-in?redirectTo=/courses");
      return;
    }

    if (userRole !== "student") {
      setError("Only student accounts can enroll in courses.");
      return;
    }

    if (enrolledCourseIds.includes(courseId)) {
      return;
    }

    setEnrollingId(courseId);

    try {
      // The database must also enforce enrollment permissions with RLS.
      const { error: insertError } = await supabase
        .from("enrollments")
        .insert({
          student_id: user.id,
          course_id: courseId,
        });

      if (insertError) {
        // Handle a duplicate if the database has a unique constraint.
        if (
          insertError.code === "23505"
        ) {
          setEnrolledCourseIds((previous) =>
            previous.includes(courseId)
              ? previous
              : [...previous, courseId]
          );
          setSuccess("You're already enrolled in this course.");
          return;
        }

        throw insertError;
      }

      setEnrolledCourseIds((previous) => [...previous, courseId]);
      setSuccess("You enrolled successfully!");
    } catch (err) {
      console.error("Enrollment failed:", err);
      setError(
        "Enrollment failed. Please try again. If the problem continues, check your enrollment table and RLS policies."
      );
    } finally {
      setEnrollingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] text-[#0b1b33]">
      <Navbar />
      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1b33] px-5 py-8 mt-12 text-white sm:px-8 lg:py-12 rounded-4xl">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#fe5933]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-36 left-1/4 h-80 w-80 rounded-full bg-[#4776e6]/20 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-white/85">
            <Sparkles className="h-4 w-4 text-[#fe805f]" />
            Learn something new with Sensey
          </div>

          <div className="grid items-center gap-10 md:grid-cols-[1.3fr_0.7fr]">
            <div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                Discover courses.
                <span className="block text-[#fe805f]">
                  Grow your skills.
                </span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Explore courses from our teachers, find a subject you love,
                and start learning at your own pace.
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href="#course-list"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-6 py-3 font-semibold text-white transition hover:bg-[#e94b27]"
                >
                  Explore courses
                  <ArrowRight className="h-4 w-4" />
                </a>

                {!user && (
                  <Link
                    href="/sign-in"
                    className="rounded-xl border border-white/20 px-6 py-3 font-semibold text-white transition hover:bg-white/10"
                  >
                    Sign in
                  </Link>
                )}
              </div>
            </div>

            <div className="hidden justify-center md:flex">
              <div className="relative flex h-64 w-64 items-center justify-center rounded-[2rem] border border-white/10 bg-white/[0.06] shadow-2xl backdrop-blur">
                <div className="absolute inset-4 rounded-[1.5rem] border border-white/10" />
                <GraduationCap className="h-28 w-28 text-[#fe805f]" />
                <div className="absolute -bottom-3 -right-4 rounded-2xl bg-white p-4 text-[#0b1b33] shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className="rounded-xl bg-blue-50 p-2">
                      <BookOpen className="h-6 w-6 text-[#4776e6]" />
                    </div>
                    <div>
                      <p className="text-xl font-bold">{courses.length}</p>
                      <p className="text-xs text-slate-500">
                        Published courses
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section
        id="course-list"
        className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-20"
      >
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#fe5933]">
              Course catalog
            </p>
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Explore our courses
            </h2>
            <p className="mt-3 text-slate-500">
              Find the right course for your learning journey.
            </p>
          </div>

          <button
            onClick={loadCourses}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-50 disabled:opacity-50 sm:self-auto"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Search and filters */}
        <div className="mb-8 grid gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[1fr_240px]">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by title, subject, or level..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-12 pr-4 outline-none transition focus:border-[#4776e6] focus:ring-2 focus:ring-[#4776e6]/10"
            />
          </div>

          <select
            value={selectedSubject}
            onChange={(event) => setSelectedSubject(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition focus:border-[#4776e6]"
          >
            {subjects.map((subject) => (
              <option key={subject} value={subject}>
                {subject === "All" ? "All subjects" : subject}
              </option>
            ))}
          </select>
        </div>

        {/* Status messages */}
        {error && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="mb-6 flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{success}</p>
          </div>
        )}

        {loading ? (
          <div className="flex min-h-64 items-center justify-center">
            <div className="text-center">
              <LoaderCircle className="mx-auto h-9 w-9 animate-spin text-[#4776e6]" />
              <p className="mt-4 text-sm text-slate-500">
                Loading published courses...
              </p>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50">
              <BookOpen className="h-8 w-8 text-[#4776e6]" />
            </div>

            <h3 className="mt-5 text-xl font-bold">
              {courses.length === 0
                ? "No published courses yet"
                : "No courses found"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              {courses.length === 0
                ? "Published courses will appear here when your teachers make them available."
                : "Try another search term or choose a different subject."}
            </p>

            {(search || selectedSubject !== "All") && (
              <button
                onClick={() => {
                  setSearch("");
                  setSelectedSubject("All");
                }}
                className="mt-5 font-semibold text-[#4776e6] hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <>
            <p className="mb-5 text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-[#0b1b33]">
                {filteredCourses.length}
              </span>{" "}
              {filteredCourses.length === 1 ? "course" : "courses"}
            </p>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredCourses.map((course) => {
                const isEnrolled = enrolledCourseIds.includes(course.id);
                const isEnrolling = enrollingId === course.id;

                return (
                    <CourseCard 
                    key={course.id}
                    course={course}
                    isEnrolled={enrolledCourseIds.includes(course.id)}
                    />                    
                );
              })}
            </div>
          </>
        
        )}
          
      </section>
      <Footer />
    </main>
  );
}