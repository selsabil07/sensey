
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  GraduationCap,
  MonitorSmartphone,
  ShieldCheck,
  UserRound,
  Sparkles,
  Menu,
  X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import CourseCard from "@/components/public/CoursCard";
import Navbar from "@/components/public/Navbar";

const features = [
  {
    icon: GraduationCap,
    title: "Quality Education",
    description:
      "Learn from carefully prepared courses designed to help you build valuable skills.",
    color: "bg-orange-50 text-[#fe5933]",
  },
  {
    icon: UserRound,
    title: "Student-Focused",
    description:
      "Explore learning opportunities and progress at a pace that works for you.",
    color: "bg-blue-50 text-[#4776e6]",
  },
  {
    icon: MonitorSmartphone,
    title: "Learn Anywhere",
    description:
      "Access your learning experience from your laptop, tablet, or mobile device.",
    color: "bg-emerald-50 text-emerald-600",
  },
  {
    icon: ShieldCheck,
    title: "A Supportive Space",
    description:
      "Enjoy an organized learning environment built around students and teachers.",
    color: "bg-purple-50 text-purple-600",
  },
];

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function loadCourses() {
      try {
        const supabase = createClient();

        const { data, error } = await supabase
          .from("courses")
          .select(
            "id, title, description, subject, level, thumbnail_url, published, created_at"
          )
          .eq("published", true)
          .order("created_at", { ascending: false })
          .limit(4);

        if (error) {
          console.error("Failed to load homepage courses:", error);
          return;
        }

        if (active) {
          setCourses(data || []);
        }
      } catch (error) {
        console.error("Unexpected homepage error:", error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadCourses();

    return () => {
      active = false;
    };
  }, []);

  return (
    <main className="min-h-screen overflow-hidden bg-white text-[#0b1b33]">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <section className="relative isolate overflow-hidden bg-gradient-to-br from-white via-white to-blue-50/70">
        <div className="absolute -right-32 top-12 -z-10 h-96 w-96 rounded-full bg-blue-100/50 blur-3xl" />
        <div className="absolute -left-32 bottom-0 -z-10 h-72 w-72 rounded-full bg-orange-100/50 blur-3xl" />

        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 py-16 sm:px-8 md:grid-cols-2 md:py-24">
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-100 bg-orange-50 px-4 py-2 text-xs font-bold uppercase tracking-widest text-[#fe5933]">
              <Sparkles size={15} />
              Learn. Grow. Succeed.
            </div>

            <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
              Your journey to a brighter future starts with{" "}
              <span className="text-[#fe5933]">Sensey.</span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-600 sm:text-lg">
              Discover courses, develop new skills, and take control of your
              learning journey — all in one place.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-500/20 transition hover:-translate-y-0.5 hover:bg-[#e94b28]"
              >
                Browse courses
                <ArrowRight size={18} />
              </Link>

              <a
                href="#about"
                className="rounded-xl border border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-[#0b1b33] transition hover:border-[#4776e6] hover:bg-blue-50"
              >
                Learn more
              </a>
            </div>

            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-600">
              <span className="flex items-center gap-2">
                <ShieldCheck size={17} className="text-emerald-600" />
                Student-friendly
              </span>
              <span className="flex items-center gap-2">
                <BookOpen size={17} className="text-[#4776e6]" />
                Courses in one place
              </span>
            </div>
          </div>

          {/* CSS illustration: no additional image asset required */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute left-1/2 top-1/2 h-[80%] w-[80%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#4776e6]/15" />
            <div className="absolute right-2 top-6 h-24 w-24 rounded-full bg-[#fe5933]/15 blur-2xl" />

            <div className="relative rounded-[2rem] border border-white bg-white/80 p-5 shadow-2xl shadow-blue-900/10 backdrop-blur sm:p-8">
              <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Your learning space
                  </p>
                  <h2 className="mt-1 text-xl font-extrabold">
                    Keep growing.
                  </h2>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-50 text-[#fe5933]">
                  <GraduationCap size={27} />
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="rounded-2xl bg-[#0b1b33] p-5 text-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-medium text-blue-200">
                        YOUR NEXT STEP
                      </p>
                      <h3 className="mt-2 text-xl font-bold">
                        Discover something new
                      </h3>
                      <p className="mt-2 text-sm leading-6 text-slate-300">
                        Find a course that matches your goals.
                      </p>
                    </div>
                    <BookOpen
                      size={29}
                      className="shrink-0 text-[#fe5933]"
                    />
                  </div>
                  <Link
                    href="/courses"
                    className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-orange-300 hover:text-white"
                  >
                    Explore learning
                    <ArrowRight size={16} />
                  </Link>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#4776e6]">
                      <GraduationCap size={22} />
                    </div>
                    <p className="font-bold">Learn</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Build your knowledge
                    </p>
                  </div>

                  <div className="rounded-2xl border border-slate-100 bg-white p-4">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                      <Sparkles size={22} />
                    </div>
                    <p className="font-bold">Grow</p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Develop new skills
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -left-3 top-1/4 hidden items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-xl sm:flex">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-50 text-[#fe5933]">
                <GraduationCap size={23} />
              </div>
              <div>
                <p className="text-sm font-bold">Keep learning</p>
                <p className="text-xs text-slate-500">One step at a time</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section id="about" className="border-y border-slate-100 bg-slate-50/80">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-14 sm:px-8 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <article key={feature.title} className="text-center">
                <div
                  className={`mx-auto flex h-14 w-14 items-center justify-center rounded-2xl ${feature.color}`}
                >
                  <Icon size={27} />
                </div>
                <h2 className="mt-4 font-bold">{feature.title}</h2>
                <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-slate-500">
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* PUBLISHED COURSES */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 md:py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#fe5933]">
              Start exploring
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Explore our courses
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
              Find learning opportunities that help you move closer to your
              goals.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-2 text-sm font-bold text-[#fe5933] transition hover:gap-3"
          >
            View all courses
            <ArrowRight size={17} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((item) => (
              <div
                key={item}
                className="overflow-hidden rounded-2xl border border-slate-100 bg-white"
              >
                <div className="aspect-video animate-pulse bg-slate-100" />
                <div className="space-y-3 p-5">
                  <div className="h-3 w-1/3 animate-pulse rounded bg-slate-100" />
                  <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
                  <div className="h-10 animate-pulse rounded-xl bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-14 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-[#4776e6]">
              <BookOpen size={28} />
            </div>
            <h3 className="mt-4 text-lg font-bold">
              Courses are coming soon
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              Check back soon to discover courses published by our teachers.
            </p>
            <Link
              href="/courses"
              className="mt-5 inline-flex items-center gap-2 font-bold text-[#fe5933]"
            >
              Browse course catalog
              <ArrowRight size={17} />
            </Link>
          </div>
        )}
      </section>

      {/* FINAL CALL TO ACTION */}
      <section className="px-5 pb-16 sm:px-8 md:pb-20">
        <div className="relative mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 overflow-hidden rounded-3xl bg-[#0b1b33] px-7 py-10 text-white sm:px-10 md:flex-row md:items-center md:px-14 md:py-12">
          <div className="absolute -right-12 -top-24 h-64 w-64 rounded-full bg-[#4776e6]/30 blur-3xl" />
          <div className="absolute -bottom-20 -left-12 h-48 w-48 rounded-full bg-[#fe5933]/30 blur-3xl" />

          <div className="relative max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-300">
              Your future starts here
            </p>
            <h2 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
              Ready to start learning?
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-300 sm:text-base">
              Take the next step in your learning journey. Explore our
              available courses and find something new to master.
            </p>
          </div>

          <div className="relative flex w-full flex-wrap gap-3 md:w-auto md:shrink-0">
            <Link
              href="/courses"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#e94b28] sm:flex-none"
            >
              Get started
              <ArrowRight size={17} />
            </Link>

            <Link
              href="/sign-in"
              className="inline-flex flex-1 items-center justify-center rounded-xl border border-white/30 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-white/10 sm:flex-none"
            >
              Sign in
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 px-5 py-7 sm:px-8 md:flex-row md:items-center md:justify-between">
          <Link
            href="/"
            className="text-xl font-extrabold tracking-tight"
          >
            Sensey<span className="text-[#fe5933]">.</span>
          </Link>

          <p className="text-sm text-slate-500">
            Learn something new. Build your future.
          </p>

          <div className="flex gap-5 text-sm font-medium text-slate-600">
            <Link
              href="/courses"
              className="transition hover:text-[#fe5933]"
            >
              Courses
            </Link>
            <Link
              href="/sign-in"
              className="transition hover:text-[#fe5933]"
            >
              Sign in
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
