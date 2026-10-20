
"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {

async function fetchStudents() {
  setLoading(true);
  setError("");

  const supabase = createClient();

  // Fetch student profiles
  const {
    data: profiles,
    error: profilesError,
  } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "student")
    .order("created_at", { ascending: false });

  if (profilesError) {
    setError(profilesError.message);
    setStudents([]);
    setLoading(false);
    return;
  }

  // Fetch emails from Supabase Auth through the secure function
  const {
    data: emailData,
    error: emailError,
  } = await supabase.rpc("get_student_emails");

  if (emailError) {
    setError(emailError.message);
    setStudents([]);
    setLoading(false);
    return;
  }

  // Match each email to its profile using the user ID
  const emailById = new Map(
    (emailData || []).map((item) => [item.id, item.email])
  );

  const studentsWithEmails = (profiles || []).map((student) => ({
    ...student,
    email: emailById.get(student.id) || student.email || "",
  }));

  setStudents(studentsWithEmails);
  setLoading(false);
}

    fetchStudents();
  }, []);

  const getName = (student) =>
    student.full_name || "Unnamed student";

  const getStatus = (student) =>
    String(
      student.status ||
        (student.is_active === false ? "inactive" : "active")
    ).toLowerCase();

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

  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const status = getStatus(student);

      const matchesSearch = [
        student.full_name,
        student.email,
        student.number,
      ].some((value) =>
        String(value || "")
          .toLowerCase()
          .includes(search.toLowerCase())
      );

      const matchesStatus =
        statusFilter === "all" || status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [students, search, statusFilter]);


  
const handleToggleStatus = async (student) => {
  const nextStatus = !student.is_active

  try {
    const response = await fetch('/api/admin/users/status', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: student.id,
        isActive: nextStatus,
      }),
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.error || 'Could not update student status')
    }

    setStudents((currentStudents) =>
      currentStudents.map((item) =>
        item.id === student.id
          ? { ...item, is_active: nextStatus }
          : item
      )
    )
  } catch (error) {
    console.error('Student status update failed:', error)
    alert(error.message)
  }
}


  return (
    <div className="min-h-[calc(100vh-5rem)] min-w-0 bg-slate-50 p-4 text-slate-900 sm:p-6 lg:p-8">
      <div className="mx-auto w-full max-w-screen-2xl space-y-6">

        {/* Students table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                All students
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Student accounts registered on Sensey.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              {/* Search */}
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  ⌕
                </span>

                <input
                  type="text"
                  placeholder="Search students..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                />
              </div>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-orange-400"
              >
                <option value="all">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Could not load students
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <div className="w-full overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Student
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Phone
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-slate-500"
                    >
                      Loading students...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center text-slate-400"
                    >
                      Check your Supabase configuration and permissions.
                    </td>
                  </tr>
                ) : filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center">
                      <p className="font-medium text-slate-700">
                        No students found
                      </p>
                      <p className="mt-1 text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map((student) => {
                    const name = getName(student);
                    const status = getStatus(student);

                    return (
                      <tr
                        key={student.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            {student.avatar_url ? (
                              <img
                                src={student.avatar_url}
                                alt=""
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800">
                                {name}
                              </p>
                              <p className="mt-1 truncate text-slate-500">
                                {student.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {student.number || "Not provided"}
                        </td>

                        <td className="whitespace-nowrap px-6 py-4 text-slate-600">
                          {formatDate(student.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                              student.is_active
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}
                          >
                            {student.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleToggleStatus(student)}
                              className={`rounded-lg border px-3 py-2 text-xs font-semibold transition ${
                                student.is_active
                                  ? 'border-red-200 text-red-600 hover:bg-red-50'
                                  : 'border-green-200 text-green-700 hover:bg-green-50'
                              }`}
                            >
                              {student.is_active ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              type="button"
                              onClick={() => setSelectedStudent(student)}
                              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
                            >
                              View details
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
            Showing {filteredStudents.length} of {students.length} students
          </div>
        </section>

        {/* Student details modal */}
        {selectedStudent && (
          <div
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4"
            onClick={() => setSelectedStudent(null)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="student-modal-title"
              className="my-auto w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="mb-6 flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-orange-600">
                    Student profile
                  </p>
                  <h2
                    id="student-modal-title"
                    className="mt-1 text-xl font-bold"
                  >
                    {getName(selectedStudent)}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedStudent(null)}
                  aria-label="Close details"
                  className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                >
                  ×
                </button>
              </div>

              <div className="space-y-4">
                <Detail
                  label="Full name"
                  value={selectedStudent.full_name}
                />
                <Detail
                  label="Email"
                  value={selectedStudent.email}
                />
                <Detail
                  label="Phone number"
                  value={selectedStudent.number}
                />
                <Detail
                  label="Account role"
                  value={selectedStudent.role}
                />
                <Detail
                  label="Status"
                  value={getStatus(selectedStudent)}
                />
                <Detail
                  label="Joined"
                  value={formatDate(selectedStudent.created_at)}
                />
              </div>

              <button
                type="button"
                onClick={() => setSelectedStudent(null)}
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
        {value || "Not provided"}
      </span>
    </div>
  );
}
