"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const supabase = createClient();

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTeacher, setSelectedTeacher] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTeachers() {
      setLoading(true);
      setError("");

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("role", "teacher");
      if (error) {
        setError(error.message);
        setTeachers([]);
      } else {
        setTeachers(
          (data || []).sort(
            (a, b) =>
              new Date(b.created_at || 0) -
              new Date(a.created_at || 0)
          )
        );
      }

      setLoading(false);
    }

    fetchTeachers();
  }, []);

  const filteredTeachers = useMemo(() => {
    return teachers.filter((teacher) => {
      const name =
        teacher.full_name ||
        teacher.name ||
        teacher.username ||
        teacher.userName ||
        "";

      const email = teacher.email || "";
      const subject = teacher.subject || "";

      const matchesSearch = [name, email, subject]
        .some((value) =>
          String(value)
            .toLowerCase()
            .includes(search.toLowerCase())
        );

      const status = String(
        teacher.status ||
        (teacher.is_active === false ? "inactive" : "active")
      ).toLowerCase();

      const matchesStatus =
        statusFilter === "all" ||
        status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [teachers, search, statusFilter]);

  const getName = (teacher) =>
    teacher.full_name ||
    teacher.name ||
    teacher.username ||
    teacher.userName ||
    "Unnamed teacher";

  const getStatus = (teacher) =>
    String(
      teacher.status ||
      (teacher.is_active === false ? "inactive" : "active")
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

  return (
    <div className="">
  <div className="">

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-lg font-semibold">
                All teachersss
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Teacher accounts registered on Sensey.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-slate-400">
                  ⌕
                </span>
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-10 w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100 sm:w-64"
                />
              </div>


            </div>
          </div>

          {error && (
            <div className="m-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              <p className="font-semibold">
                Could not load teachers
              </p>
              <p className="mt-1">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-6 py-4 font-semibold">
                    Teacher
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Subject
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Joined
                  </th>
                  <th className="px-6 py-4 font-semibold">
                    Status
                  </th>
                  <th className="px-6 py-4 text-right font-semibold">
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
                      Loading teachers...
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
                ) : filteredTeachers.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-6 py-16 text-center"
                    >
                      <p className="font-medium text-slate-700">
                        No teachers found
                      </p>
                      <p className="mt-1 text-slate-400">
                        Try changing your search or filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map((teacher) => {
                    const status = getStatus(teacher);
                    const name = getName(teacher);

                    return (
                      <tr
                        key={teacher.id || teacher.email}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 font-bold text-orange-700">
                              {name.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <p className="font-semibold text-slate-800">
                                {name}
                              </p>
                              <p className="mt-1 text-slate-500">
                                {teacher.email || "No email"}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {teacher.subject || "Not specified"}
                        </td>

                        <td className="px-6 py-4 text-slate-600">
                          {formatDate(teacher.created_at)}
                        </td>

                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
                              status === "active"
                                ? "bg-green-50 text-green-700"
                                : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                status === "active"
                                  ? "bg-green-500"
                                  : "bg-slate-400"
                              }`}
                            />
                            {status === "active"
                              ? "Active"
                              : status === "inactive"
                                ? "Inactive"
                                : status}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() =>
                              setSelectedTeacher(teacher)
                            }
                            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-orange-300 hover:bg-orange-50 hover:text-orange-700"
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
            Showing {filteredTeachers.length} of {teachers.length} teachers
          </div>
        </section>
      </div>

      {/* Teacher details modal */}
      {selectedTeacher && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          onClick={() => setSelectedTeacher(null)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="teacher-modal-title"
            className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-orange-600">
                  Teacher profile
                </p>
                <h2
                  id="teacher-modal-title"
                  className="mt-1 text-xl font-bold"
                >
                  {getName(selectedTeacher)}
                </h2>
              </div>

              <button
                onClick={() => setSelectedTeacher(null)}
                aria-label="Close details"
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <Detail
                label="Email"
                value={selectedTeacher.email}
              />
              <Detail
                label="Subject"
                value={selectedTeacher.subject}
              />
              <Detail
                label="Account role"
                value={selectedTeacher.role}
              />
              <Detail
                label="Status"
                value={getStatus(selectedTeacher)}
              />
              <Detail
                label="Joined"
                value={formatDate(selectedTeacher.created_at)}
              />
            </div>

            <button
              onClick={() => setSelectedTeacher(null)}
              className="mt-7 w-full rounded-xl bg-slate-900 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Close
            </button>
          </div>
        </div>
      )}
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


