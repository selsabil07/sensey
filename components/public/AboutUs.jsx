
import Link from "next/link";
import {
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  ArrowUpRight,
  CheckCircle2,
} from "lucide-react";

const features = [
  {
    icon: Sparkles,
    title: "AI-powered learning",
    description:
      "Make learning more interactive with AI-powered educational experiences.",
  },
  {
    icon: GraduationCap,
    title: "Built for teachers",
    description:
      "Create courses, organize learning materials, and support your students.",
  },
  {
    icon: Users,
    title: "One connected platform",
    description:
      "Bring students, teachers, and classroom management together in one place.",
  },
];

export default function AboutUs() {
  return (
    <section
      id="about"
      className="relative px-6 py-24 sm:px-10 lg:px-16"
    >
      <div className="relative mx-auto grid max-w-7xl items-center gap-16 lg:grid-cols-2">
        {/* Left: Introduction */}
        <div>
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 backdrop-blur-md">
            <Sparkles className="h-4 w-4 text-[#fe5933]" />
            About Sensey
          </div>

          <h2 className="max-w-xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Rethinking education.
          </h2>

          <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
            Sensey is alearning and teaching platform designed to
            bring students and teachers closer to a smarter learning experience.
          </p>

          <p className="mt-4 max-w-xl leading-7 text-slate-400">
            Our goal is to make education more accessible, organized, and
            engaging — while giving teachers the tools they need to support
            their students.
          </p>

          <Link
            href="/courses"
            className="group mt-8 inline-flex items-center gap-3 rounded-xl bg-[#fe5933] px-6 py-3.5 font-semibold text-white transition-all duration-300 hover:-translate-y-1 hover:bg-[#ff704d] hover:shadow-lg hover:shadow-[#fe5933]/20"
          >
            Explore our courses
            <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
          </Link>
        </div>

        {/* Right: Feature cards */}
        <div className="relative">
            {/* Background glow */}
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-[#4776b1]/40 to-[#fe5933]/50 blur-3xl" />

            {/* Image */}
            <img
                src="/images/about.png"
                alt="About Sensey"
                className="relative z-10 h-auto w-full rounded-2xl object-contain"
            />
            </div>
      </div>
    </section>
  );
}
