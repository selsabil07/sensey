
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import TeacherSidebar from "./TeacherSidebar";
import TeacherNavbar from "./TeacherNavbar";
import { createClient } from "@/lib/supabase/client";

export default function TeacherLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signOut();

      if (error) throw error;

      router.replace("/sign-in");
      router.refresh();
    } catch (error) {
      console.error("Sign-out failed:", error);
      window.alert("Could not sign out. Please try again.");
      setLoggingOut(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#f7f8fc]">
      <TeacherSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={handleLogout}
      />

      <div className="min-h-screen md:ml-64">
        <TeacherNavbar
          onMenuClick={() => setSidebarOpen(true)}
        />

        {loggingOut && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/60">
            <p className="rounded-xl bg-white px-5 py-3 text-sm font-medium shadow-lg">
              Signing out...
            </p>
          </div>
        )}

        {children}
      </div>
    </div>
  );
}
