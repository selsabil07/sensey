'Use Client'
import { BookOpen, CalendarDays, Mail, ChevronDown, LoaderCircle, Phone, Search, Users, X } from 'lucide-react'
import React, { useState, useMemo } from 'react'


const StudentsTable = ({students, courses, loading}) => {

    function getInitials(name) {
      return (name || "Student")
        .trim()
        .split(/\s+/)
        .slice(0, 2)
        .map((part) => part[0])
        .join("")
        .toUpperCase();
    }

    function formatDate(date) {
      if (!date) return "—";
    
      return new Date(date).toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    }
    
    const [selectedStudent, setSelectedStudent] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedCourse, setSelectedCourse] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

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

  return (
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
                      <th>
                        View
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
                        <td className="px-4 py-4">
                            <button
                                onClick={() => setSelectedStudent(student)}
                                className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-200"
                            >
                                View
                            </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                
              </div>
              {selectedStudent && (
                <div
                    className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4"
                    onClick={() => setSelectedStudent(null)}
                    >
                    <div
                        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
                        onClick={(e) => e.stopPropagation()}
                    >
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-xl font-bold text-[#0b1b33]">
                        Student Information
                        </h2>

                        <button
                        onClick={() => setSelectedStudent(null)}
                        className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
                        >
                        <X size={20} />
                        </button>
                    </div>

                    <div className="mb-6 flex items-center gap-4">
                        {selectedStudent.avatar_url ? (
                        <img
                            src={selectedStudent.avatar_url}
                            alt={selectedStudent.full_name}
                            className="h-16 w-16 rounded-full object-cover"
                        />
                        ) : (
                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#0b1b33] text-xl font-bold text-white">
                            {selectedStudent.full_name?.charAt(0)?.toUpperCase() || "S"}
                        </div>
                        )}

                        <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                            {selectedStudent.full_name || "No name"}
                        </h3>

                        <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                            selectedStudent.is_active
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            }`}
                        >
                            {selectedStudent.is_active ? "Active" : "Inactive"}
                        </span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* <InfoRow label="Student ID" value={selectedStudent.id} /> */}
                        <InfoRow label="Full Name" value={selectedStudent.full_name} />
                        <InfoRow label="Email" value={selectedStudent.email} />
                        <InfoRow label="Phone" value={selectedStudent.number} />
                        <InfoRow
                        label="Account Created"
                        value={
                            selectedStudent.created_at
                            ? new Date(selectedStudent.created_at).toLocaleDateString()
                            : "Not available"
                        }
                        />
                        {/* Enrolled Courses */}
                        <div className="border-t border-slate-100 pt-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#0b1b33]">
                            Enrolled Courses
                            </h3>

                            <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-600">
                            {selectedStudent.courses?.length || 0} courses
                            </span>
                        </div>

                        {selectedStudent.courses?.length > 0 ? (
                            <div className="max-h-40 space-y-2 overflow-y-auto">
                            {selectedStudent.courses.map((course) => (
                                <div
                                key={course.id}
                                className="flex items-center gap-3 rounded-xl bg-slate-50 p-3"
                                >
                                <div className="rounded-lg bg-orange-50 p-2 text-orange-600">
                                    <BookOpen size={18} />
                                </div>

                                <p className="text-sm font-medium text-slate-700">
                                    {course.title}
                                </p>
                                </div>
                            ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">
                            No enrolled courses.
                            </p>
                        )}
                        </div>
{/* Latest Enrollment */}
                        <div className="border-t border-slate-100 pt-5">
                        <p className="mb-1 text-xs font-medium uppercase text-slate-400">
                            Latest Enrollment
                        </p>

                        <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                            <CalendarDays size={17} className="text-orange-500" />

                            {formatDate(selectedStudent.latestEnrollment)}
                        </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setSelectedStudent(null)}
                        className="mt-7 w-full rounded-xl bg-[#0b1b33] py-3 font-medium text-white hover:bg-[#142b4d]"
                    >
                        Close
                    </button>
                    </div>
                </div>
                )}
            </>
          )}
        </section>
  )
}

export default StudentsTable

function InfoRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-gray-100 pb-3">
      <span className="text-xs font-medium uppercase text-gray-400">
        {label}
      </span>
      <span className="break-all text-sm font-medium text-gray-800">
        {value || "Not available"}
      </span>
      
    </div>
  );
}