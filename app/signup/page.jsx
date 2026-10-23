
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  BrainCircuit,
  Eye,
  EyeOff,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SignupPage() {
  const router = useRouter();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (
      !fullName.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (!acceptedTerms) {
      setError("Please accept the Terms & Conditions.");
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } =
        await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

      if (signupError) {
        setError(signupError.message);
        return;
      }

      if (data.user && !data.session) {
        setSuccess(
          "Your account has been created! Check your email to confirm your account before signing in."
        );
        return;
      }

      if (data.user && data.session) {
        router.replace("/student/dashboard");
        router.refresh();
      }
    } catch (err) {
      console.error("Student signup error:", err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
  <main className="flex min-h-screen items-center justify-center bg-[#f4f5f9] sm:p-5 lg:h-screen lg:min-h-0">
    <div className="grid w-full max-w-5xl overflow-hidden rounded-3xl bg-white shadow-[0_12px_50px_rgba(11,27,51,0.12)] lg:h-full lg:max-h-screen lg:grid-cols-2">

      {/* Left branding panel */}
      <section className="relative hidden overflow-hidden bg-[#0b1b33] p-8 text-white md:flex md:flex-col md:justify-between lg:p-10 xl:p-12 ">
        <div className="absolute -right-20 top-20 h-60 w-64 rounded-full bg-[#4776e6]/20 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-[#fe5933]/15 blur-3xl" />

        <Link href="/" className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fe5933]">
            <GraduationCap size={25} />
          </div>
          <div>
            <h1 className="text-xl font-extrabold">Sensey</h1>
            <p className="text-xs text-slate-300">Learn smarter. Grow faster.</p>
          </div>
        </Link>

        <div className="relative z-10 my-5">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-200">
            <Sparkles size={14} className="text-[#fe5933]" />
            YOUR LEARNING JOURNEY
          </span>

          <h2 className="max-w-md text-3xl font-bold leading-tight xl:text-4xl">
            Learn from the world&apos;s best.
            <span className="block text-[#fe5933]">Grow beyond limits.</span>
          </h2>

          <p className="mt-4 max-w-sm text-sm leading-6 text-slate-300">
            Discover new subjects, build your skills, and reach your goals
            with Sensey.
          </p>
        </div>


        <p className="relative z-10 pt-4 text-xs text-slate-400">
          One platform. Endless opportunities to learn.
        </p>
      </section>

      {/* Signup form */}
      <section className="flex min-h-0 items-center justify-center overflow-y-auto px-5 py-2 sm:px-10 xl:py-2 lg:px-8 xl:px-14">
        <div className="w-full max-w-md ">
          {/* Mobile logo */}

          <div className="mb-5">
            <h2 className="text-2xl font-bold tracking-tight text-[#0b1b33] xl:text-3xl">
              Create your account
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Start your learning journey with Sensey.
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-3.5">
            <div>
              <label htmlFor="fullName" className="mb-1.5 block text-sm font-medium text-[#0b1b33]">
                Full name
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                autoComplete="name"
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-[#0b1b33] outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:ring-2 focus:ring-[#4776e6]/10"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[#0b1b33]">
                Email address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                required
                disabled={loading}
                className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-[#0b1b33] outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:ring-2 focus:ring-[#4776e6]/10"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[#0b1b33]">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-sm text-[#0b1b33] outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:ring-2 focus:ring-[#4776e6]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b1b33]"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
              <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm font-medium text-[#0b1b33]">
                Confirm password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  required
                  disabled={loading}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 pr-12 text-sm text-[#0b1b33] outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:ring-2 focus:ring-[#4776e6]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#0b1b33]"
                >
                  {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            </div>
            

            

            <div className="flex items-start gap-2 pt-0.5">
              <input
                id="terms"
                type="checkbox"
                checked={acceptedTerms}
                onChange={(e) => setAcceptedTerms(e.target.checked)}
                disabled={loading}
                className="mt-1 h-4 w-4 shrink-0 accent-[#fe5933]"
              />
              <label htmlFor="terms" className="text-xs leading-5 text-slate-500">
                I agree to the{" "}
                <Link href="/terms" className="font-medium text-[#4776e6] hover:underline">
                  Terms &amp; Conditions
                </Link>{" "}
                and privacy policy.
              </label>
            </div>

            {error && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-sm text-red-700">
                {error}
              </div>
            )}

            {success && (
              <div role="status" className="rounded-lg border border-teal-200 bg-teal-50 px-3 py-2.5 text-sm text-teal-800">
                {success}
                <p className="mt-1">
                  <Link href="/sign-in" className="font-semibold underline">
                    Go to sign in
                  </Link>
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#fe5933] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#e94d2b] focus:outline-none focus:ring-4 focus:ring-[#fe5933]/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Creating account..." : "Create account"}
              {!loading && <ArrowRight size={17} />}
            </button>
          </form>

          <div className="my-5 flex items-center gap-3">
            <div className="h-px flex-1 bg-slate-200" />
            <span className="text-[11px] text-slate-400">START LEARNING WITH SENSEY</span>
            <div className="h-px flex-1 bg-slate-200" />
          </div>

          <p className="text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link href="/sign-in" className="font-semibold text-[#4776e6] hover:text-[#fe5933]">
              Sign in
            </Link>
          </p>
        </div>
      </section>
    </div>
  </main>

  );
}
