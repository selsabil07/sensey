"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Search,
  Bell,
  ChevronDown,
  UserRound,
  Settings,
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  X,
  LoaderCircle,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import useSignOut from "@/hooks/useSignOut";

const PAGE_TITLES = [
  { match: "/student/courses", title: "My Courses", subtitle: "Explore your learning" },
  { match: "/student/schedule", title: "My Schedule", subtitle: "Your classes and upcoming lessons" },
  { match: "/student/quizzes", title: "Quizzes & Assignments", subtitle: "Test your knowledge" },
  { match: "/student/progress", title: "My Progress", subtitle: "Track your achievements" },
  { match: "/student/ai-assistant", title: "AI Learning Assistant", subtitle: "Get help with your learning" },
  { match: "/student/materials", title: "Learning Materials", subtitle: "Your study resources" },
  { match: "/student/profile", title: "My Profile", subtitle: "Your personal information" },
  { match: "/student/settings", title: "Settings", subtitle: "Manage your preferences" },
];

const DASHBOARD_TITLE = {
  title: "Dashboard",
  subtitle: "Your learning overview",
};

const MENU_LINKS = [
  { href: "/student/profile", label: "My Profile", icon: UserRound },
  { href: "/student/settings", label: "Settings", icon: Settings },
  { href: "/student/courses", label: "My Courses", icon: BookOpen },
  { href: "/student/quizzes", label: "Quizzes", icon: ClipboardList },
];

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() || "")
      .join("") || "S"
  );
}

function Avatar({ profile, size = "h-9 w-9" }) {
  const [failed, setFailed] = useState(false);

  // Reset if the avatar URL changes.
  useEffect(() => setFailed(false), [profile?.avatar_url]);

  if (profile?.avatar_url && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatar_url}
        alt=""
        onError={() => setFailed(true)}
        className={`${size} rounded-full border border-slate-200 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${size} flex items-center justify-center rounded-full bg-[#0b1b33] text-xs font-bold text-white`}
    >
      {getInitials(profile?.full_name)}
    </div>
  );
}

export default function StudentNavbar({ onMenuClick = () => {} }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);
  const { signOut, signingOut } = useSignOut();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // "notifications" | "profile" | null

  // Placeholder until a notifications table or service is connected.
  const [notifications] = useState([]);

  const actionsRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const loadNavbarData = useCallback(async () => {
    try {
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) throw authError;

      if (!user) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, email, avatar_url")
        .eq("id", user.id)
        .maybeSingle();

      if (error) throw error;

      setProfile({
        full_name:
          data?.full_name ||
          user.user_metadata?.full_name ||
          user.email?.split("@")[0] ||
          "Student",
        email: data?.email || user.email || "",
        avatar_url: data?.avatar_url || "",
      });
    } catch (error) {
      console.error("Student navbar profile error:", error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    loadNavbarData();
  }, [loadNavbarData]);

  // Close menus on navigation.
  useEffect(() => {
    setOpenMenu(null);
    setMobileSearchOpen(false);
  }, [pathname]);

  // Close dropdowns on outside click or Escape.
  useEffect(() => {
    if (!openMenu) return;

    const onPointerDown = (event) => {
      if (actionsRef.current && !actionsRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };
    const onKeyDown = (event) => {
      if (event.key === "Escape") setOpenMenu(null);
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [openMenu]);

  // Focus the mobile search field when it opens.
  useEffect(() => {
    if (mobileSearchOpen) mobileSearchRef.current?.focus();
  }, [mobileSearchOpen]);

  const currentPage =
    PAGE_TITLES.find(
      (page) =>
        pathname === page.match || pathname.startsWith(`${page.match}/`)
    ) || DASHBOARD_TITLE;

  const toggleMenu = (name) =>
    setOpenMenu((current) => (current === name ? null : name));

  function handleSearch(event) {
    event.preventDefault();

    const query = search.trim();
    if (!query) return;

    router.push(`/student/courses?search=${encodeURIComponent(query)}`);
    setMobileSearchOpen(false);
  }

  const notificationsOpen = openMenu === "notifications";
  const profileOpen = openMenu === "profile";
  const hasNotifications = notifications.length > 0;

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="flex h-[72px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Open navigation"
          aria-controls="student-sidebar"
          className="-ml-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#0b1b33] outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 lg:hidden"
        >
          <Menu size={22} />
        </button>

        {/* Page title */}
        <div className="min-w-0 flex-1 md:flex-none lg:min-w-[220px]">
          <h1 className="truncate text-lg font-bold leading-tight text-[#0b1b33] sm:text-xl">
            {currentPage.title}
          </h1>
          <p className="hidden truncate text-xs text-slate-500 sm:block">
            {currentPage.subtitle}
          </p>
        </div>

        {/* Desktop search */}
        <form
          onSubmit={handleSearch}
          role="search"
          className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 transition focus-within:border-[#4776e6] focus-within:bg-white focus-within:ring-4 focus-within:ring-[#4776e6]/10 md:flex"
        >
          <Search size={18} className="shrink-0 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search courses..."
            aria-label="Search courses"
            className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />
        </form>

        {/* Right-side actions */}
        <div
          ref={actionsRef}
          className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2"
        >
          {/* Mobile search toggle */}
          <button
            type="button"
            onClick={() => {
              setMobileSearchOpen((open) => !open);
              setOpenMenu(null);
            }}
            aria-label={mobileSearchOpen ? "Close search" : "Search courses"}
            aria-expanded={mobileSearchOpen}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 md:hidden"
          >
            {mobileSearchOpen ? <X size={20} /> : <Search size={20} />}
          </button>

          {/* Notifications */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("notifications")}
              aria-label={
                hasNotifications
                  ? `Notifications, ${notifications.length} unread`
                  : "Notifications"
              }
              aria-expanded={notificationsOpen}
              aria-haspopup="true"
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border outline-none transition focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 ${
                notificationsOpen
                  ? "border-[#4776e6]/30 bg-[#4776e6]/10 text-[#4776e6]"
                  : "border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <Bell size={19} />
              {hasNotifications && (
                <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full border-2 border-white bg-[#fe5933]" />
              )}
            </button>

            {notificationsOpen && (
              <div className="fixed inset-x-4 top-[80px] z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl sm:absolute sm:inset-x-auto sm:right-0 sm:top-12 sm:w-80">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                  <h2 className="text-sm font-bold text-[#0b1b33]">
                    Notifications
                  </h2>
                  <button
                    type="button"
                    aria-label="Close notifications"
                    onClick={() => setOpenMenu(null)}
                    className="rounded-lg p-1.5 text-slate-400 outline-none transition hover:bg-slate-100 focus-visible:ring-2 focus-visible:ring-[#4776e6]/60"
                  >
                    <X size={16} />
                  </button>
                </div>

                {!hasNotifications ? (
                  <div className="px-5 py-9 text-center">
                    <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <Bell size={21} />
                    </div>
                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      You're all caught up
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      New lessons, quiz results and announcements will show up
                      here.
                    </p>
                  </div>
                ) : (
                  <ul className="max-h-72 overflow-y-auto">
                    {notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="border-b border-slate-100 px-4 py-3 last:border-0"
                      >
                        <p className="text-sm font-medium text-[#0b1b33]">
                          {notification.title}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {notification.message}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

          {/* Profile menu */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggleMenu("profile")}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
              aria-haspopup="true"
              className={`flex items-center gap-2.5 rounded-xl p-1.5 outline-none transition focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 ${
                profileOpen ? "bg-slate-100" : "hover:bg-slate-50"
              }`}
            >
              <Avatar profile={profile} />

              <div className="hidden max-w-[130px] text-left leading-tight sm:block">
                {loading ? (
                  <>
                    <div className="h-3.5 w-20 animate-pulse rounded bg-slate-200" />
                    <div className="mt-1.5 h-3 w-12 animate-pulse rounded bg-slate-100" />
                  </>
                ) : (
                  <>
                    <p className="truncate text-sm font-semibold text-[#0b1b33]">
                      {profile?.full_name || "Student"}
                    </p>
                    <p className="text-xs text-slate-500">Student</p>
                  </>
                )}
              </div>

              <ChevronDown
                size={16}
                className={`hidden text-slate-400 transition-transform sm:block ${
                  profileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {profileOpen && (
              <div className="absolute right-0 top-12 z-50 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
                <div className="flex items-center gap-3 border-b border-slate-100 px-4 py-4">
                  <Avatar profile={profile} size="h-10 w-10" />
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#0b1b33]">
                      {profile?.full_name || "Student"}
                    </p>
                    <p className="truncate text-xs text-slate-500">
                      {profile?.email || ""}
                    </p>
                  </div>
                </div>

                <div className="p-2">
                  {MENU_LINKS.map(({ href, label, icon: Icon }) => (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setOpenMenu(null)}
                      className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 outline-none transition hover:bg-slate-50 hover:text-[#0b1b33] focus-visible:bg-slate-50"
                    >
                      <Icon size={17} />
                      {label}
                    </Link>
                  ))}
                </div>

                <div className="border-t border-slate-100 p-2">
                  <button
                    type="button"
                    onClick={signOut}
                    disabled={signingOut}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-600 outline-none transition hover:bg-red-50 focus-visible:bg-red-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {signingOut ? (
                      <LoaderCircle size={17} className="animate-spin" />
                    ) : (
                      <LogOut size={17} />
                    )}
                    {signingOut ? "Signing out..." : "Sign out"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile search row */}
      {mobileSearchOpen && (
        <form
          onSubmit={handleSearch}
          role="search"
          className="border-t border-slate-100 px-4 py-3 sm:px-6 md:hidden"
        >
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-[#f8fafc] px-3.5 py-2.5 focus-within:border-[#4776e6] focus-within:bg-white">
            <Search size={18} className="shrink-0 text-slate-400" />
            <input
              ref={mobileSearchRef}
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search courses..."
              aria-label="Search courses"
              className="w-full min-w-0 bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
            />
          </div>
        </form>
      )}
    </header>
  );
}