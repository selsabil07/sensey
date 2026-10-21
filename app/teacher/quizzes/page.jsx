
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  FileText,
  Plus,
  Search,
  ExternalLink,
  Trash2,
  LoaderCircle,
  RefreshCw,
  AlertCircle,
  FolderOpen,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "quiz-pdfs";

function formatFileSize(bytes) {
  const size = Number(bytes || 0);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "—";

  return new Date(date).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default function TeacherQuizzesPage() {
  const supabase = useMemo(() => createClient(), []);

  const [quizzes, setQuizzes] = useState([]);
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [openingId, setOpeningId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const loadQuizzes = useCallback(async () => {
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

      // Fetch the teacher's courses.
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, subject, level")
        .eq("teacher_id", user.id);

      if (courseError) throw courseError;

      setCourses(courseData || []);

      // Fetch only this teacher's PDF quiz records.
        const { data: quizData, error: quizError } = await supabase
        .from("quiz_pdfs")
        .select("*")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

        if (quizError) throw quizError;

        setQuizzes(quizData ?? []);
        
    } catch (err) {
      console.error("Failed to load quiz PDFs:", err);
      setError(err.message || "Could not load your quizzes.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadQuizzes();
  }, [loadQuizzes]);

  const filteredQuizzes = useMemo(() => {
    const query = search.trim().toLowerCase();

    return quizzes.filter((quiz) => {
      const course = courses.find(
        (item) => item.id === quiz.course_id
      );

      return [
        quiz.title,
        quiz.original_file_name,
        course?.title,
        course?.subject,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [quizzes, courses, search]);

  async function handleOpen(quiz) {
    setError("");
    setSuccess("");
    setOpeningId(quiz.id);

    try {
      const { data, error: signedUrlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(quiz.file_path, 60);

      if (signedUrlError) throw signedUrlError;
      if (!data?.signedUrl) {
        throw new Error("Could not create a secure PDF link.");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Could not open PDF:", err);
      setError(err.message || "Could not open this quiz PDF.");
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDelete(quiz) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${quiz.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(quiz.id);

    try {
      // Remove the file from private Storage first.
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([quiz.file_path]);

      if (storageError) throw storageError;

      // Remove its metadata record.
      const { error: databaseError } = await supabase
        .from("quiz_pdfs")
        .delete()
        .eq("id", quiz.id)
        .eq("teacher_id", quiz.teacher_id);

      if (databaseError) {
        throw new Error(
          `The PDF file was removed, but its database record could not be deleted: ${databaseError.message}`
        );
      }

      setQuizzes((current) =>
        current.filter((item) => item.id !== quiz.id)
      );

      setSuccess("Quiz PDF deleted successfully.");
    } catch (err) {
      console.error("Failed to delete quiz PDF:", err);
      setError(err.message || "Could not delete this quiz.");
      await loadQuizzes();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-7">
        {/* Header */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              Teacher workspace
            </p>

            <h1 className="text-3xl font-bold tracking-tight">
              Quizzes
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Manage all your quiz PDFs in one place.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={loadQuizzes}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-100 disabled:opacity-60"
            >
              <RefreshCw
                size={17}
                className={loading ? "animate-spin" : ""}
              />
              Refresh
            </button>

            <Link
              href="/teacher/quizzes/create"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              <Plus size={18} />
              Upload quiz PDF
            </Link>
          </div>
        </header>

        {/* Notifications */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <p className="break-words">{error}</p>
          </div>
        )}

        {success && (
          <div
            role="status"
            className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            {success}
          </div>
        )}

        {/* Stats */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Total quiz PDFs</p>
                <p className="mt-2 text-3xl font-bold">{quizzes.length}</p>
              </div>
              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <FileText size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Courses with quizzes</p>
                <p className="mt-2 text-3xl font-bold">
                  {
                    new Set(
                      quizzes.map((quiz) => quiz.course_id)
                    ).size
                  }
                </p>
              </div>
              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <FolderOpen size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Table */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-bold">All quizzes</h2>
              <p className="mt-1 text-sm text-slate-500">
                {filteredQuizzes.length}{" "}
                {filteredQuizzes.length === 1 ? "quiz" : "quizzes"} found
              </p>
            </div>

            <div className="relative w-full sm:max-w-sm">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search quizzes or courses..."
                className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 p-14 text-sm text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading quizzes...
            </div>
          ) : filteredQuizzes.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FileText size={28} />
              </div>

              <h3 className="font-semibold">
                {search ? "No quizzes found" : "No quizzes uploaded yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try searching with another title or course name."
                  : "Upload your first quiz PDF to see it listed here."}
              </p>

              {!search && (
                <Link
                  href="/teacher/quizzes/create"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4 py-3 text-sm font-semibold text-white hover:bg-orange-700"
                >
                  <Plus size={17} />
                  Upload your first quiz
                </Link>
              )}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[850px] text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-semibold">Quiz</th>
                    <th className="px-5 py-4 font-semibold">Course</th>
                    <th className="px-5 py-4 font-semibold">File size</th>
                    <th className="px-5 py-4 font-semibold">Date added</th>
                    <th className="px-5 py-4 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredQuizzes.map((quiz) => {
                    const course = courses.find(
                      (item) => item.id === quiz.course_id
                    );

                    const isOpening = openingId === quiz.id;
                    const isDeleting = deletingId === quiz.id;

                    return (
                      <tr
                        key={quiz.id}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="shrink-0 rounded-lg bg-red-50 p-2.5 text-red-600">
                              <FileText size={21} />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-xs truncate font-semibold text-slate-900">
                                {quiz.title}
                              </p>
                              <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                                {quiz.original_file_name}
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-medium text-slate-700">
                            {course?.title || "Course unavailable"}
                          </span>
                          {course?.subject && (
                            <p className="mt-1 text-xs text-slate-500">
                              {course.subject}
                            </p>
                          )}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                          {formatFileSize(quiz.file_size)}
                        </td>

                        <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                          {formatDate(quiz.created_at)}
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => handleOpen(quiz)}
                              disabled={isOpening || isDeleting}
                              title="Open PDF"
                              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-medium hover:bg-white disabled:opacity-50"
                            >
                              {isOpening ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <ExternalLink size={16} />
                              )}
                              Open
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDelete(quiz)}
                              disabled={isDeleting || isOpening}
                              title="Delete PDF"
                              className="inline-flex items-center gap-2 rounded-lg border border-red-100 px-3 py-2 font-medium text-red-600 hover:bg-red-50 disabled:opacity-50"
                            >
                              {isDeleting ? (
                                <LoaderCircle
                                  size={16}
                                  className="animate-spin"
                                />
                              ) : (
                                <Trash2 size={16} />
                              )}
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
