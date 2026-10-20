
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  ClipboardCheck,
  ChartNoAxesCombined,
  Bot,
  Settings,
  GraduationCap,
  X,
  LogOut,
} from "lucide-react";

const navigation = [
  {
    label: "Dashboard",
    href: "/teacher/dashboard",
    icon: LayoutDashboard,
  },
  {
    label: "My Courses",
    href: "/teacher/courses",
    icon: BookOpen,
  },
  {
    label: "Students",
    href: "/teacher/students",
    icon: Users,
  },
  {
    label: "Quizzes",
    href: "/teacher/quizzes",
    icon: ClipboardCheck,
  },
  {
    label: "Grades & Progress",
    href: "/teacher/grades",
    icon: ChartNoAxesCombined,
  },
  {
    label: "AI Assistant",
    href: "/teacher/ai-assistant",
    icon: Bot,
  },
];

export default function TeacherSidebar({
  isOpen,
  onClose,
  onLogout,
}) {
  const pathname = usePathname();

  const isActive = (href) => {
    if (href === "/teacher/dashboard") {
      return pathname === "/teacher/dashboard" ||
        pathname === "/teacher/dashboard";
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 md:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-[#0b1b33] text-white transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0`}
      >
        {/* Logo */}
        <div className="flex h-[76px] items-center justify-between border-b border-white/10 px-6">
          <Link
            href="/teacher/dashboard"
            onClick={onClose}
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#fe5933]">
              <GraduationCap size={24} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-wide">
                Sensey
              </h1>
              <p className="text-xs text-slate-400">
                Teacher Workspace
              </p>
            </div>
          </Link>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close sidebar"
            className="rounded-lg p-2 text-slate-400 hover:bg-white/10 md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
          <p className="mb-4 px-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
            Workspace
          </p>

          {navigation.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`group flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
                  active
                    ? "bg-[#fe5933] text-white shadow-lg shadow-orange-950/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white"
                }`}
              >
                <Icon
                  size={19}
                  className={
                    active
                      ? "text-white"
                      : "text-slate-400 group-hover:text-white"
                  }
                />

                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* <div className="my-5 border-t border-white/10" /> */}


          <Link
            href="/teacher/settings"
            onClick={onClose}
            className={`flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition ${
              isActive("/teacher/settings")
                ? "bg-[#fe5933] text-white"
                : "text-slate-300 hover:bg-white/10 hover:text-white"
            }`}
          >
            <Settings size={19} />
            Settings
          </Link>
        </nav>

        {/* Bottom section */}
        <div className="border-t border-white/10 p-4">


          <button
            type="button"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut size={19} />
            Sign out
          </button>
        </div>
      </aside>
    </>
  );
}
