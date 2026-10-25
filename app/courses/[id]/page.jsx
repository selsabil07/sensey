"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronRight,
  Gauge,
  Globe,
  LoaderCircle,
  LockKeyhole,
  RefreshCw,
  Share2,
  Tag,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// Deterministic cover for courses without a thumbnail.
function coverStyle(seed = "") {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return {
    backgroundImage: `radial-gradient(circle at 20% 15%, hsl(${(h + 50) % 360} 85% 62% / .55), transparent 55%), linear-gradient(140deg, hsl(${h} 55% 24%), hsl(${(h + 35) % 360} 60% 40%))`,
  };
}

function formatDate(value) {
  if (!value) return null;
  return new Date(value).toLocaleDateString("en", { month: "long", year: "numeric" });
}

function Cover({ course, className = "" }) {
  return course.thumbnail_url ? (
    <img src={course.thumbnail_url} alt={course.title} className={`object-cover ${className}`} />
  ) : (
    <div className={`flex items-center justify-center ${className}`} style={coverStyle(course.title)}>
      <BookOpen size={56} strokeWidth={1.2} className="text-white/80" />
    </div>
  );
}

function Skeleton() {
  return (
    <main className="min-h-screen bg-slate-50" aria-busy="true">
      <div className="h-80 animate-pulse bg-[#0b1b33]" />
      <div className="mx-auto -mt-24 grid max-w-6xl gap-8 px-5 lg:grid-cols-[1fr_380px]">
        <div className="h-64 animate-pulse rounded-3xl bg-white" />
        <div className="h-96 animate-pulse rounded-3xl bg-white shadow-xl" />
      </div>
    </main>
  );
}

export default function CourseDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [related, setRelated] = useState([]);
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);

  // Stable client: creating it on every render re-triggered the load effect in a loop.
  const supabase = useMemo(() => createClient(), []);

  const loadCourse = useCallback(async () => {
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, teacher_id, title, description, subject, level, thumbnail_url, published, created_at")
        .eq("id", courseId)
        .eq("published", true)
        .maybeSingle();

      if (courseError) {
        console.error("Failed to load course:", courseError);
        setError("We couldn't load this course. Please try again.");
        return;
      }
      if (!courseData) {
        setError("This course doesn't exist or is no longer available.");
        return;
      }
      setCourse(courseData);

      // More courses in the same subject (optional, failures are ignored).
      if (courseData.subject) {
        const { data: more } = await supabase
          .from("courses")
          .select("id, title, level, thumbnail_url")
          .eq("published", true)
          .eq("subject", courseData.subject)
          .neq("id", courseData.id)
          .limit(3);
        setRelated(more ?? []);
      }

      let currentUser = null;
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) console.warn("Could not read the auth session:", sessionError);
        currentUser = session?.user ?? null;
      } catch (authError) {
        console.warn("Authentication is unavailable:", authError);
      }
      setUser(currentUser);

      if (!currentUser) {
        setUserRole(null);
        setIsEnrolled(false);
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileError) {
        console.error("Failed to load user role:", profileError);
        return;
      }
      setUserRole(profile?.role ?? null);

      if (profile?.role === "student") {
        const { data: enrollment, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", currentUser.id)
          .eq("course_id", courseData.id)
          .maybeSingle();

        if (enrollmentError) {
          console.error("Failed to check enrollment:", enrollmentError);
          return;
        }
        setIsEnrolled(Boolean(enrollment));
      }
    } catch (err) {
      console.error("Unexpected course loading error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [courseId, supabase]);

  useEffect(() => {
    if (courseId) loadCourse();
  }, [courseId, loadCourse]);

  async function handleEnroll() {
    setMessage("");
    setError("");

    if (!user) {
      router.push(`/sign-in?redirectTo=${encodeURIComponent(`/courses/${courseId}`)}`);
      return;
    }
    if (userRole !== "student") {
      setError("Only student accounts can enroll in courses.");
      return;
    }
    if (isEnrolled) return;

    setEnrolling(true);
    try {
      const { error: enrollError } = await supabase
        .from("enrollments")
        .insert({ student_id: user.id, course_id: course.id });

      if (enrollError) {
        if (enrollError.code === "23505") {
          setIsEnrolled(true);
          setMessage("You're already enrolled in this course.");
          return;
        }
        console.error("Enrollment failed:", enrollError);
        setError("We couldn't enroll you. Check your connection and try again.");
        return;
      }
      setIsEnrolled(true);
      setMessage("You're enrolled. Happy learning!");
    } catch (err) {
      console.error("Unexpected enrollment error:", err);
      setError("Something went wrong while enrolling.");
    } finally {
      setEnrolling(false);
    }
  }

  async function handleShare() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setError("Couldn't copy the link. Copy it from the address bar instead.");
    }
  }

  if (loading) return <Skeleton />;

  if (error && !course) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
            <BookOpen className="h-8 w-8 text-slate-400" />
          </div>
          <h1 className="text-xl font-bold text-[#0b1b33]">Course unavailable</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">{error}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={loadCourse}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0b1b33] px-4 py-3 text-sm font-semibold text-white hover:bg-[#172d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe5933]"
            >
              <RefreshCw size={16} /> Try again
            </button>
            <Link
              href="/courses"
              className="rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              Browse courses
            </Link>
          </div>
        </div>
      </main>
    );
  }

  if (!course) return null;

  const added = formatDate(course.created_at);
  const blocked = userRole === "admin" || userRole === "teacher";

  const facts = [
    { icon: Tag, label: "Subject", value: course.subject || "Not specified" },
    { icon: Gauge, label: "Level", value: course.level || "All levels" },
    { icon: Globe, label: "Format", value: "Online" },
    added && { icon: CalendarDays, label: "Added", value: added },
  ].filter(Boolean);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800">
      {/* Top bar */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
          <Link href="/" className="text-xl font-extrabold tracking-tight text-white">
            Sensey<span className="text-[#fe5933]">.</span>
          </Link>
          <button
            onClick={handleShare}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          >
            {copied ? <Check size={16} /> : <Share2 size={16} />}
            {copied ? "Link copied" : "Share"}
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-[#0b1b33] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 -top-32 h-[28rem] w-[28rem] rounded-full bg-[#fe5933]/25 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "44px 44px",
          }}
        />
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-28 lg:pb-44 lg:pr-[420px]">
          <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-1.5 text-sm text-slate-400">
            <Link href="/courses" className="inline-flex items-center gap-1.5 hover:text-white">
              <ArrowLeft size={15} /> Courses
            </Link>
            {course.subject && (
              <>
                <ChevronRight size={14} />
                <span>{course.subject}</span>
              </>
            )}
          </nav>

          <div className="mb-5 flex flex-wrap gap-2">
            {course.level && (
              <span className="rounded-full bg-[#fe5933] px-3 py-1 text-xs font-semibold text-white">
                {course.level}
              </span>
            )}
            {course.subject && (
              <span className="rounded-full border border-white/20 px-3 py-1 text-xs font-semibold text-slate-200">
                {course.subject}
              </span>
            )}
          </div>

          <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl">
            {course.title}
          </h1>
          <p className="mt-5 max-w-2xl line-clamp-3 text-lg leading-8 text-slate-300">
            {course.description || "Explore this course and start learning with Sensey."}
          </p>
        </div>
      </section>

      {/* Body */}
      <div className="mx-auto grid max-w-6xl gap-8 px-5 pb-20 lg:grid-cols-[1fr_380px]">
        {/* Enrollment card (overlaps hero on desktop) */}
        <aside className="order-first -mt-10 h-fit lg:order-last lg:-mt-36 lg:sticky lg:top-6">
          <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/10">
            <Cover course={course} className="aspect-video w-full" />

            <div className="p-6">
              {isEnrolled ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm font-semibold text-emerald-700">
                    <CheckCircle2 size={20} /> You're enrolled in this course
                  </div>
                  <Link
                    href="/student/courses"
                    className="flex w-full items-center justify-center rounded-xl bg-[#fe5933] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#e94b28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe5933]"
                  >
                    Go to my courses
                  </Link>
                </div>
              ) : (
                <>
                  <button
                    onClick={handleEnroll}
                    disabled={enrolling || blocked}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#fe5933]/30 transition hover:bg-[#e94b28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe5933] disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none"
                  >
                    {enrolling ? (
                      <>
                        <LoaderCircle size={18} className="animate-spin" /> Enrolling...
                      </>
                    ) : !user ? (
                      <>
                        <LockKeyhole size={17} /> Sign in to enroll
                      </>
                    ) : userRole === "student" ? (
                      "Enroll in this course"
                    ) : (
                      "Student account required"
                    )}
                  </button>
                  <p className="mt-3 text-center text-xs text-slate-500">
                    Browsing is open to everyone. Enrolling needs a student account.
                  </p>
                </>
              )}

              {message && (
                <p role="status" className="mt-4 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700">
                  {message}
                </p>
              )}
              {error && (
                <p role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                  {error}
                </p>
              )}

              <dl className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
                {facts.map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center justify-between gap-4 py-3.5">
                    <dt className="flex items-center gap-2.5 text-sm text-slate-500">
                      <Icon size={16} className="text-[#fe5933]" /> {label}
                    </dt>
                    <dd className="text-right text-sm font-semibold text-slate-800">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </aside>

        {/* Main column */}
        <div className="space-y-12 pt-4 lg:pt-12">
          <section>
            <h2 className="text-2xl font-bold tracking-tight text-[#0b1b33]">About this course</h2>
            <p className="mt-4 max-w-2xl whitespace-pre-line text-base leading-8 text-slate-600">
              {course.description || "The teacher hasn't added a course description yet."}
            </p>
          </section>

          {related.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold tracking-tight text-[#0b1b33]">
                More in {course.subject}
              </h2>
              <ul className="mt-5 grid gap-4 sm:grid-cols-3">
                {related.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/courses/${c.id}`}
                      className="group block overflow-hidden rounded-2xl border border-slate-200 bg-white transition hover:border-[#fe5933]/40 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#fe5933]"
                    >
                      <Cover course={c} className="aspect-video w-full transition duration-300 group-hover:scale-[1.03]" />
                      <div className="p-4">
                        <p className="line-clamp-2 text-sm font-bold text-[#0b1b33]">{c.title}</p>
                        {c.level && <p className="mt-1 text-xs text-slate-500">{c.level}</p>}
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
