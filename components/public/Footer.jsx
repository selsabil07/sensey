
"use client";

import { useState } from "react";
import Link from "next/link";

import {
  Sparkles,
  ArrowUpRight,
  Send,
  Mail,
  Heart,
  GraduationCap,
  CameraIcon,
  LucideBanknoteArrowDown,
  GitBranch,
} from "lucide-react";

const footerLinks = {
  Platform: [
    { label: "Home", href: "/" },
    { label: "Explore Courses", href: "/courses" },
    { label: "About Us", href: "/#about" },
    { label: "Contact", href: "/#contact" },
  ],
  "For Everyone": [
    { label: "Student Portal", href: "/student" },
    { label: "Teacher Portal", href: "/teacher" },
    { label: "Sign In", href: "/sign-in" },
    { label: "Get Started", href: "/sign-up" },
  ],
  Resources: [
    { label: "Help Center", href: "/help" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

export default function Footer() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  function handleSubscribe(event) {
    event.preventDefault();

    // Connect this form to a newsletter service or API to save subscribers.
    setMessage("The newsletter form is ready to be connected.");
    setEmail("");
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/10 bg-[#081629] text-white rounded-t-3xl ">
      {/* Background glow */}
      <div className="pointer-events-none absolute -left-32 top-0 h-72 w-72 rounded-full bg-[#4776e6]/10 blur-[110px]" />
      <div className="pointer-events-none absolute -right-32 bottom-0 h-72 w-72 rounded-full bg-[#fe5933]/10 blur-[110px]" />

      <div className="relative mx-auto max-w-7xl px-6 pt-16 sm:px-10 lg:px-16">
        {/* Main footer grid */}
        <div className="grid gap-12 pb-4 md:grid-cols-2 lg:grid-cols-[1.4fr_2fr]">
          {/* Brand */}
          <div className="max-w-md">
            <Link href="/" className="inline-flex items-center gap-3">
              <span className="text-2xl font-bold tracking-tight bg-white rounded-2xl p-2">
                <img src="/images/logo.png" alt="" width={50} height={70} />
              </span>
            </Link>

            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-400 sm:text-base">
              A smarter way to teach and learn. Sensey brings students,
              teachers, and AI-powered educational tools together in one
              connected platform.
            </p>

            <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-slate-300">
              <Sparkles className="h-4 w-4 text-[#fe5933]" />
              Learn smarter. Teach better.
            </div>

            {/* Social links: replace placeholder URLs with your profiles */}
            <div className="mt-7 flex items-center gap-3">
              {[
                { label: "GitHub", icon: GitBranch, href: "https://github.com/" },
                {
                  label: "LinkedIn",
                  icon: LucideBanknoteArrowDown,
                  href: "https://www.linkedin.com/",
                },
                {
                  label: "Instagram",
                  icon: CameraIcon,
                  href: "https://www.instagram.com/",
                },
              ].map(({ label, icon: Icon, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={label}
                  className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-slate-400 transition hover:-translate-y-1 hover:border-[#4776e6]/50 hover:bg-[#4776e6]/10 hover:text-white"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation columns */}
          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3">
            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-semibold text-white">{title}</h3>

                <ul className="mt-5 space-y-4">
                  {links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1 text-sm text-slate-400 transition hover:text-white"
                      >
                        {link.label}
                        <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        {/* Bottom bar */}
        <div className="mt-10 border-t border-white/10 py-6 text-center sm:flex-row sm:items-center sm:text-left">
          <p className="text-xs text-center  text-slate-500 sm:text-sm">
            © {new Date().getFullYear()} Sensey. All rights reserved.
          </p>

        </div>
      </div>
    </footer>
  );
}
