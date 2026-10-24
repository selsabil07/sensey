"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  CalendarDays,
  ClipboardList,
  ChartNoAxesCombined,
  Bot,
  FolderOpen,
  UserRound,
  Settings,
  LogOut,
  GraduationCap,
  X,
  LoaderCircle,
} from "lucide-react";
import useSignOut from "@/hooks/useSignOut";

const navigationGroups = [
  {
    title: "Learning",
    items: [
      { label: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
      { label: "My Courses", href: "/student/courses", icon: BookOpen },
      // { label: "Schedule", href: "/student/schedule", icon: CalendarDays },
      {
        label: "Quizzes & Assignments",
        href: "/student/quizzes",
        icon: ClipboardList,
      },
      {
        label: "My Progress",
        href: "/student/progress",
        icon: ChartNoAxesCombined,
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        label: "AI Learning Assistant",
        href: "/student/ai-assistant",
        icon: Bot,
        accent: true,
      },
      {
        label: "Learning Materials",
        href: "/student/materials",
        icon: FolderOpen,
      },
    ],
  },
  {
    title: "Account",
    items: [
      { label: "My Profile", href: "/student/profile", icon: UserRound },
      { label: "Settings", href: "/student/settings", icon: Settings },
    ],
  },
];

export default function Sidebar({ open = false, onClose = () => {} }) {
  const pathname = usePathname();
  const { signOut, signingOut, error } = useSignOut();

  function isActive(href) {
    if (href === "/student") return pathname === "/student";
    return pathname === href || pathname.startsWith(`${href}/`);
  }

  // Close the drawer after navigating.
  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  // While the drawer is open: lock page scroll and allow Escape to close it.
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <>
      {/* Mobile overlay */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[2px] transition-opacity duration-300 lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        id="student-sidebar"
        aria-label="Student sidebar"
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-[#0b1b33] text-white shadow-2xl transition-[transform,visibility] duration-300 ease-out lg:visible lg:translate-x-0 lg:shadow-none ${
          open ? "visible translate-x-0" : "invisible -translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-white/10 px-5">
          <Link
            href="/student"
            className="flex items-center gap-3 rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-[#fe5933]/70"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fe5933] shadow-lg shadow-[#fe5933]/25">
              <GraduationCap size={23} />
            </span>
            <span className="leading-tight">
              <span className="block text-lg font-bold tracking-tight">
                Sensey
              </span>
              <span className="block text-[11px] text-slate-400">
                Student Portal
              </span>
            </span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="rounded-lg p-2 text-slate-300 outline-none transition hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-white/50 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Navigation */}
        <nav
          aria-label="Student navigation"
          className="flex-1 space-y-6 overflow-y-auto px-3 py-6 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]"
        >
          {navigationGroups.map((group) => (
            <div key={group.title}>
              <p className="mb-2 px-3 text-xs font-semibold text-slate-500">
                {group.title}
              </p>

              <ul className="space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active = isActive(item.href);

                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-[#fe5933]/70 ${
                          active
                            ? "bg-white/10 text-white"
                            : item.accent
                            ? "text-[#ff9b82] hover:bg-white/5 hover:text-white"
                            : "text-slate-300 hover:bg-white/5 hover:text-white"
                        }`}
                      >
                        {/* Active marker */}
                        <span
                          aria-hidden="true"
                          className={`absolute -left-3 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full bg-[#fe5933] transition-opacity ${
                            active ? "opacity-100" : "opacity-0"
                          }`}
                        />

                        <span
                          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors ${
                            active
                              ? "bg-[#fe5933] text-white shadow-md shadow-[#fe5933]/30"
                              : "bg-white/5 text-slate-300 group-hover:text-white"
                          }`}
                        >
                          <Icon size={17} strokeWidth={1.9} />
                        </span>

                        <span className="min-w-0 flex-1 truncate">
                          {item.label}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* Sign out */}
        <div className="shrink-0 border-t border-white/10 p-3">
          {error && (
            <p role="alert" className="mb-2 px-3 text-xs leading-5 text-red-300">
              {error}
            </p>
          )}

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13.5px] font-medium text-slate-300 outline-none transition hover:bg-red-500/10 hover:text-red-300 focus-visible:ring-2 focus-visible:ring-red-400/60 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5">
              {signingOut ? (
                <LoaderCircle size={17} className="animate-spin" />
              ) : (
                <LogOut size={17} strokeWidth={1.9} />
              )}
            </span>
            {signingOut ? "Signing out..." : "Sign out"}
          </button>
        </div>
      </aside>
    </>
  );
}