"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function Icon({ name, size = 20, strokeWidth = 1.8 }) {
  const paths = {
    users: (
      <>
        <path d="M16 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" />
      </>
    ),
    chart: (
      <>
        <path d="M3 3v18h18" />
        <path d="m19 9-5 5-4-4-5 5" />
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="shrink-0"
    >
      {paths[name]}
    </svg>
  );
}

const initialStats = [
  {
    label: "Total students",
    value: 0,
    icon: "users",
    color: "#4776e6",
    bg: "#edf2ff",
  },
  {
    label: "Total teachers",
    value: 0,
    icon: "book",
    color: "#fe5933",
    bg: "#fff0eb",
  },
  {
    label: "Published courses",
    value: 0,
    icon: "chart",
    color: "#20b8a6",
    bg: "#e6f8f5",
  },
];

export default function AdminCards() {
  const [stats, setStats] = useState(initialStats);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function fetchStats() {
      const supabase = createClient();

      try {
        const [
          { count: studentsCount, error: studentsError },
          { count: teachersCount, error: teachersError },
          { count: coursesCount, error: coursesError },
        ] = await Promise.all([
          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "student"),

          supabase
            .from("profiles")
            .select("id", { count: "exact", head: true })
            .eq("role", "teacher"),

          supabase
            .from("courses")
            .select("id", { count: "exact", head: true })
            .eq("published", true),
        ]);

        if (studentsError) throw studentsError;
        if (teachersError) throw teachersError;
        if (coursesError) throw coursesError;

        if (!cancelled) {
          setStats([
            { ...initialStats[0], value: studentsCount ?? 0 },
            { ...initialStats[1], value: teachersCount ?? 0 },
            { ...initialStats[2], value: coursesCount ?? 0 },
          ]);
        }
      } catch (err) {
        console.error("Failed to load dashboard statistics:", err);

        if (!cancelled) {
          setError(err.message || "Could not load dashboard statistics.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section>
      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          Could not load all statistics: {error}
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {stats.map((stat) => (
          <article
            key={stat.label}
            className="group rounded-2xl border border-slate-100 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200/50"
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{
                  backgroundColor: stat.bg,
                  color: stat.color,
                }}
              >
                <Icon name={stat.icon} size={21} />
              </span>

              <p className="text-sm font-medium text-slate-500">
                {stat.label}
              </p>
            </div>

            <div className="mt-5">
              <span className="text-3xl font-bold tracking-tight text-[#0b1b33]">
                {loading ? "—" : stat.value.toLocaleString()}
              </span>
            </div>

            <p className="mt-2 text-xs text-slate-400">
              {loading ? "Loading..." : "Current total"}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
