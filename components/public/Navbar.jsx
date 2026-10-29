"use client";
 
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArrowRight, Menu, X } from "lucide-react";
 
const LINKS = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  // { href: "/teachers", label: "Teachers" },
  { href: "/aboutus", label: "About us" },
  { href: "/contactus", label: "Contact us" },
];
 
const Navbar = () => {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
 
  const isActive = (href) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);
 
  // Close the mobile menu after navigating.
  useEffect(() => setMenuOpen(false), [pathname]);
 
  // Stronger shadow once the page scrolls.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
 
  // Escape closes the menu.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [menuOpen]);
 
  const focusRing =
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#fe5933]";
 
  return (
    <header className="fixed inset-x-0 top-4 z-50 mx-auto w-[calc(100%-2rem)] max-w-6xl">
      {/* Pill */}
      <div
        className={`flex h-16 items-center justify-between rounded-full border border-slate-200/70 bg-white/70 px-3 backdrop-blur-xl transition-shadow duration-300 ${
          scrolled ? "shadow-lg shadow-slate-900/10" : "shadow-sm"
        }`}
      >
        <Link href="/" aria-label="Sensey home" className={`rounded-full p-2 ${focusRing}`}>
          <Image src="/images/logo.png" alt="Sensey" width={40} height={30} priority className="h-8 w-auto" />
        </Link>
 
        <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
          {LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              aria-current={isActive(href) ? "page" : undefined}
              className={`rounded-full px-3.5 py-2 text-sm font-semibold transition ${focusRing} ${
                isActive(href)
                  ? "bg-[#fe5933]/10 text-[#e94b28]"
                  : "text-slate-700 hover:bg-slate-900/5 hover:text-[#fe5933]"
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>
 
        <div className="hidden items-center gap-1 md:flex">
          <Link
            href="/sign-in"
            className={`rounded-full px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-900/5 ${focusRing}`}
          >
            Sign in
          </Link>
          <Link
            href="/signup"
            className={`rounded-full bg-[#fe5933] px-5 py-2.5 text-sm font-bold text-white transition hover:bg-[#e94b28] ${focusRing}`}
          >
            Get started
          </Link>
        </div>
 
        <button
          type="button"
          onClick={() => setMenuOpen((open) => !open)}
          className={`mr-1 rounded-full p-2.5 text-[#0b1b33] transition hover:bg-slate-900/5 md:hidden ${focusRing}`}
          aria-label={menuOpen ? "Close menu" : "Open menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>
 
      {/* Mobile panel */}
      {menuOpen && (
        <nav
          id="mobile-menu"
          aria-label="Mobile"
          className="mt-2 rounded-3xl border border-slate-200/70 bg-white p-3 shadow-xl shadow-slate-900/10 md:hidden"
        >
          <ul className="flex flex-col">
            {LINKS.map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  aria-current={isActive(href) ? "page" : undefined}
                  className={`block rounded-2xl px-4 py-3 text-base font-semibold ${focusRing} ${
                    isActive(href) ? "bg-[#fe5933]/10 text-[#e94b28]" : "text-slate-800 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
 
          <div className="mt-3 grid gap-2 border-t border-slate-100 pt-3">
            <Link
              href="/sign-in"
              className={`rounded-2xl border border-slate-200 px-4 py-3 text-center text-base font-semibold text-slate-800 hover:bg-slate-50 ${focusRing}`}
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className={`flex items-center justify-center gap-2 rounded-2xl bg-[#fe5933] px-4 py-3 text-base font-bold text-white hover:bg-[#e94b28] ${focusRing}`}
            >
              Get started <ArrowRight size={16} />
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
};
 
export default Navbar;