
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Award,
  BookOpen,
  ChartNoAxesCombined,
  CheckCircle2,
  Clock3,
  GraduationCap,
  LoaderCircle,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  AlertCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};

function percent(value) {
  return `${Math.round(value)}%`;
}

function formatDate(value) {
  if (!value) return "Not completed";

  return new Date(value).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getInitials(name) {
  return (name || "Student")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function ProgressBar({ value, color = COLORS.blue }) {
  const safeValue = Math.max(0, Math.min(100, value));

  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full transition-all"
        style={{
          width: `${safeValue}%`,
          backgroundColor: color,
        }}
      />
    </div>
  );
}

function StatCard({ title, value, description, icon: Icon, color }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-900">
            {value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{description}</p>
        </div>

        <div
          className="rounded-xl p-3"
          style={{
            backgroundColor: `${color}15`,
            color,
          }}
        >
          <Icon size={22} />
        </div>
      </div>
    </div>
  );
}

export default function TeacherGradesPage() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [courseFilter, setCourseFilter] = useState("all");
  const [tab, setTab] = useState("progress");

  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [progressRows, setProgressRows] = useState([]);
  const [gradeRows, setGradeRows] = useState([]);

  const loadData = useCallback(async (isRefresh = false) => {
    const supabase = createClient();

    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      // 1. Authenticate the teacher.
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;
      if (!user) throw new Error("Please sign in to view grades.");

      // 2. Load this teacher's courses.
      const { data: courseData, error: courseError } =
        await supabase
          .from("courses")
          .select("id, title, subject, level, published")
          .eq("teacher_id", user.id)
          .order("created_at", { ascending: false });

      if (courseError) throw courseError;

      const ownedCourses = courseData || [];
      const courseIds = ownedCourses.map((course) => course.id);

      setCourses(ownedCourses);

      if (courseIds.length === 0) {
        setStudents([]);
        setProgressRows([]);
        setGradeRows([]);
        return;
      }

      // 3. Load enrollments and lessons for these courses.
      const [
        { data: enrollmentData, error: enrollmentError },
        { data: lessonData, error: lessonError },
      ] = await Promise.all([
        supabase
          .from("enrollments")
          .select("id, student_id, course_id, enrolled_at")
          .in("course_id", courseIds),

        supabase
          .from("lessons")
          .select("id, course_id, title")
          .in("course_id", courseIds),
      ]);

      if (enrollmentError) throw enrollmentError;
      if (lessonError) throw lessonError;

      const enrollments = enrollmentData || [];
      const lessons = lessonData || [];
      const lessonIds = lessons.map((lesson) => lesson.id);

      const studentIds = [
        ...new Set(enrollments.map((row) => row.student_id)),
      ];

      // 4. Load student profiles.
      let profiles = [];

      if (studentIds.length > 0) {
        const { data, error: profileError } = await supabase
          .from("profiles")
          .select("id, full_name, email, avatar_url")
          .in("id", studentIds);

        if (profileError) throw profileError;

        profiles = data || [];
      }

      const profileMap = new Map(
        profiles.map((profile) => [profile.id, profile])
      );

      // 5. Load lesson completion records.
      let completionData = [];

      if (lessonIds.length > 0 && studentIds.length > 0) {
        const { data, error: completionError } = await supabase
          .from("progress")
          .select("id, student_id, lesson_id, completed, completed_at")
          .in("lesson_id", lessonIds)
          .in("student_id", studentIds);

        if (completionError) throw completionError;

        completionData = data || [];
      }

      const completionMap = new Map();

      for (const record of completionData) {
        const key = `${record.student_id}:${record.lesson_id}`;
        const previous = completionMap.get(key);

        // If duplicate records exist, count a lesson as completed
        // when at least one record says it is completed.
        completionMap.set(
          key,
          Boolean(previous?.completed || record.completed)
            ? {
                ...record,
                completed: true,
                completed_at:
                  previous?.completed_at || record.completed_at,
              }
            : record
        );
      }

      // 6. Build progress for every student/course enrollment.
      const calculatedProgress = enrollments.map((enrollment) => {
        const course = ownedCourses.find(
          (item) => item.id === enrollment.course_id
        );

        const courseLessons = lessons.filter(
          (lesson) => lesson.course_id === enrollment.course_id
        );

        const completedLessons = courseLessons.filter((lesson) => {
          const record = completionMap.get(
            `${enrollment.student_id}:${lesson.id}`
          );

          return record?.completed === true;
        }).length;

        const totalLessons = courseLessons.length;

        return {
          id: enrollment.id,
          studentId: enrollment.student_id,
          courseId: enrollment.course_id,
          studentName:
            profileMap.get(enrollment.student_id)?.full_name ||
            "Unnamed student",
          email: profileMap.get(enrollment.student_id)?.email || "",
          avatarUrl:
            profileMap.get(enrollment.student_id)?.avatar_url || null,
          courseTitle: course?.title || "Unknown course",
          enrolledAt: enrollment.enrolled_at,
          completedLessons,
          totalLessons,
          progress:
            totalLessons > 0
              ? (completedLessons / totalLessons) * 100
              : 0,
        };
      });

      // 7. Load existing quizzes attached to the teacher's lessons.
      let quizzes = [];

      if (lessonIds.length > 0) {
        const { data, error: quizError } = await supabase
          .from("quizzes")
          .select("id, lesson_id, title")
          .in("lesson_id", lessonIds);

        if (quizError) throw quizError;

        quizzes = data || [];
      }

      const quizIds = quizzes.map((quiz) => quiz.id);
      const lessonMap = new Map(
        lessons.map((lesson) => [lesson.id, lesson])
      );
      const quizMap = new Map(
        quizzes.map((quiz) => [quiz.id, quiz])
      );

      // 8. Load actual quiz attempts and scores.
      let attempts = [];

      if (quizIds.length > 0) {
        const { data, error: attemptError } = await supabase
          .from("quiz_attempts")
          .select(
            "id, quiz_id, student_id, score, started_at, completed_at"
          )
          .in("quiz_id", quizIds)
          .order("started_at", { ascending: false });

        if (attemptError) throw attemptError;

        attempts = data || [];
      }

      const calculatedGrades = attempts
        .map((attempt) => {
          const quiz = quizMap.get(attempt.quiz_id);
          const lesson = quiz
            ? lessonMap.get(quiz.lesson_id)
            : null;
          const course = lesson
            ? ownedCourses.find(
                (item) => item.id === lesson.course_id
              )
            : null;
          const profile = profileMap.get(attempt.student_id);

          return {
            id: attempt.id,
            studentId: attempt.student_id,
            studentName: profile?.full_name || "Unnamed student",
            email: profile?.email || "",
            quizTitle: quiz?.title || "Untitled quiz",
            courseId: course?.id || "",
            courseTitle: course?.title || "Unknown course",
            score:
              attempt.score === null || attempt.score === undefined
                ? null
                : Number(attempt.score),
            startedAt: attempt.started_at,
            completedAt: attempt.completed_at,
          };
        })
        .filter((grade) => grade.courseId);

      setStudents(
        studentIds.map((id) => ({
          id,
          full_name:
            profileMap.get(id)?.full_name || "Unnamed student",
          email: profileMap.get(id)?.email || "",
        }))
      );

      setProgressRows(calculatedProgress);
      setGradeRows(calculatedGrades);
    } catch (err) {
      console.error("Failed to load grades and progress:", err);
      setError(
        err?.message ||
          "Could not load grades and progress. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredProgress = useMemo(() => {
    const query = search.trim().toLowerCase();

    return progressRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.studentName.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.courseTitle.toLowerCase().includes(query);
        

      const matchesCourse =
        courseFilter === "all" || row.courseId === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [progressRows, search, courseFilter]);

  const filteredGrades = useMemo(() => {
    const query = search.trim().toLowerCase();

    return gradeRows.filter((row) => {
      const matchesSearch =
        !query ||
        row.studentName.toLowerCase().includes(query) ||
        row.email.toLowerCase().includes(query) ||
        row.quizTitle.toLowerCase().includes(query) ||
        row.courseTitle.toLowerCase().includes(query);

      const matchesCourse =
        courseFilter === "all" || row.courseId === courseFilter;

      return matchesSearch && matchesCourse;
    });
  }, [gradeRows, search, courseFilter]);

  const averageScore = useMemo(() => {
    const scored = gradeRows.filter(
      (row) => row.completedAt && row.score !== null &&
        Number.isFinite(row.score)
    );

    if (scored.length === 0) return null;

    return (
      scored.reduce((sum, row) => sum + row.score, 0) /
      scored.length
    );
  }, [gradeRows]);

  const averageProgress = useMemo(() => {
    if (progressRows.length === 0) return null;

    return (
      progressRows.reduce((sum, row) => sum + row.progress, 0) /
      progressRows.length
    );
  }, [progressRows]);

  const completedEnrollments = progressRows.filter(
    (row) => row.totalLessons > 0 &&
      row.completedLessons === row.totalLessons
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-500">
          <LoaderCircle className="animate-spin" size={22} />
          Loading grades and progress...
        </div>
      </div>
    );
  }

  return (
    <div className="min-w-0 space-y-7 p-9">
      {/* Page heading */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <GraduationCap size={18} />
            Teacher workspace
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Grades &amp; Progress
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track student results and monitor learning progress
            across your courses.
          </p>
        </div>

        <button
          onClick={() => loadData(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={refreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertCircle size={19} className="mt-0.5 shrink-0" />
          <div>
            <p className="font-semibold">Unable to load data</p>
            <p className="mt-1">{error}</p>
            <button
              onClick={() => loadData(true)}
              className="mt-2 font-semibold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Enrolled students"
          value={students.length}
          description="Unique students in your courses"
          icon={Users}
          color={COLORS.blue}
        />

        <StatCard
          title="Average progress"
          value={
            averageProgress === null
              ? "—"
              : percent(averageProgress)
          }
          description="Across student-course enrollments"
          icon={TrendingUp}
          color={COLORS.teal}
        />

        <StatCard
          title="Average quiz score"
          value={
            averageScore === null
              ? "—"
              : percent(averageScore)
          }
          description="Completed attempts with recorded scores"
          icon={Award}
          color={COLORS.purple}
        />

        <StatCard
          title="Courses"
          value={courses.length}
          description={`${completedEnrollments} enrollments with all lessons completed`}
          icon={BookOpen}
          color={COLORS.orange}
        />
      </div>

      {/* Filters and tabs */}
      <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative min-w-0 flex-1">
            <Search
              size={18}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search students, courses, or quizzes..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={courseFilter}
            onChange={(event) => setCourseFilter(event.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none focus:border-blue-400"
          >
            <option value="all">All courses</option>
            {courses.map((course) => (
              <option key={course.id} value={course.id}>
                {course.title}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 flex gap-2 border-b border-slate-100">
          <button
            onClick={() => setTab("progress")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "progress"
                ? "border-[#fe5933] text-[#0b1b33]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Learning progress
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {filteredProgress.length}
            </span>
          </button>

          <button
            onClick={() => setTab("grades")}
            className={`border-b-2 px-4 py-3 text-sm font-semibold transition ${
              tab === "grades"
                ? "border-[#fe5933] text-[#0b1b33]"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            Quiz grades
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs">
              {filteredGrades.length}
            </span>
          </button>
        </div>

        {/* Progress table */}
        {tab === "progress" && (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left">
              <thead>
                <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                  <th className="px-3 py-4 font-semibold">Student</th>
                  <th className="px-3 py-4 font-semibold">Course</th>
                  <th className="px-3 py-4 font-semibold">Lessons</th>
                  <th className="px-3 py-4 font-semibold">Progress</th>
                  <th className="px-3 py-4 font-semibold">Enrolled</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProgress.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/70">
                    <td className="px-3 py-4">
                      <div className="flex items-center gap-3">
                        {row.avatarUrl ? (
                          <img
                            src={row.avatarUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0b1b33] text-xs font-bold text-white">
                            {getInitials(row.studentName)}
                          </div>
                        )}

                        <div>
                          <p className="font-semibold text-slate-800">
                            {row.studentName}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {row.email || "No email available"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-3 py-4">
                      <p className="font-medium text-slate-800">
                        {row.courseTitle}
                      </p>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-600">
                      {row.totalLessons === 0
                        ? "No lessons"
                        : `${row.completedLessons} / ${row.totalLessons}`}
                    </td>

                    <td className="px-3 py-4">
                      <div className="w-36">
                        <div className="mb-2 flex justify-between text-xs font-semibold">
                          <span className="text-slate-700">
                            {row.totalLessons === 0
                              ? "—"
                              : percent(row.progress)}
                          </span>
                          {row.totalLessons > 0 &&
                            row.progress === 100 && (
                              <CheckCircle2
                                size={15}
                                color={COLORS.teal}
                              />
                            )}
                        </div>
                        <ProgressBar
                          value={row.progress}
                          color={COLORS.teal}
                        />
                      </div>
                    </td>

                    <td className="px-3 py-4 text-sm text-slate-500">
                      {formatDate(row.enrolledAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredProgress.length === 0 && (
              <div className="py-14 text-center">
                <Users
                  size={30}
                  className="mx-auto text-slate-300"
                />
                <p className="mt-3 font-semibold text-slate-700">
                  No student progress found
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  Enrollments will appear here when students join
                  your courses.
                </p>
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
