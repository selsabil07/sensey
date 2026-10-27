
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
import Hero from "@/components/public/Hero";

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
      <Hero />

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
