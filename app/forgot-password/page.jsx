
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  ArrowLeft,
  Mail,
  LockKeyhole,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const supabase = createClient();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(
        email.trim(),
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (error) throw error;

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl shadow-slate-200/50 sm:p-9">

        {/* Logo / Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#fe5933]">
            <LockKeyhole size={27} />
          </div>

          <h1 className="text-2xl font-bold text-[#0b1b33]">
            Forgot your password?
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            No worries! Enter the email address associated with your account
            and we'll send you a link to reset your password.
          </p>
        </div>

        {/* Success Message */}
        {success ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
            <CheckCircle2
              size={35}
              className="mx-auto mb-3 text-emerald-600"
            />

            <h2 className="font-semibold text-emerald-800">
              Check your email
            </h2>

            <p className="mt-2 break-all text-sm leading-6 text-emerald-700">
              If an account exists for {email}, you should receive a password
              reset link shortly.
            </p>

            <button
              onClick={() => setSuccess(false)}
              className="mt-4 text-sm font-semibold text-emerald-700 underline"
            >
              Try another email
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Email address
              </label>

              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="Enter your email"
                  required
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 py-3.5 pl-11 pr-4 text-sm outline-none transition focus:border-[#fe5933] focus:ring-2 focus:ring-orange-100"
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe5933] py-3.5 text-sm font-semibold text-white transition hover:bg-[#e94b28] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Sending link...
                </>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>
        )}

        {/* Back to Login */}
        <Link
          href="/sign-in"
          className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-[#fe5933]"
        >
          <ArrowLeft size={16} />
          Back to Sign In
        </Link>

      </div>
    </main>
  );
}
