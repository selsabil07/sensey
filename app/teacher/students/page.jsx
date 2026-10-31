"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  RefreshCw,
  AlertCircle,
  UserRound,
  UserCog,
  UserLock,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import SummaryCard from "@/components/teacher/SummaryCard";
import StudentsTable from "@/components/teacher/StudentsTable";

export default function TeacherStudentsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        window.location.assign("/sign-in");
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, subject, level, created_at")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (courseError) throw courseError;

      const teacherCourses = courseData || [];
      setCourses(teacherCourses);

      if (teacherCourses.length === 0) {
        setStudents([]);
        return;
      }

      const courseIds = teacherCourses.map((course) => course.id);

      const { data: enrollmentData, error: enrollmentError } =
        await supabase
          .from("enrollments")
          .select("id, student_id, course_id, enrolled_at")
          .in("course_id", courseIds)
          .order("enrolled_at", { ascending: false });

      if (enrollmentError) throw enrollmentError;

      const enrollments = enrollmentData || [];

      if (enrollments.length === 0) {
        setStudents([]);
        return;
      }

      const studentIds = [
        ...new Set(enrollments.map((item) => item.student_id)),
      ];

      const { data: profileData, error: profileError } = await supabase
        .from("profiles")
        .select("id, full_name, email, number, avatar_url, is_active")
        .in("id", studentIds)
        .eq("role", "student");

      if (profileError) throw profileError;

      const profiles = profileData || [];

      const courseMap = new Map(
        teacherCourses.map((course) => [course.id, course])
      );

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      const studentMap = new Map();

      for (const enrollment of enrollments) {
        const profile = profileMap.get(enrollment.student_id);
        const course = courseMap.get(enrollment.course_id);

        if (!profile || !course) continue;

        if (!studentMap.has(profile.id)) {
          studentMap.set(profile.id, {
            ...profile,
            courses: [],
            enrollmentDates: [],
          });
        }

        const student = studentMap.get(profile.id);

        if (!student.courses.some((item) => item.id === course.id)) {
          student.courses.push(course);
        }

        if (enrollment.enrolled_at) {
          student.enrollmentDates.push(enrollment.enrolled_at);
        }
      }

      const result = [...studentMap.values()].map((student) => ({
        ...student,
        latestEnrollment:
          student.enrollmentDates.sort(
            (a, b) => new Date(b) - new Date(a)
          )[0] || null,
      }));

      result.sort((a, b) =>
        (a.full_name || "").localeCompare(b.full_name || "")
      );

      setStudents(result);
    } catch (err) {
      console.error("Could not load teacher students:", err);
      setError(err.message || "Could not load your students.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);


  const activeCount = students.filter(
    (student) => student.is_active === true
  ).length;

  const inactiveCount = students.filter(
    (student) => student.is_active === false
  ).length;

  return (
    <main className="min-h-screen min-w-0 bg-slate-50 px-3 py-5 text-slate-900 sm:px-5 sm:py-7 lg:px-8 lg:py-8">
      <div className="mx-auto w-full max-w-7xl space-y-5 sm:space-y-7">

        {/* Page heading */}
        <header className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-orange-600 sm:text-sm">
              Teacher workspace
            </p>

            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Students
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
              View and manage the students enrolled in your courses.
            </p>
          </div>

          <button
            type="button"
            onClick={loadStudents}
            disabled={loading}
            className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Error message */}
        {error && (
          <div
            role="alert"
            className="flex min-w-0 items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 sm:p-4"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {/* Summary cards */}
        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
            <SummaryCard
              label="Total Students"
              value={students.length}
              icon={Users}
              color={'green'}
              
            />

            <SummaryCard
              label="Active Students"
              value={activeCount}
              icon={UserRound}
              color={'orange'}
            />

            <SummaryCard
              label="Inactive Students"
              value={inactiveCount}
              icon={UserLock}
              color={'blue'}
            />
          </section>
              

        {/* Students panel */}
        <StudentsTable 
        students = {students}
        courses = {courses}
        loading = {loading}
        />
      </div>
    </main>
  );
}