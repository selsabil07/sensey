"use client"

import { ArrowRight, BookOpen, Link } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import CourseCard from './CoursCard'
import { createClient } from "@/lib/supabase/client";

const Explore = () => {
    const [loading, setLoading] = useState(true);
     const [courses, setCourses] = useState([]);

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
    <div>
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
      </div>
  )
}

export default Explore