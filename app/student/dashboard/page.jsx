"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import StatCard from "@/components/student/StatCard";
import EnrolledCourses from "@/components/student/EnrolledCourses";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {BookOpen, ClipboardList, CheckCircle2, AlertCircle, ArrowRight, Bot,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Welcome from "@/components/student/Welcome";
import QuickActions from "@/components/student/QuickActions";

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
      <Welcome 
      loading= {loading}
      courses= {courses}
      latestCourse={latestCourse}
      firstName={firstName}
       />

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
            value={ completedLessons }
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
      <EnrolledCourses 
        search={search} 
        setSearch={setSearch} 
        filteredCourses={filteredCourses} 
        loading={loading} 
        error= {error}
        />


      {/* Quick actions */}
      <QuickActions />
    </div>
  );
}