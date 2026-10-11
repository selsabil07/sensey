"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      setLoading(true);
      setError("");

      const supabase = createClient();

      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        setError(error.message);
        setCourses([]);
      } else {
        setCourses(data || []);
      }

      setLoading(false);
    }

    fetchCourses();
  }, []);

  const getTitle = (course) =>
    course.title || course.name || "Untitled course";

  const getStatus = (course) =>
    String(course.status || "active").toLowerCase();

  const formatDate = (date) => {
    if (!date) return "—";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) return "—";

    return parsedDate.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      const status = getStatus(course);

      const matchesSearch = [
        course.title,
        course.name,
        course.subject,
        course.description,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, search, statusFilter]);

  return (
    <div className="min-h-[calc(100vh-5rem)] min-w-0 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6">

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header and filters */}
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                All courses
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage courses available on Sensey.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                />
              </div>

            </div>
          </div>

          {/* Errors */}
          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Could not load courses
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          {/* Courses table */}
          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">Course title</th>
                  <th className="px-6 py-4 font-semibold">Teacher</th>
                  <th className="px-6 py-4 font-semibold">Level</th>
                  <th className="px-6 py-4 font-semibold">Published</th>
                  <th className="px-6 py-4 text-right font-semibold">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-500">
                      Loading courses...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                      Check your Supabase table and permissions.
                    </td>
                  </tr>
                ) : filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <p className="font-medium text-slate-700">
                        No courses found
                      </p>
                      <p className="mt-1 text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((course) => {
                    const title = getTitle(course);
                    const status = getStatus(course);

                    return (
                      <tr
                        key={course.id}
                        className="transition hover:bg-slate-50"
                      >
                       <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">
                          {course.title || "Untitled course"}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {course.profiles?.full_name || "Unknown teacher"}
                      </td>

                      <td className="px-6 py-4 text-slate-600">
                        {course.level || "—"}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            course.published
                              ? "bg-green-50 text-green-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {course.published ? "Published" : "Draft"}
                        </span>
                      </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          >
                            View details
                          </button>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {course.subject || "—"}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {course.teacher_id || "—"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {formatDate(course.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              ["active", "published"].includes(status)
                                ? "bg-green-50 text-green-700"
                                : status === "draft"
                                  ? "bg-amber-50 text-amber-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                ["active", "published"].includes(status)
                                  ? "bg-green-500"
                                  : status === "draft"
                                    ? "bg-amber-500"
                                    : "bg-slate-400"
                              }`}
                            />
                            {status.charAt(0).toUpperCase() +
                              status.slice(1)}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedCourse(course)}
                            className="whitespace-nowrap rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                          >
                            View details
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing {filteredCourses.length} of {courses.length} courses
          </div>
        </section>

        {/* Course details modal */}
        {selectedCourse && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
            onClick={() => setSelectedCourse(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="course-modal-title"
              className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Course details
                  </p>
                  <h2
                    id="course-modal-title"
                    className="mt-1 text-xl font-bold"
                  >
                    {getTitle(selectedCourse)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCourse(null)}
                  aria-label="Close details"
                  className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <Detail label="Course ID" value={selectedCourse.id} />
                <Detail label="Title" value={getTitle(selectedCourse)} />
                <Detail label="Subject" value={selectedCourse.subject} />
                <Detail label="Description" value={selectedCourse.description} />
                <Detail label="Teacher ID" value={selectedCourse.teacher_id} />
                <Detail label="Status" value={getStatus(selectedCourse)} />
                <Detail label="Created" value={formatDate(selectedCourse.created_at)} />
              </div>

              <button
                type="button"
                onClick={() => setSelectedCourse(null)}
                className="mt-7 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 pb-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="break-all text-sm font-medium text-slate-800">
        {value ?? "Not provided"}
      </span>
    </div>
  );
}
