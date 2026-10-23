"use client";

import { useCallback, useState } from "react";
import Sidebar from "@/components/student/Sidebar";
import Navbar from "@/components/student/Navbar";

export default function StudentLayout({ children }) {
  // The layout owns the mobile drawer state so the Navbar can render the
  // menu button inline (no more fixed button floating over the header).
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      <a
        href="#student-main"
        className="sr-only z-[60] rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#0b1b33] shadow focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to content
      </a>

      {/* Sidebar is fixed, so the content column reserves its width with padding. */}
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />

      <div className="flex min-h-screen min-w-0 flex-col lg:pl-[260px]">
        <Navbar onMenuClick={openSidebar} />

        <main
          id="student-main"
          className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
