
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ImagePlus,
  LoaderCircle,
  Save,
  Send,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const subjects = [
  "Mathematics",
  "Science",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "Programming",
  "English",
  "French",
  "Arabic",
  "History",
  "Geography",
  "Economics",
  "Other",
];

const levels = [
  "Primary School",
  "Middle School",
  "High School",
  "University",
  "Beginner",
  "Intermediate",
  "Advanced",
];

export default function CreateCoursePage() {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    title: "",
    description: "",
    subject: "",
    level: "",
    thumbnail_url: "",
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event, publish) {
    event.preventDefault();

    if (!form.title.trim() || !form.subject || !form.level) {
      setError("Please complete the title, subject, and level.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError || !user) {
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
        setError("Only teacher accounts can create courses.");
        return;
      }

      const { error: insertError } = await supabase
        .from("courses")
        .insert({
          teacher_id: user.id,
          title: form.title.trim(),
          description: form.description.trim() || null,
          subject: form.subject,
          level: form.level,
          thumbnail_url: form.thumbnail_url.trim() || null,
          published: publish,
        });

      if (insertError) throw insertError;

      router.push("/teacher/courses");
      router.refresh();
    } catch (err) {
      console.error("Create course error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  const inputClass =
    "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#17243b] outline-none transition placeholder:text-slate-400 focus:border-[#fe5933] focus:ring-2 focus:ring-[#fe5933]/10";

  const labelClass = "text-sm font-semibold text-[#17243b]";

  return (
    <main className="min-h-screen bg-[#f7f8fc] px-4 py-6 text-[#17243b] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl space-y-6">
        {/* Header */}
        <div>
          <Link
            href="/teacher/courses"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#fe5933]"
          >
            <ArrowLeft size={17} />
            Back to courses
          </Link>

          <div className="mt-5 flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fff0e9] text-[#fe5933]">
              <BookOpen size={27} />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Create a course
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Build a new learning experience for your students.
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form
          onSubmit={(event) => handleSubmit(event, false)}
          className="space-y-6"
        >
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-6">
              <h2 className="text-lg font-bold">Course information</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add the basic details students need to know.
              </p>
            </div>

            <div className="space-y-5">
              {/* Title */}
              <div>
                <label htmlFor="title" className={labelClass}>
                  Course title <span className="text-[#fe5933]">*</span>
                </label>
                <input
                  id="title"
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g. Introduction to Mathematics"
                  maxLength={150}
                  required
                  className={inputClass}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className={labelClass}>
                  Course description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Describe what students will learn..."
                  rows={5}
                  maxLength={5000}
                  className={`${inputClass} resize-y`}
                />
                <p className="mt-1 text-right text-xs text-slate-400">
                  {form.description.length}/5000
                </p>
              </div>

              {/* Subject and level */}
              <div className="grid gap-5 sm:grid-cols-2">
                <div>
                  <label htmlFor="subject" className={labelClass}>
                    Subject <span className="text-[#fe5933]">*</span>
                  </label>
                  <select
                    id="subject"
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose a subject</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="level" className={labelClass}>
                    Education level <span className="text-[#fe5933]">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={form.level}
                    onChange={handleChange}
                    required
                    className={inputClass}
                  >
                    <option value="">Choose a level</option>
                    {levels.map((level) => (
                      <option key={level} value={level}>
                        {level}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Thumbnail */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8">
            <div className="mb-5">
              <h2 className="text-lg font-bold">Course thumbnail</h2>
              <p className="mt-1 text-sm text-slate-500">
                Add an image URL to give your course a visual identity.
              </p>
            </div>

            <label htmlFor="thumbnail_url" className={labelClass}>
              Image URL <span className="font-normal text-slate-400">(optional)</span>
            </label>

            <div className="relative mt-2">
              <ImagePlus
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                id="thumbnail_url"
                name="thumbnail_url"
                type="url"
                value={form.thumbnail_url}
                onChange={handleChange}
                placeholder="https://example.com/course-image.jpg"
                className={`${inputClass} mt-0 pl-11`}
              />
            </div>

            {form.thumbnail_url.trim() && (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <img
                  src={form.thumbnail_url}
                  alt="Course thumbnail preview"
                  className="h-48 w-full object-cover"
                  onError={(event) => {
                    event.currentTarget.style.display = "none";
                  }}
                />
              </div>
            )}
          </section>

          {/* Error */}
          {error && (
            <div
              role="alert"
              className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
            >
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
            <Link
              href="/teacher/courses"
              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-[#17243b] transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Save size={17} />
              )}
              Save as draft
            </button>

            <button
              type="button"
              disabled={saving}
              onClick={(event) => {
                handleSubmit(event, true);
              }}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94b27] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <Send size={17} />
              )}
              Publish course
            </button>
          </div>

          <p className="text-center text-xs text-slate-400">
            You can add lessons and other learning materials after creating
            your course.
          </p>
        </form>
      </div>
    </main>
  );
}
