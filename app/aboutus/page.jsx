
import Link from "next/link";
import Image from "next/image";
import {
  Sparkles,
  GraduationCap,
  Users,
  BookOpen,
  BrainCircuit,
  Target,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import Footer from "@/components/public/Footer";
import Navbar from "@/components/public/Navbar";

const features = [
  {
    icon: BrainCircuit,
    title: "AI-powered learning",
    description:
      "Make learning more interactive with intelligent tools designed to support students throughout their learning journey.",
    color: "bg-blue-500/10 text-blue-400",
  },
  {
    icon: GraduationCap,
    title: "Empowering teachers",
    description:
      "Give educators a dedicated space to organize courses, share learning materials, and support their students.",
    color: "bg-orange-500/10 text-orange-400",
  },
  {
    icon: Users,
    title: "Connected education",
    description:
      "Bring students, teachers, and educational management together through one connected platform.",
    color: "bg-purple-500/10 text-purple-400",
  },
  {
    icon: BookOpen,
    title: "Organized learning",
    description:
      "Make courses and educational resources easier to access, manage, and explore.",
    color: "bg-teal-500/10 text-teal-400",
  },
];

export default function AboutPage() {
  return (
    <main className="overflow-hidden ">
        <Navbar />
      {/* HERO */}
      <section className="relative px-6 pb-20 pt-32 sm:px-10 sm:pb-28 lg:px-16">
        <div className="pointer-events-none absolute -left-32 top-20 h-80 w-80 rounded-full bg-[#4776e6]/20 blur-[120px]" />
        <div className="pointer-events-none absolute -right-32 top-40 h-80 w-80 rounded-full bg-[#fe5933]/15 blur-[120px]" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-2">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-blue-200 backdrop-blur-xl">
              <Sparkles className="h-4 w-4 text-[#fe5933]" />
              Discover Sensey
            </div>

            <h1 className="mt-7 text-4xl font-bold leading-tight tracking-tight sm:text-6xl">
              Education deserves
              <span className="mt-2 block text-[#fe5933]">
                a smarter future.
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              We believe technology can make learning more engaging and
              teaching more effective. Sensey brings learning,
              educational resources, and course management into one platform.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/courses"
                className="inline-flex items-center gap-2 rounded-xl bg-[#fe5933] px-6 py-3.5 font-semibold transition hover:-translate-y-1 hover:bg-[#ff704d]"
              >
                Explore courses
                <ArrowRight className="h-4 w-4" />
              </Link>

              <Link
                href="/#contact"
                className="rounded-xl border border-white/15 bg-white/5 px-6 py-3.5 font-semibold transition hover:bg-white/10"
              >
                Contact us
              </Link>
            </div>
          </div>

          {/* Hero image */}
          <div className="relative mx-auto w-full max-w-xl">
            <div className="absolute -inset-5 rounded-3xl bg-gradient-to-br from-[#4776b1]/40 to-[#fe5933]/40 blur-3xl" />

            <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-2 shadow-2xl backdrop-blur-xl">
              <Image
                src="/images/about.png"
                alt="Sensey educational platform"
                width={700}
                height={600}
                priority
                className="h-auto w-full rounded-2xl object-contain"
              />
            </div>

            <div className="absolute -bottom-5 -left-3 rounded-2xl border border-white/10 bg-[#142947]/90 p-4 shadow-xl backdrop-blur-xl sm:-left-6">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#4776e6]/20 text-blue-300">
                  <Sparkles className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-semibold">Learn smarter</p>
                  <p className="text-xs text-slate-400">
                    Powered by innovation
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

 

      {/* MISSION AND VISION */}
      <section className="px-6 py-24 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 md:grid-cols-2">
          <div className="group rounded-3xl border border-white bg-blue-800 p-8 transition hover:border-[#4776e6]/40 sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4776e6]/20 text-blue-300">
              <Target className="h-7 w-7" />
            </div>

            <h3 className="mt-7 text-2xl font-bold">Our mission</h3>

            <p className="mt-4 leading-8 text-slate-300">
              To help make education more accessible, organized, and engaging
              by giving students and teachers useful digital.
            </p>
          </div>

          <div className="group rounded-3xl border border-white/10 bg-[#fe5933] to-transparent p-8 transition hover:border-[#fe5933]/40 sm:p-10">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fe5933]/15 text-[#fe7657]">
              <Sparkles className="h-7 w-7" />
            </div>

            <h3 className="mt-7 text-2xl font-bold">Our vision</h3>

            <p className="mt-4 leading-8 text-slate-300">
              To contribute to a future where technology helps educators teach
              effectively and gives learners more opportunities to discover,
              understand, and grow.
            </p>
          </div>
        </div>
      </section>

           {/* OUR STORY */}
      <section className="border-y border-white/5 bg-white/[0.02] px-6 py-20 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2 lg:gap-10">
          <div>
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#fe7657]">
              Who we are
            </span>

            <h2 className="mt-4 text-3xl font-bold leading-tight sm:text-4xl">
              More than a learning platform.
            </h2>
          </div>

          <div className="space-y-5 text-base leading-8 text-slate-400">
            <p>
              Sensey is an educational platform built around the needs of
              students and teachers. It  isdigital learning resources,
              course organization
            </p>
            <p>
              We aim to create a more connected educational environment where
              students can explore knowledge and teachers can manage their
              learning materials in a structured, accessible space.
            </p>
            <p>
              Our focus is simple: use technology thoughtfully to support the
              people at the heart of education.
            </p>
          </div>
        </div>
      </section>

            {/* OUR COMMITMENT */}
      <section className="px-6 pb-24 sm:px-10 lg:px-16">
        <div className="relative bg-[#fe7657]/10 mx-auto max-w-7xl overflow-hidden rounded-3xl  p-8  sm:p-12 lg:p-16">
          <div className=" ">

          <div className="relative grid items-center gap-10 lg:grid-cols-2">
            <div>
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#fe7657]">
                What guides us
              </span>

              <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
                Technology with a purpose.
              </h2>

              <p className="mt-5 leading-8 text-slate-400">
                We believe educational technology should serve people,
                simplify learning, and help teachers focus on what matters:
                supporting students.
              </p>
            </div>

            <ul className="space-y-5">
              {[
                "Student-centered learning experiences",
                "Useful tools for teachers and educators",
                "Organized courses and learning resources",
                "Thoughtful use of AI in education",
              ].map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-[#fe5933]" />
                  <span className="">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        </div>
      </section>

      {/* WHAT MAKES SENSEY DIFFERENT */}
      <section className="relative px-6 pb-24 sm:px-10 lg:px-16">
        <div className="pointer-events-none absolute left-1/2 top-20 h-80 w-80 -translate-x-1/2 rounded-full bg-[#4776e6]/10 blur-[120px]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="mx-auto max-w-2xl text-center">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-[#fe7657]">
              The Sensey experience
            </span>

            <h2 className="mt-4 text-3xl font-bold sm:text-5xl">
              Designed for better learning.
            </h2>

            <p className="mt-5 leading-7 text-slate-400">
              A connected set of tools to support the learning and teaching
              experience.
            </p>
          </div>

          <div className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => {
              const Icon = feature.icon;

              return (
                <article
                  key={feature.title}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.06]"
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-xl ${feature.color}`}
                  >
                    <Icon className="h-6 w-6" />
                  </div>

                  <h3 className="mt-6 text-lg font-semibold">
                    {feature.title}
                  </h3>

                  <p className="mt-3 text-sm leading-7 text-slate-400">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>



      {/* FINAL CTA */}
      <section className="px-6 pb-24 sm:px-10 lg:px-16">
        <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#4776e6] to-[#294a91] px-7 py-14 text-center sm:px-12 sm:py-16">
          <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-[#fe5933]/30 blur-[90px]" />
          <div className="pointer-events-none absolute -bottom-28 -left-16 h-64 w-64 rounded-full bg-blue-300/20 blur-[90px]" />

          <div className="relative">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-white/20 bg-white/10">
              <GraduationCap className="h-7 w-7" />
            </div>

            <h2 className="mt-6 text-3xl font-bold sm:text-5xl">
              Ready to learn with Sensey?
            </h2>

            <p className="mx-auto mt-5 max-w-xl leading-7 text-blue-100">
              Explore our courses and discover a connected approach to
              teaching and learning.
            </p>

            <Link
              href="/courses"
              className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3.5 font-semibold text-[#0b1b33] transition hover:-translate-y-1 hover:bg-slate-100"
            >
              Explore courses
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
