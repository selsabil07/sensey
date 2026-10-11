
"use client";

import { useState } from "react";
import Sidebar from "@/components/admin/Sidebar";
import Navbar from "@/components/admin/Navbar";

export default function AdminLayout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />

      <div className="min-h-screen min-w-0 lg:ml-[260px]">
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="min-w-0 p-5">
          {children}
        </main>
      </div>
    </div>
  );
}
