
"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  LockKeyhole,
  LoaderCircle,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
} from "lucide-react";

export default function ResetPasswordPage() {
  const supabase = createClient();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Your password must contain at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const { data, error: sessionError } =
        await supabase.auth.getSession();

      if (sessionError) throw sessionError;

      if (!data.session) {
        throw new Error(
          "Your reset link is invalid or expired. Please request a new one."
        );
      }

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      setSuccess(true);
    } catch (err) {
      setError(err.message || "Unable to reset your password.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-100 bg-white p-7 shadow-xl sm:p-9">

        <div className="mb-8 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-50 text-[#fe5933]">
            <LockKeyhole size={27} />
          </div>

          <h1 className="text-2xl font-bold text-[#0b1b33]">
            Reset your password
          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">
            Choose a new password for your Sensey account.
          </p>
        </div>

        {success ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 text-center">
            <CheckCircle2
              size={35}
              className="mx-auto mb-3 text-emerald-600"
            />

            <h2 className="font-semibold text-emerald-800">
              Password updated!
            </h2>

            <p className="mt-2 text-sm text-emerald-700">
              Your password has been changed successfully.
            </p>

            <Link
              href="/sign-in"
              className="mt-5 inline-block rounded-xl bg-[#0b1b33] px-6 py-3 text-sm font-semibold text-white hover:bg-[#142b4d]"
            >
              Go to Sign In
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                New password
              </label>

              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-[#fe5933] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-slate-700">
                Confirm new password
              </label>

              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                autoComplete="new-password"
                required
                className="w-full rounded-xl border border-slate-200 px-4 py-3.5 text-sm outline-none focus:border-[#fe5933] focus:ring-2 focus:ring-orange-100"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#fe5933] py-3.5 text-sm font-semibold text-white hover:bg-[#e94b28] disabled:opacity-60"
            >
              {loading ? (
                <>
                  <LoaderCircle size={18} className="animate-spin" />
                  Updating password...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </form>
        )}

        {!success && (
          <Link
            href="/sign-in"
            className="mt-7 flex items-center justify-center gap-2 text-sm font-semibold text-slate-500 hover:text-[#fe5933]"
          >
            <ArrowLeft size={16} />
            Back to Sign In
          </Link>
        )}
      </div>
    </main>
  );
}
