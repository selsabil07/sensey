import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Search,
  Sparkles,
} from "lucide-react";

const SUBJECTS = ["Mathematics", "Languages", "Programming", "Science"];
const PERKS = ["Free to browse", "Learn at your own pace", "Taught by real teachers"];

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fff8f4] p-3">
      <style>{`
        @keyframes sensey-float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-10px) } }
        .sensey-float { animation: sensey-float 6s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) { .sensey-float { animation: none; } }
      `}</style>

      {/* Background decoration */}
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[34rem] w-[34rem] rounded-full bg-[#fe5933]/15 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -left-32 h-[28rem] w-[28rem] rounded-full bg-[#4776e6]/10 blur-3xl" />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          // backgroundImage: "radial-gradient(#0b1b33 0.8px, transparent 0.8px)",
          backgroundSize: "28px 28px",
          maskImage: "radial-gradient(ellipse at 70% 40%, black 0%, transparent 65%)",
          WebkitMaskImage: "radial-gradient(ellipse at 70% 40%, black 0%, transparent 65%)",
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 pb-20 pt-10 sm:px-8 lg:grid-cols-[1.05fr_0.95fr] lg:pb-28 lg:pt-16">
        {/* Copy */}
        <div>
          <p className="inline-flex items-center gap-2 rounded-full border border-[#fe5933]/25 bg-white px-3.5 py-1.5 text-xs font-semibold text-[#c8401f] shadow-sm">
            <Sparkles size={14} /> Online learning, made personal
          </p>

          <h1 className="mt-6 text-5xl font-extrabold leading-[1.05] tracking-tight text-[#0b1b33] sm:text-6xl lg:text-[4.25rem]">
            Learn anything from{" "}
            <span className="relative whitespace-nowrap">
              <span aria-hidden className="absolute inset-x-[-4px] bottom-1 top-[55%] -z-0 -skew-x-6 rounded bg-[#fe5933]/30" />
              <span className="relative">teachers</span>
            </span>{" "}
            who love teaching.
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
            Sensey connects curious students with passionate teachers. Find a course, enroll in a click, and learn at a pace that fits your life.
          </p>

          {/* Search */}
          <form action="/courses" method="get" role="search" className="mt-9 flex max-w-xl items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 focus-within:border-[#fe5933]/60 focus-within:ring-4 focus-within:ring-[#fe5933]/15">
            <label htmlFor="hero-search" className="sr-only">Search courses</label>
            <Search size={20} className="ml-3 shrink-0 text-slate-400" />
            <input
              id="hero-search"
              name="q"
              type="search"
              placeholder="What do you want to learn?"
              className="min-w-0 flex-1 bg-transparent py-3 text-base text-slate-800 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#e94b28] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe5933]"
            >
              Search
            </button>
          </form>

          <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="text-slate-500">Popular:</span>
            {SUBJECTS.map((s) => (
              <Link
                key={s}
                href={`/courses?subject=${encodeURIComponent(s)}`}
                className="rounded-full border border-slate-200 bg-white/70 px-3 py-1 font-medium text-slate-700 transition hover:border-[#fe5933]/50 hover:text-[#c8401f]"
              >
                {s}
              </Link>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-4">
            <Link
              href="/courses"
              className="group inline-flex items-center gap-2 rounded-xl bg-[#0b1b33] px-6 py-3.5 text-sm font-bold text-white transition hover:bg-[#172d4d] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0b1b33]"
            >
              Browse courses
              <ArrowRight size={16} className="transition group-hover:translate-x-0.5" />
            </Link>
            <Link href="/sign-up" className="inline-flex items-center gap-2 text-sm font-bold text-[#0b1b33] underline decoration-[#fe5933] decoration-2 underline-offset-4 hover:text-[#c8401f]">
              <GraduationCap size={18} /> Teach on Sensey
            </Link>
          </div>

          <ul className="mt-9 flex flex-wrap gap-x-6 gap-y-2 text-sm text-slate-600">
            {PERKS.map((p) => (
              <li key={p} className="inline-flex items-center gap-2">
                <CheckCircle2 size={16} className="text-emerald-500" /> {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Visual */}
        <div aria-hidden className="relative mx-auto w-full max-w-md lg:max-w-none">
          <div className="relative mx-auto max-w-[26rem] rounded-[2rem] border border-slate-200 bg-white p-3 shadow-2xl shadow-[#0b1b33]/15 lg:rotate-2">
            <div
              className="flex aspect-[4/3] items-end rounded-[1.4rem] p-5"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 25% 20%, rgba(254,89,51,.6), transparent 55%), linear-gradient(140deg, #0b1b33, #18375e 60%, #4776e6)",
              }}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white backdrop-blur">
                <BookOpen size={24} />
              </div>
            </div>
            <div className="space-y-4 p-4">
              <div>
                <p className="text-xs font-semibold text-[#c8401f]">Sample course</p>
                <p className="mt-1 text-lg font-bold text-[#0b1b33]">Introduction to Algebra</p>
              </div>
              <div>
                <div className="mb-2 flex justify-between text-xs font-medium text-slate-500">
                  <span>Your progress</span>
                  <span>65%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div className="h-full w-[65%] rounded-full bg-gradient-to-r from-[#fe5933] to-[#ff9a6b]" />
                </div>
              </div>
            </div>
          </div>

          <div className="sensey-float absolute -left-2 top-10 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 sm:-left-8">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <CheckCircle2 size={20} />
            </span>
            <div>
              <p className="text-sm font-bold text-[#0b1b33]">Enrolled!</p>
              <p className="text-xs text-slate-500">You can start now</p>
            </div>
          </div>

          <div className="sensey-float absolute -right-2 bottom-12 flex items-center gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3 shadow-xl shadow-slate-900/10 [animation-delay:-3s] sm:-right-6">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#fe5933] text-sm font-bold text-white">
              T
            </span>
            <div>
              <p className="text-sm font-bold text-[#0b1b33]">New lesson added</p>
              <p className="text-xs text-slate-500">From your teacher</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
