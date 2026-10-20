
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QuickAction from "@/components/teacher/QuickAction";
import RecentCourses from "@/components/teacher/RecentCourses";

import {
  BookOpen,
  Users,
  ClipboardCheck,
  ChartNoAxesCombined,
  Plus,
  ArrowUpRight,
  GraduationCap,
  Clock,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function TeacherDashboard() {
  const router = useRouter();

  const [teacher, setTeacher] = useState(null);
  const [courses, setCourses] = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadDashboard() {
      try {
        setError("");

        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError || !user) {
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, role")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (profile.role !== "teacher") {
          router.replace(
            profile.role === "admin" ? "/admin/dashboard" : "/student"
          );
          return;
        }

        setTeacher({
          ...profile,
          email: user.email,
        });

        const { data: courseData, error: courseError } = await supabase
          .from("courses")
          .select("id, title, created_at")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

        if (courseError) throw courseError;

        const teacherCourses = courseData || [];
        setCourses(teacherCourses);

        if (teacherCourses.length > 0) {
          const courseIds = teacherCourses.map((course) => course.id);

          const { data: enrollments, error: enrollmentError } =
            await supabase
              .from("enrollments")
              .select("id")
              .in("course_id", courseIds);

          if (enrollmentError) throw enrollmentError;

          setStudentCount(enrollments?.length || 0);
        }
      } catch (err) {
        console.error("Teacher dashboard error:", err);
        setError(err.message || "Could not load the dashboard.");
      } finally {
        setLoading(false);
      }
    }

    loadDashboard();
  }, [router]);

  const stats = [
    {
      title: "My Courses",
      value: courses.length,
      icon: BookOpen,
      color: "#4776e6",
      bg: "#edf2ff",
      href: "/teacher/courses",
    },
    {
      title: "Enrolments",
      value: studentCount,
      icon: Users,
      color: "#20a895",
      bg: "#e6faf5",
      href: "/teacher/students",
    },
    {
      title: "Quizzes",
      value: "—",
      icon: ClipboardCheck,
      color: "#fe5933",
      bg: "#fff0e9",
      href: "/teacher/quizzes",
    },
    {
      title: "Student Progress",
      value: "—",
      icon: ChartNoAxesCombined,
      color: "#9274e8",
      bg: "#f1edff",
      href: "/teacher/grades",
    },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f7f8fc]">
        <LoaderCircle className="animate-spin text-[#fe5933]" size={32} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-[#17243b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Welcome header */}
        <header className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-medium text-[#fe5933]">
              TEACHER WORKSPACE
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back, {teacher?.full_name || "Teacher"}!
            </h1>

            <p className="mt-2 text-sm text-slate-500 sm:text-base">
              Here's what's happening with your courses.
            </p>
          </div>

          <Link
            href="/teacher/courses/create"
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94b27]"
          >
            <Plus size={18} />
            Create a course
          </Link>
        </header>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Statistics */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <Link
                href={stat.href}
                key={stat.title}
                className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-xl"
                    style={{ backgroundColor: stat.bg, color: stat.color }}
                  >
                    <Icon size={23} />
                  </div>

                  <ArrowUpRight
                    size={18}
                    className="text-slate-300 transition group-hover:text-[#fe5933]"
                  />
                </div>

                <p className="mt-5 text-sm font-medium text-slate-500">
                  {stat.title}
                </p>

                <p className="mt-1 text-3xl font-bold text-[#0b1b33]">
                  {stat.value}
                </p>
              </Link>
            );
          })}
        </section>

        {/* Main content */}
        <section className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
          {/* Recent courses */}
          <RecentCourses courses={courses} />

          {/* Quick actions */}
          <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="text-lg font-bold">Quick Actions</h2>

            <p className="mt-1 text-sm text-slate-500">
              Get straight to your next task.
            </p>

            <div className="mt-6 space-y-3">
              <QuickAction
                icon={Plus}
                title="Create a course"
                description="Start a new learning course"
                href="/teacher/courses/create"
              />

              <QuickAction
                icon={BookOpen}
                title="Manage my courses"
                description="Edit your existing courses"
                href="/teacher/courses"
              />

              <QuickAction
                icon={ClipboardCheck}
                title="Create a quiz"
                description="Prepare a student assessment"
                href="/teacher/quizzes/create"
              />

              <QuickAction
                icon={Users}
                title="View my students"
                description="See enrolled learners"
                href="/teacher/students"
              />
            </div>
          </div>
        </section>

        <footer className="pb-4 text-center text-xs text-slate-400">
          Sensey · Teacher Workspace
        </footer>
      </div>
    </main>
  );
}


