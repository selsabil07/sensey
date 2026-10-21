"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  RefreshCw,
  LoaderCircle,
  AlertCircle,
  BookOpen,
  UserRound,
  ChevronDown,
  Mail,
  Phone,
  CalendarDays,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(undefined, {
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

export default function TeacherStudentsPage() {
  const supabase = useMemo(() => createClient(), []);

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
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

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return students.filter((student) => {
      const values = [
        student.full_name,
        student.email,
        student.number,
        ...student.courses.map((course) => course.title),
      ];

      const matchesSearch = values.some((value) =>
        String(value || "").toLowerCase().includes(query)
      );

      const matchesCourse =
        selectedCourse === "all" ||
        student.courses.some((course) => course.id === selectedCourse);

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && student.is_active === true) ||
        (statusFilter === "inactive" && student.is_active === false);

      return matchesSearch && matchesCourse && matchesStatus;
    });
  }, [students, search, selectedCourse, statusFilter]);

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
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Total students
                </p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {students.length}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-orange-50 p-2.5 text-orange-600 sm:p-3">
                <Users size={21} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Active students
                </p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {activeCount}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-emerald-50 p-2.5 text-emerald-600 sm:p-3">
                <UserRound size={21} />
              </div>
            </div>
          </div>

          <div className="col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:col-span-1 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-xs text-slate-500 sm:text-sm">
                  Inactive students
                </p>
                <p className="mt-2 text-2xl font-bold sm:text-3xl">
                  {inactiveCount}
                </p>
              </div>
              <div className="shrink-0 rounded-xl bg-slate-100 p-2.5 text-slate-500 sm:p-3">
                <UserRound size={21} />
              </div>
            </div>
          </div>
        </section>

        {/* Students panel */}
        <section className="min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

          {/* Search and filters */}
          <div className="space-y-4 border-b border-slate-100 p-4 sm:p-5">
            <div>
              <h2 className="text-lg font-bold">All students</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredStudents.length}{" "}
                {filteredStudents.length === 1 ? "student" : "students"} found
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[minmax(220px,1.5fr)_minmax(180px,1fr)_minmax(150px,0.8fr)]">
              <div className="relative min-w-0">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students..."
                  aria-label="Search students"
                  className="w-full min-w-0 rounded-xl border border-slate-200 py-3 pl-10 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div className="relative min-w-0">
                <BookOpen
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <select
                  value={selectedCourse}
                  onChange={(event) => setSelectedCourse(event.target.value)}
                  aria-label="Filter by course"
                  className="w-full min-w-0 appearance-none rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-9 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                >
                  <option value="all">All courses</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={15}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                aria-label="Filter by student status"
                className="w-full min-w-0 rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading ? (
            <div className="flex min-h-48 items-center justify-center gap-3 p-8 text-sm text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading students...
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="px-4 py-14 text-center sm:px-6 sm:py-16">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <Users size={28} />
              </div>

              <h3 className="font-semibold">
                {search || selectedCourse !== "all" || statusFilter !== "all"
                  ? "No students found"
                  : "No students enrolled yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search || selectedCourse !== "all" || statusFilter !== "all"
                  ? "Try changing your search or filters."
                  : "Students will appear here when they enroll in one of your courses."}
              </p>
            </div>
          ) : (
            <>
              {/* Mobile student cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {filteredStudents.map((student) => (
                  <article key={student.id} className="space-y-4 p-4">
                    <div className="flex min-w-0 items-start gap-3">
                      {student.avatar_url ? (
                        <img
                          src={student.avatar_url}
                          alt=""
                          className="h-11 w-11 shrink-0 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                          {getInitials(student.full_name)}
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <p className="break-words font-semibold text-slate-900">
                          {student.full_name || "Unnamed student"}
                        </p>

                        <div className="mt-1 flex items-start gap-2 text-xs text-slate-500">
                          {student.email ? (
                            <>
                              <Mail size={14} className="mt-0.5 shrink-0" />
                              <a
                                href={`mailto:${student.email}`}
                                className="break-all hover:text-orange-600"
                              >
                                {student.email}
                              </a>
                            </>
                          ) : student.number ? (
                            <>
                              <Phone size={14} className="mt-0.5 shrink-0" />
                              <a
                                href={`tel:${student.number}`}
                                className="break-all hover:text-orange-600"
                              >
                                {student.number}
                              </a>
                            </>
                          ) : (
                            <span>No contact details</span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0">
                        {student.is_active === true ? (
                          <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                            Active
                          </span>
                        ) : student.is_active === false ? (
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            Inactive
                          </span>
                        ) : (
                          <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                            Unknown
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Enrolled courses
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {student.courses.map((course) => (
                          <span
                            key={course.id}
                            className="max-w-full break-words rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                          >
                            {course.title}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <CalendarDays size={15} className="shrink-0" />
                      <span>
                        Latest enrollment: {formatDate(student.latestEnrollment)}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Tablet and desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full min-w-[680px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-4 font-semibold lg:px-5">
                        Student
                      </th>
                      <th className="px-4 py-4 font-semibold lg:px-5">
                        Enrolled courses
                      </th>
                      <th className="whitespace-nowrap px-4 py-4 font-semibold lg:px-5">
                        Latest enrollment
                      </th>
                      <th className="px-4 py-4 font-semibold lg:px-5">
                        Status
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student) => (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-4 lg:px-5">
                          <div className="flex min-w-0 items-center gap-3">
                            {student.avatar_url ? (
                              <img
                                src={student.avatar_url}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
                                {getInitials(student.full_name)}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="break-words font-semibold text-slate-900">
                                {student.full_name || "Unnamed student"}
                              </p>
                              <p className="mt-1 break-all text-xs text-slate-500">
                                {student.email || student.number || "No contact details"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-4 py-4 lg:px-5">
                          <div className="flex max-w-sm flex-wrap gap-2">
                            {student.courses.map((course) => (
                              <span
                                key={course.id}
                                className="max-w-full break-words rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-medium text-blue-700"
                              >
                                {course.title}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="whitespace-nowrap px-4 py-4 text-slate-600 lg:px-5">
                          {formatDate(student.latestEnrollment)}
                        </td>

                        <td className="px-4 py-4 lg:px-5">
                          {student.is_active === true ? (
                            <span className="inline-flex rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
                              Active
                            </span>
                          ) : student.is_active === false ? (
                            <span className="inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600">
                              Inactive
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">
                              Unknown
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}