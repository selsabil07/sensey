
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, ChevronDown, UserRound } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

const pageTitles = [
  { href: "/teacher/dashboard", title: "Dashboard" },
  { href: "/teacher/courses", title: "My Courses" },
  { href: "/teacher/students", title: "Students" },
  { href: "/teacher/quizzes", title: "Quizzes" },
  { href: "/teacher/grades", title: "Grades & Progress" },
  { href: "/teacher/ai-assistant", title: "AI Assistant" },
  { href: "/teacher/settings", title: "Settings" },
];

export default function TeacherNavbar({ onMenuClick }) {
  const pathname = usePathname();
  const [teacherName, setTeacherName] = useState("Teacher");
  const [email, setEmail] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeacher() {
      const supabase = createClient();

      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user || cancelled) return;

      setEmail(user.email || "");

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, role")
        .eq("id", user.id)
        .maybeSingle();

      if (cancelled) return;

      if (profile?.role === "teacher") {
        setTeacherName(profile.full_name || "Teacher");
      }
    }

    loadTeacher();

    return () => {
      cancelled = true;
    };
  }, []);

  const currentPage = [...pageTitles]
    .sort((a, b) => b.href.length - a.href.length)
    .find((page) =>
      page.href === "/teacher/dashboard"
        ? pathname === "/teacher" ||
          pathname === "/teacher/dashboard"
        : pathname === page.href ||
          pathname.startsWith(`${page.href}/`)
    );

  const initials = teacherName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 backdrop-blur sm:px-6 lg:px-8">
      {/* Left side */}
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation menu"
          className="rounded-xl border border-slate-200 p-2 text-[#0b1b33] transition hover:bg-slate-50 md:hidden"
        >
          <Menu size={21} />
        </button>

        <div className="min-w-0">
          <h2 className="truncate text-lg font-bold text-[#0b1b33] sm:text-xl">
            {currentPage?.title || "Teacher Workspace"}
          </h2>

          <p className="hidden text-xs text-slate-500 sm:block">
            Welcome to your Sensey workspace
          </p>
        </div>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3 sm:gap-4">
        <div className="hidden text-right sm:block">
          <p className="max-w-40 truncate text-sm font-semibold text-[#0b1b33]">
            {teacherName}
          </p>
          <p className="max-w-40 truncate text-xs text-slate-500">
            {email}
          </p>
        </div>

        <div
          title={teacherName}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fff0e9] text-sm font-bold text-[#fe5933]"
        >
          {initials || <UserRound size={19} />}
        </div>

        <ChevronDown
          size={17}
          className="hidden text-slate-400 sm:block"
        />
      </div>
    </header>
  );
}
