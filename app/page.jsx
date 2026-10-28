
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import Navbar from "@/components/public/Navbar";
import Hero from "@/components/public/Hero";
import Why from "@/components/public/Why";
import Explore from "@/components/public/Explore";
import AboutUs from "@/components/public/AboutUs";
import Contact from "@/components/public/contact";
import Footer from "@/components/public/Footer";


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
    <main className="min-h-screen overflow-hidden bg-blue-50 text-[#0b1b33] ">
      {/* NAVBAR */}
      <Navbar />

      {/* HERO */}
      <Hero />
      {/* about us */}
        <AboutUs />
      {/* FEATURES */}
      <Why />
      {/* PUBLISHED COURSES */}
      <Explore />

      {/* contact info */}
      <Contact />
      
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
      <Footer />
    </main>
  );
}
