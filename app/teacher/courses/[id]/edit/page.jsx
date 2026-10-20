
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronDown,
  ChevronUp,
  FileText,
  LoaderCircle,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
} from "lucide-react";

const emptyLesson = {
  title: "",
  description: "",
  content: "",
};

export default function CourseEditorPage() {
  const params = useParams();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const courseId = params.id;

  const [course, setCourse] = useState(null);
  const [courseForm, setCourseForm] = useState({
    title: "",
    description: "",
    subject: "",
    level: "",
  });
  const [lessons, setLessons] = useState([]);
  const [lessonForm, setLessonForm] = useState(emptyLesson);
  const [editingLessonId, setEditingLessonId] = useState(null);
  const [showLessonForm, setShowLessonForm] = useState(false);

  const [loading, setLoading] = useState(true);
  const [savingCourse, setSavingCourse] = useState(false);
  const [savingLesson, setSavingLesson] = useState(false);
  const [deletingLessonId, setDeletingLessonId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadEditor = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        router.replace("/sign-in");
        return;
      }

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (profile.role !== "teacher") {
        router.replace(
          profile.role === "admin" ? "/admin/dashboard" : "/student"
        );
        return;
      }

      const { data: courseData, error: courseError } = await supabase
        .from("courses")
        .select(
          "id, teacher_id, title, description, subject, level, thumbnail_url, published, created_at"
        )
        .eq("id", courseId)
        .eq("teacher_id", user.id)
        .single();

      if (courseError) throw courseError;

      setCourse(courseData);
      setCourseForm({
        title: courseData.title || "",
        description: courseData.description || "",
        subject: courseData.subject || "",
        level: courseData.level || "",
      });

      const { data: lessonData, error: lessonError } = await supabase
        .from("lessons")
        .select(
          "id, course_id, title, description, content, order_index, created_at, updated_at"
        )
        .eq("course_id", courseId)
        .order("order_index", { ascending: true });

      if (lessonError) throw lessonError;

      setLessons(lessonData || []);
    } catch (err) {
      console.error("Course editor error:", err);
      setError(err.message || "Unable to load this course.");
    } finally {
      setLoading(false);
    }
  }, [supabase, router, courseId]);

  useEffect(() => {
    if (courseId) loadEditor();
  }, [courseId, loadEditor]);

  async function saveCourse(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!courseForm.title.trim()) {
      setError("The course title is required.");
      return;
    }

    setSavingCourse(true);

    try {
      const { data, error: updateError } = await supabase
        .from("courses")
        .update({
          title: courseForm.title.trim(),
          description: courseForm.description.trim() || null,
          subject: courseForm.subject.trim() || null,
          level: courseForm.level.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", courseId)
        .select()
        .single();

      if (updateError) throw updateError;

      setCourse((previous) => ({ ...previous, ...data }));
      setSuccess("Course details saved successfully.");
    } catch (err) {
      console.error("Save course error:", err);
      setError(err.message || "Could not save course details.");
    } finally {
      setSavingCourse(false);
    }
  }

  function openNewLesson() {
    setEditingLessonId(null);
    setLessonForm(emptyLesson);
    setShowLessonForm(true);
    setError("");
    setSuccess("");
  }

  function openEditLesson(lesson) {
    setEditingLessonId(lesson.id);
    setLessonForm({
      title: lesson.title || "",
      description: lesson.description || "",
      content: lesson.content || "",
    });
    setShowLessonForm(true);
    setError("");
    setSuccess("");
  }

  async function saveLesson(event) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!lessonForm.title.trim()) {
      setError("Enter a title for this lesson.");
      return;
    }

    setSavingLesson(true);

    try {
      const payload = {
        title: lessonForm.title.trim(),
        description: lessonForm.description.trim() || null,
        content: lessonForm.content.trim() || null,
        updated_at: new Date().toISOString(),
      };

      if (editingLessonId) {
        const { data, error: updateError } = await supabase
          .from("lessons")
          .update(payload)
          .eq("id", editingLessonId)
          .eq("course_id", courseId)
          .select()
          .single();

        if (updateError) throw updateError;

        setLessons((previous) =>
          previous.map((lesson) =>
            lesson.id === editingLessonId ? data : lesson
          )
        );

        setSuccess("Lesson updated successfully.");
      } else {
        const nextOrder =
          lessons.length > 0
            ? Math.max(...lessons.map((lesson) => lesson.order_index)) + 1
            : 0;

        const { data, error: insertError } = await supabase
          .from("lessons")
          .insert({
            course_id: courseId,
            ...payload,
            order_index: nextOrder,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        setLessons((previous) =>
          [...previous, data].sort(
            (a, b) => a.order_index - b.order_index
          )
        );

        setSuccess("Lesson added successfully.");
      }

      setShowLessonForm(false);
      setEditingLessonId(null);
      setLessonForm(emptyLesson);
    } catch (err) {
      console.error("Save lesson error:", err);
      setError(err.message || "Could not save this lesson.");
    } finally {
      setSavingLesson(false);
    }
  }

  async function deleteLesson(lesson) {
    const confirmed = window.confirm(
      `Delete "${lesson.title}"? This action cannot be undone.`
    );

    if (!confirmed) return;

    setError("");
    setSuccess("");
    setDeletingLessonId(lesson.id);

    try {
      const { error: deleteError } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lesson.id)
        .eq("course_id", courseId);

      if (deleteError) throw deleteError;

      setLessons((previous) =>
        previous.filter((item) => item.id !== lesson.id)
      );

      setSuccess("Lesson deleted successfully.");
    } catch (err) {
      console.error("Delete lesson error:", err);
      setError(err.message || "Could not delete this lesson.");
    } finally {
      setDeletingLessonId(null);
    }
  }

  async function moveLesson(index, direction) {
    const targetIndex = index + direction;

    if (targetIndex < 0 || targetIndex >= lessons.length) return;

    const current = lessons[index];
    const target = lessons[targetIndex];

    setError("");
    setSuccess("");

    try {
      const { error: firstError } = await supabase
        .from("lessons")
        .update({ order_index: target.order_index })
        .eq("id", current.id)
        .eq("course_id", courseId);

      if (firstError) throw firstError;

      const { error: secondError } = await supabase
        .from("lessons")
        .update({ order_index: current.order_index })
        .eq("id", target.id)
        .eq("course_id", courseId);

      if (secondError) {
        await loadEditor();
        throw secondError;
      }

      setLessons((previous) => {
        const next = [...previous];
        [next[index], next[targetIndex]] = [
          next[targetIndex],
          next[index],
        ];
        return next;
      });

      setSuccess("Lesson order updated.");
    } catch (err) {
      console.error("Reorder lessons error:", err);
      setError(err.message || "Could not reorder lessons.");
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#fe5933] focus:ring-2 focus:ring-[#fe5933]/10";

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoaderCircle
          size={32}
          className="animate-spin text-[#fe5933]"
        />
      </div>
    );
  }

  if (!course) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center">
          <BookOpen size={36} className="mx-auto text-slate-400" />
          <h1 className="mt-4 text-xl font-bold">Course not found</h1>
          <p className="mt-2 text-sm text-slate-500">
            This course may not exist, or it may not belong to your account.
          </p>
          <Link
            href="/teacher/courses"
            className="mt-5 inline-flex rounded-xl bg-[#0b1b33] px-5 py-3 text-sm font-semibold text-white"
          >
            Back to courses
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-[#17243b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        {/* Header */}
        <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              href="/teacher/courses"
              className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-[#fe5933]"
            >
              <ArrowLeft size={16} />
              Back to courses
            </Link>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#fff0e9] text-[#fe5933]">
                <BookOpen size={24} />
              </div>
              <div>
                <h1 className="text-2xl font-bold sm:text-3xl">
                  Course editor
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Manage your course information and lessons.
                </p>
              </div>
            </div>
          </div>

          <span
            className={`w-fit rounded-full px-3 py-1.5 text-xs font-semibold ${
              course.published
                ? "bg-emerald-50 text-emerald-700"
                : "bg-amber-50 text-amber-700"
            }`}
          >
            {course.published ? "Published" : "Draft"}
          </span>
        </header>

        {/* Feedback */}
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        {success && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700"
          >
            <Check size={17} />
            {success}
          </div>
        )}

        {/* Course details */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <h2 className="text-lg font-bold">Course information</h2>
          <p className="mt-1 text-sm text-slate-500">
            Update the details students see on your course.
          </p>

          <form onSubmit={saveCourse} className="mt-6 space-y-5">
            <div>
              <label htmlFor="title" className="text-sm font-semibold">
                Course title *
              </label>
              <input
                id="title"
                required
                maxLength={150}
                value={courseForm.title}
                onChange={(event) =>
                  setCourseForm({
                    ...courseForm,
                    title: event.target.value,
                  })
                }
                className={inputClass}
                placeholder="Introduction to Mathematics"
              />
            </div>

            <div>
              <label htmlFor="description" className="text-sm font-semibold">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                maxLength={5000}
                value={courseForm.description}
                onChange={(event) =>
                  setCourseForm({
                    ...courseForm,
                    description: event.target.value,
                  })
                }
                className={`${inputClass} resize-y`}
                placeholder="What will students learn in this course?"
              />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="subject" className="text-sm font-semibold">
                  Subject
                </label>
                <input
                  id="subject"
                  value={courseForm.subject}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      subject: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="Mathematics"
                />
              </div>

              <div>
                <label htmlFor="level" className="text-sm font-semibold">
                  Education level
                </label>
                <input
                  id="level"
                  value={courseForm.level}
                  onChange={(event) =>
                    setCourseForm({
                      ...courseForm,
                      level: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="High School"
                />
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="submit"
                disabled={savingCourse}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b27] disabled:opacity-60"
              >
                {savingCourse ? (
                  <LoaderCircle size={17} className="animate-spin" />
                ) : (
                  <Save size={17} />
                )}
                Save course details
              </button>
            </div>
          </form>
        </section>

        {/* Lessons */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold">Course lessons</h2>
              <p className="mt-1 text-sm text-slate-500">
                {lessons.length} {lessons.length === 1 ? "lesson" : "lessons"}{" "}
                · Arrange and manage your learning content.
              </p>
            </div>

            <button
              type="button"
              onClick={openNewLesson}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0b1b33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#172e4e]"
            >
              <Plus size={18} />
              Add lesson
            </button>
          </div>

          {showLessonForm && (
            <form
              onSubmit={saveLesson}
              className="mt-6 space-y-5 rounded-2xl border border-[#fe5933]/20 bg-[#fffaf8] p-5"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="font-bold">
                  {editingLessonId ? "Edit lesson" : "New lesson"}
                </h3>
                <button
                  type="button"
                  onClick={() => {
                    setShowLessonForm(false);
                    setEditingLessonId(null);
                    setLessonForm(emptyLesson);
                  }}
                  aria-label="Close lesson form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-white"
                >
                  <X size={18} />
                </button>
              </div>

              <div>
                <label htmlFor="lesson-title" className="text-sm font-semibold">
                  Lesson title *
                </label>
                <input
                  id="lesson-title"
                  required
                  maxLength={200}
                  value={lessonForm.title}
                  onChange={(event) =>
                    setLessonForm({
                      ...lessonForm,
                      title: event.target.value,
                    })
                  }
                  className={inputClass}
                  placeholder="e.g. Introduction to algebra"
                />
              </div>

              <div>
                <label
                  htmlFor="lesson-description"
                  className="text-sm font-semibold"
                >
                  Short description
                </label>
                <textarea
                  id="lesson-description"
                  rows={2}
                  value={lessonForm.description}
                  onChange={(event) =>
                    setLessonForm({
                      ...lessonForm,
                      description: event.target.value,
                    })
                  }
                  className={`${inputClass} resize-y`}
                  placeholder="Briefly describe this lesson"
                />
              </div>

              <div>
                <label htmlFor="lesson-content" className="text-sm font-semibold">
                  Lesson content
                </label>
                <textarea
                  id="lesson-content"
                  rows={8}
                  value={lessonForm.content}
                  onChange={(event) =>
                    setLessonForm({
                      ...lessonForm,
                      content: event.target.value,
                    })
                  }
                  className={`${inputClass} resize-y`}
                  placeholder="Write the lesson text, explanations, examples, and exercises..."
                />
                
              </div>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowLessonForm(false)}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={savingLesson}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e94b27] disabled:opacity-60"
                >
                  {savingLesson ? (
                    <LoaderCircle size={17} className="animate-spin" />
                  ) : (
                    <Save size={17} />
                  )}
                  {editingLessonId ? "Update lesson" : "Save lesson"}
                </button>
              </div>
            </form>
          )}

          <div className="mt-6 space-y-3">
            {lessons.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 px-5 py-12 text-center">
                <FileText
                  size={34}
                  className="mx-auto text-slate-300"
                />
                <h3 className="mt-3 font-semibold">No lessons yet</h3>
                <p className="mx-auto mt-2 max-w-sm text-sm text-slate-500">
                  Start building your course by adding your first lesson.
                </p>
                <button
                  type="button"
                  onClick={openNewLesson}
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#fff0e9] px-4 py-2.5 text-sm font-semibold text-[#fe5933]"
                >
                  <Plus size={17} />
                  Add your first lesson
                </button>
              </div>
            ) : (
              lessons.map((lesson, index) => (
                <article
                  key={lesson.id}
                  className="flex flex-col gap-3 rounded-xl border border-slate-100 p-4 transition hover:border-slate-200 sm:flex-row sm:items-center"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#edf2ff] text-[#4776e6]">
                    <FileText size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-xs font-semibold text-slate-400">
                        LESSON {index + 1}
                      </span>
                      <h3 className="font-semibold">{lesson.title}</h3>
                    </div>

                    <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                      {lesson.description ||
                        lesson.content ||
                        "No lesson description yet."}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveLesson(index, -1)}
                      disabled={index === 0}
                      aria-label="Move lesson up"
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronUp size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => moveLesson(index, 1)}
                      disabled={index === lessons.length - 1}
                      aria-label="Move lesson down"
                      className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                    >
                      <ChevronDown size={18} />
                    </button>

                    <button
                      type="button"
                      onClick={() => openEditLesson(lesson)}
                      aria-label={`Edit ${lesson.title}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-[#fff0e9] hover:text-[#fe5933]"
                    >
                      <Pencil size={17} />
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteLesson(lesson)}
                      disabled={deletingLessonId === lesson.id}
                      aria-label={`Delete ${lesson.title}`}
                      className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      {deletingLessonId === lesson.id ? (
                        <LoaderCircle size={17} className="animate-spin" />
                      ) : (
                        <Trash2 size={17} />
                      )}
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
