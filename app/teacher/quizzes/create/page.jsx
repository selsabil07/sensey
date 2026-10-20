
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  Upload,
  Search,
  ExternalLink,
  Trash2,
  BookOpen,
  LoaderCircle,
  FileCheck2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const BUCKET_NAME = "quiz-pdfs";
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

function formatFileSize(bytes) {
  if (!Number.isFinite(Number(bytes))) return "Unknown size";

  const size = Number(bytes);

  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;

  return `${(size / (1024 * 1024)).toFixed(2)} MB`;
}

function formatDate(date) {
  if (!date) return "Unknown date";

  return new Date(date).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getLessonLabel(lesson) {
  const title =
    lesson.title ||
    lesson.name ||
    lesson.lesson_title ||
    `Lesson ${lesson.order_index ?? ""}`.trim();

  return lesson.order_index != null
    ? `${lesson.order_index}. ${title}`
    : title;
}

export default function TeacherQuizzesPage() {
  const [courses, setCourses] = useState([]);
  const [lessons, setLessons] = useState([]);
  const [pdfs, setPdfs] = useState([]);

  const [selectedCourse, setSelectedCourse] = useState("");
  const [selectedLesson, setSelectedLesson] = useState("");
  const [title, setTitle] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [openingId, setOpeningId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const supabase = useMemo(() => createClient(), []);

  const loadData = useCallback(async () => {
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

      // Load courses owned by the signed-in teacher.
      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select("id, title, subject, level")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (courseError) throw courseError;

      const teacherCourses = courseData || [];
      setCourses(teacherCourses);

      // Load lessons belonging to the teacher's courses.
      let lessonData = [];

      if (teacherCourses.length > 0) {
        const courseIds = teacherCourses.map((course) => course.id);

        const { data, error: lessonError } = await supabase
          .from("lessons")
          .select("*")
          .in("course_id", courseIds);

        if (lessonError) throw lessonError;

        lessonData = data || [];
      }

      setLessons(lessonData);

      // Load this teacher's PDF metadata.
      const { data: pdfData, error: pdfError } = await supabase
        .from("quiz_pdfs")
        .select(
          "id, teacher_id, course_id, lesson_id, title, original_file_name, file_path, file_size, created_at"
        )
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });

      if (pdfError) throw pdfError;

      setPdfs(pdfData || []);
    } catch (err) {
      console.error("Could not load quiz PDFs:", err);
      setError(err.message || "Could not load your quiz PDFs.");
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const courseLessons = useMemo(() => {
    if (!selectedCourse) return [];

    return lessons
      .filter((lesson) => lesson.course_id === selectedCourse)
      .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));
  }, [lessons, selectedCourse]);

  const filteredPdfs = useMemo(() => {
    const query = search.trim().toLowerCase();

    return pdfs.filter((pdf) => {
      const course = courses.find(
        (item) => item.id === pdf.course_id
      );

      return [
        pdf.title,
        pdf.original_file_name,
        course?.title,
      ].some((value) =>
        String(value || "").toLowerCase().includes(query)
      );
    });
  }, [pdfs, courses, search]);

  function handleFileChange(event) {
    setError("");
    setSuccess("");

    const file = event.target.files?.[0];

    if (!file) {
      setSelectedFile(null);
      return;
    }

    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setSelectedFile(null);
      setError("Please select a PDF file.");
      event.target.value = "";
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setError("This file is empty. Please select another PDF.");
      event.target.value = "";
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setSelectedFile(null);
      setError("The PDF must be 10 MB or smaller.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);

    if (!title.trim()) {
      setTitle(file.name.replace(/\.pdf$/i, ""));
    }
  }

  async function handleUpload(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!selectedCourse) {
      setError("Please select a course.");
      return;
    }

    if (!title.trim()) {
      setError("Please enter a title for the PDF.");
      return;
    }

    if (!selectedFile) {
      setError("Please choose a PDF file.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setError("The PDF must be 10 MB or smaller.");
      return;
    }

    setUploading(true);

    let uploadedPath = null;

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

      // Check that the selected course belongs to this teacher.
      const course = courses.find(
        (item) => item.id === selectedCourse
      );

      if (!course) {
        throw new Error("Please select one of your own courses.");
      }

      // Keep the original file name for display, but use a safe
      // unique path inside this teacher's private storage folder.
      const safeFileName = selectedFile.name
        .normalize("NFKD")
        .replace(/[^a-zA-Z0-9._-]/g, "_")
        .replace(/^\.+/, "")
        .slice(-150) || "quiz.pdf";

      uploadedPath = `${user.id}/${crypto.randomUUID()}-${safeFileName}`;

      // 1. Upload the PDF into the private bucket.
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(uploadedPath, selectedFile, {
          contentType: "application/pdf",
          upsert: false,
        });

      if (storageError) throw storageError;

      // 2. Save its metadata in the database.
      const { error: metadataError } = await supabase
        .from("quiz_pdfs")
        .insert({
          teacher_id: user.id,
          course_id: selectedCourse,
          lesson_id: selectedLesson || null,
          title: title.trim(),
          original_file_name: selectedFile.name,
          file_path: uploadedPath,
          file_size: selectedFile.size,
        });

      if (metadataError) {
        // Avoid leaving an orphaned storage file if the database
        // insert fails.
        const { error: cleanupError } = await supabase.storage
          .from(BUCKET_NAME)
          .remove([uploadedPath]);

        if (cleanupError) {
          console.error("Could not clean up uploaded PDF:", cleanupError);
        }

        uploadedPath = null;
        throw metadataError;
      }

      uploadedPath = null;

      setTitle("");
      setSelectedFile(null);
      setSelectedLesson("");

      const fileInput = document.getElementById("quiz-pdf-file");
      if (fileInput) fileInput.value = "";

      setSuccess("Your quiz PDF was uploaded successfully.");
      await loadData();
    } catch (err) {
      console.error("Quiz PDF upload failed:", err);
      setError(err.message || "The PDF could not be uploaded.");
    } finally {
      setUploading(false);
    }
  }

  async function handleOpenPdf(pdf) {
    setError("");
    setSuccess("");
    setOpeningId(pdf.id);

    try {
      // The bucket is private, so generate a short-lived URL.
      const { data, error: urlError } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(pdf.file_path, 60);

      if (urlError) throw urlError;

      if (!data?.signedUrl) {
        throw new Error("Could not generate a secure PDF link.");
      }

      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      console.error("Could not open quiz PDF:", err);
      setError(err.message || "Could not open this PDF.");
    } finally {
      setOpeningId(null);
    }
  }

  async function handleDeletePdf(pdf) {
    const confirmed = window.confirm(
      `Delete "${pdf.title}"? This will permanently remove the PDF.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingId(pdf.id);

    try {
      // Remove the stored file first.
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([pdf.file_path]);

      if (storageError) throw storageError;

      // Then remove its database record.
      const { error: metadataError } = await supabase
        .from("quiz_pdfs")
        .delete()
        .eq("id", pdf.id)
        .eq("teacher_id", pdf.teacher_id);

      if (metadataError) {
        throw new Error(
          `The PDF file was removed, but its database record could not be deleted: ${metadataError.message}`
        );
      }

      setPdfs((current) =>
        current.filter((item) => item.id !== pdf.id)
      );

      setSuccess("Quiz PDF deleted successfully.");
    } catch (err) {
      console.error("Could not delete quiz PDF:", err);
      setError(err.message || "Could not delete this PDF.");
      await loadData();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        {/* Page heading */}
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 text-sm font-semibold text-orange-600">
              TEACHER WORKSPACE
            </p>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Quiz PDFs
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Store and organize your quiz documents by course and lesson.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading || uploading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </header>

        {/* Feedback messages */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
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

        {/* Summary cards */}
        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Stored PDFs</p>
                <p className="mt-2 text-3xl font-bold">{pdfs.length}</p>
              </div>

              <div className="rounded-xl bg-orange-50 p-3 text-orange-600">
                <FileCheck2 size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">Your courses</p>
                <p className="mt-2 text-3xl font-bold">{courses.length}</p>
              </div>

              <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
                <BookOpen size={24} />
              </div>
            </div>
          </div>
        </section>

        {/* Upload form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <div className="mb-6">
            <h2 className="text-xl font-bold">Upload a quiz PDF</h2>
            <p className="mt-1 text-sm text-slate-500">
              PDF files only, with a maximum size of 10 MB.
            </p>
          </div>

          <form onSubmit={handleUpload} className="space-y-5">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label
                  htmlFor="quiz-title"
                  className="mb-2 block text-sm font-semibold"
                >
                  PDF title
                </label>

                <input
                  id="quiz-title"
                  type="text"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Mathematics Quiz - Chapter 1"
                  maxLength={200}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
                />
              </div>

              <div>
                <label
                  htmlFor="quiz-course"
                  className="mb-2 block text-sm font-semibold"
                >
                  Course
                </label>

                <select
                  id="quiz-course"
                  value={selectedCourse}
                  onChange={(event) => {
                    setSelectedCourse(event.target.value);
                    setSelectedLesson("");
                  }}
                  required
                  disabled={courses.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                >
                  <option value="">Select a course</option>
                  {courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title}
                    </option>
                  ))}
                </select>

                {courses.length === 0 && !loading && (
                  <p className="mt-2 text-xs text-amber-700">
                    Create a course before uploading a quiz PDF.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="quiz-lesson"
                  className="mb-2 block text-sm font-semibold"
                >
                  Lesson <span className="font-normal text-slate-400">(optional)</span>
                </label>

                <select
                  id="quiz-lesson"
                  value={selectedLesson}
                  onChange={(event) => setSelectedLesson(event.target.value)}
                  disabled={!selectedCourse || courseLessons.length === 0}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100 disabled:bg-slate-100"
                >
                  <option value="">No specific lesson</option>
                  {courseLessons.map((lesson) => (
                    <option key={lesson.id} value={lesson.id}>
                      {getLessonLabel(lesson)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="quiz-pdf-file"
                  className="mb-2 block text-sm font-semibold"
                >
                  Choose PDF
                </label>

                <input
                  id="quiz-pdf-file"
                  type="file"
                  accept=".pdf,application/pdf"
                  onChange={handleFileChange}
                  required
                  className="block w-full cursor-pointer rounded-xl border border-slate-200 bg-white text-sm file:mr-4 file:border-0 file:bg-orange-50 file:px-4 file:py-3 file:font-semibold file:text-orange-700 hover:file:bg-orange-100"
                />

                {selectedFile && (
                  <p className="mt-2 break-all text-xs text-slate-500">
                    {selectedFile.name} · {formatFileSize(selectedFile.size)}
                  </p>
                )}
              </div>
            </div>

            <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs leading-5 text-slate-500">
                Your file is stored in a private bucket. It is not made public.
              </p>

              <button
                type="submit"
                disabled={uploading || loading || courses.length === 0}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {uploading ? (
                  <>
                    <LoaderCircle size={18} className="animate-spin" />
                    Uploading PDF...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload PDF
                  </>
                )}
              </button>
            </div>
          </form>
        </section>

        {/* PDF library */}
        <section className="space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold">Your PDF library</h2>
              <p className="mt-1 text-sm text-slate-500">
                Browse and manage your stored quiz documents.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search PDFs or courses..."
                className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-100"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-white p-12 text-sm text-slate-500">
              <LoaderCircle size={20} className="animate-spin" />
              Loading your PDF library...
            </div>
          ) : filteredPdfs.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-orange-600">
                <FileText size={28} />
              </div>

              <h3 className="font-semibold">
                {search ? "No matching PDFs" : "No quiz PDFs yet"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                {search
                  ? "Try a different search term."
                  : "Upload your first PDF above. Your saved documents will appear here."}
              </p>
            </div>
          ) : (
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {filteredPdfs.map((pdf) => {
                  const course = courses.find(
                    (item) => item.id === pdf.course_id
                  );

                  const isOpening = openingId === pdf.id;
                  const isDeleting = deletingId === pdf.id;

                  return (
                    <article
                      key={pdf.id}
                      className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5"
                    >
                      <div className="flex min-w-0 items-start gap-4">
                        <div className="shrink-0 rounded-xl bg-red-50 p-3 text-red-600">
                          <FileText size={24} />
                        </div>

                        <div className="min-w-0">
                          <h3 className="break-words font-semibold text-slate-900">
                            {pdf.title}
                          </h3>

                          <p className="mt-1 break-all text-xs text-slate-500">
                            {pdf.original_file_name}
                          </p>

                          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                            <span>{course?.title || "Course unavailable"}</span>
                            <span>·</span>
                            <span>{formatFileSize(pdf.file_size)}</span>
                            <span>·</span>
                            <span>{formatDate(pdf.created_at)}</span>
                            {pdf.lesson_id && (
                              <>
                                <span>·</span>
                                <span>Lesson attached</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-2 sm:justify-end">
                        <button
                          type="button"
                          onClick={() => handleOpenPdf(pdf)}
                          disabled={isOpening || isDeleting}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium transition hover:bg-slate-50 disabled:opacity-50"
                        >
                          {isOpening ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <ExternalLink size={16} />
                          )}
                          Open
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeletePdf(pdf)}
                          disabled={isDeleting || isOpening}
                          aria-label={`Delete ${pdf.title}`}
                          className="inline-flex items-center justify-center gap-2 rounded-lg border border-red-100 px-3 py-2 text-sm font-medium text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                        >
                          {isDeleting ? (
                            <LoaderCircle size={16} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} />
                          )}
                          Delete
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
