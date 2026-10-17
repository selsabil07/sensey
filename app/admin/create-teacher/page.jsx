
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  number,
  UserRound,
  AlertCircle,
  LoaderCircle,
} from "lucide-react";

const initialForm = {
  full_name: "",
  email: "",
  number: "",
  subject: "",
  password: "",
  confirmPassword: "",
};

const subjects = [
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "Computer Science",
  "English",
  "French",
  "Arabic",
  "History",
  "Geography",
  "Other",
];

const inputClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#0b1b33] outline-none transition placeholder:text-slate-400 focus:border-[#fe5933] focus:ring-4 focus:ring-[#fe5933]/10";

export default function CreateTeacherPage() {
  const router = useRouter();

  const [form, setForm] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    const fullName = form.full_name.trim();
    const email = form.email.trim();
    const number = form.number.trim();

    if (!fullName || !email || !number || !form.subject) {
      setError("Please complete all the required fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("The password must contain at least 8 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("The passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/admin/create-teacher", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          full_name: fullName,
          email,
          number: number,
          subject: form.subject,
          password: form.password,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Could not create the teacher account."
        );
      }

      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function createAnotherTeacher() {
    setSuccess(false);
    setError("");
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] px-4 py-8 text-[#0b1b33] sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <Link
          href="/admin/teachers"
          className="mb-7 inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-[#fe5933]"
        >
          <ArrowLeft size={18} />
          Back to teachers
        </Link>

        <div className="mb-8">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#fe5933]/10 text-[#fe5933]">
            <GraduationCap size={25} />
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Create a teacher
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
            Add a teacher to Sensey by entering their account details and
            assigning their teaching subject.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px]">
          {/* Form */}
          <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm sm:p-8">
            {success ? (
              <div className="py-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={34} />
                </div>

                <h2 className="mt-5 text-xl font-bold">
                  Teacher account created!
                </h2>

                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  The teacher account was created successfully. The teacher may
                  need to confirm their email address before signing in.
                </p>

                <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={createAnotherTeacher}
                    className="rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#e94b27]"
                  >
                    Create another teacher
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/admin/teachers")}
                    className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-[#0b1b33] transition hover:bg-slate-50"
                  >
                    View teachers
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="mb-7 border-b border-slate-100 pb-5">
                  <h2 className="text-lg font-bold">Teacher information</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Fields marked with * are required.
                  </p>
                </div>

                {error && (
                  <div
                    role="alert"
                    className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <AlertCircle className="mt-0.5 shrink-0" size={18} />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and email */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="full_name"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <UserRound size={16} className="text-slate-400" />
                        Full name *
                      </label>

                      <input
                        id="full_name"
                        name="full_name"
                        type="text"
                        autoComplete="name"
                        placeholder="e.g. Sarah Benali"
                        value={form.full_name}
                        onChange={handleChange}
                        className={inputClass}
                        required
                        maxLength={100}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="email"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <Mail size={16} className="text-slate-400" />
                        Email address *
                      </label>

                      <input
                        id="email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        placeholder="teacher@example.com"
                        value={form.email}
                        onChange={handleChange}
                        className={inputClass}
                        required
                      />
                    </div>
                  </div>

                  {/* number and subject */}
                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="number"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <number size={16} className="text-slate-400" />
                        number number *
                      </label>

                      <input
                        id="number"
                        name="number"
                        type="tel"
                        autoComplete="tel"
                        placeholder="e.g. 0550 12 34 56"
                        value={form.number}
                        onChange={handleChange}
                        className={inputClass}
                        required
                        maxLength={25}
                      />
                    </div>

                    <div>
                      <label
                        htmlFor="subject"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <BookOpen size={16} className="text-slate-400" />
                        Teaching subject *
                      </label>

                      <select
                        id="subject"
                        name="subject"
                        value={form.subject}
                        onChange={handleChange}
                        className={`${inputClass} ${
                          !form.subject ? "text-slate-400" : ""
                        }`}
                        required
                      >
                        <option value="" disabled>
                          Select a subject
                        </option>

                        {subjects.map((subject) => (
                          <option key={subject} value={subject}>
                            {subject}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Password */}
                  <div className="border-t border-slate-100 pt-6">
                    <h3 className="text-base font-bold">Login credentials</h3>
                    <p className="mt-1 text-sm text-slate-500">
                      Set an initial password for the teacher.
                    </p>
                  </div>

                  <div className="grid gap-5 sm:grid-cols-2">
                    <div>
                      <label
                        htmlFor="password"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <LockKeyhole size={16} className="text-slate-400" />
                        Password *
                      </label>

                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          value={form.password}
                          onChange={handleChange}
                          className={`${inputClass} pr-12`}
                          minLength={8}
                          required
                        />

                        <button
                          type="button"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                          onClick={() => setShowPassword((value) => !value)}
                          className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400 hover:text-[#0b1b33]"
                        >
                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="confirmPassword"
                        className="flex items-center gap-2 text-sm font-semibold"
                      >
                        <LockKeyhole size={16} className="text-slate-400" />
                        Confirm password *
                      </label>

                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Enter the password again"
                          value={form.confirmPassword}
                          onChange={handleChange}
                          className={`${inputClass} pr-12`}
                          required
                        />

                        <button
                          type="button"
                          aria-label={
                            showConfirmPassword
                              ? "Hide password"
                              : "Show password"
                          }
                          onClick={() =>
                            setShowConfirmPassword((value) => !value)
                          }
                          className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400 hover:text-[#0b1b33]"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Submit */}
                  <div className="border-t border-slate-100 pt-6">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#e94b27] disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:min-w-48"
                    >
                      {loading ? (
                        <>
                          <LoaderCircle size={18} className="animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        <>
                          <GraduationCap size={18} />
                          Create teacher account
                        </>
                      )}
                    </button>

                    <p className="mt-3 text-xs leading-5 text-slate-400">
                      Teacher accounts are created by an administrator.
                    </p>
                  </div>
                </form>
              </>
            )}
          </section>

          {/* Information panel */}
          <aside className="space-y-5">
            <div className="rounded-2xl bg-[#0b1b33] p-6 text-white shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-[#fe5933]">
                <GraduationCap size={23} />
              </div>

              <h2 className="mt-5 text-lg font-bold">
                Welcome teachers to Sensey
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-300">
                Each teacher account includes a subject assignment to help
                organize the teaching experience across your platform.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#fe5933]"
                  />
                  <div>
                    <p className="text-sm font-semibold">Account access</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      The teacher can sign in using their email and password
                      after any required email confirmation.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#fe5933]"
                  />
                  <div>
                    <p className="text-sm font-semibold">Subject assignment</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      Keep track of which subject each teacher is responsible
                      for.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <CheckCircle2
                    size={19}
                    className="mt-0.5 shrink-0 text-[#fe5933]"
                  />
                  <div>
                    <p className="text-sm font-semibold">Administrator control</p>
                    <p className="mt-1 text-xs leading-5 text-slate-400">
                      The API verifies the administrator's role before
                      creating a teacher account.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </aside>
        </div>
      </div>
    </main>
  );
}
