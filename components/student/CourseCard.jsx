import { ArrowRight, BookMarked, BookOpen, Play } from "lucide-react";
import Link from "next/link";


export default function CourseCard({ course, index, COLORS }) {
  const accentColors = [
    COLORS.blue,
    COLORS.orange,
    COLORS.teal,
    COLORS.purple,
  ];

  const accent = accentColors[index % accentColors.length];

  function formatDate(date) {
    if (!date) return "Recently added";
  
    return new Date(date).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  }

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-slate-200/60">
      <Link
        href={`/courses/${course.id}`}
        className="relative block aspect-[16/9] overflow-hidden bg-slate-100"
        aria-label={`Open ${course.title}`}
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center"
            style={{
              background: `linear-gradient(135deg, ${accent}18, ${accent}35)`,
            }}
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white shadow-sm"
              style={{ color: accent }}
            >
              <BookOpen size={32} />
            </div>
          </div>
        )}

        <div className="absolute left-3 top-3">
          <span className="rounded-full border border-white/60 bg-white/95 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm">
            {course.level || "All levels"}
          </span>
        </div>

        <div className="absolute bottom-3 right-3 flex h-10 w-10 items-center justify-center rounded-full bg-white text-slate-900 opacity-0 shadow-lg transition group-hover:opacity-100">
          <Play size={17} fill="currentColor" />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-3 flex items-center justify-between gap-3">
          <span
            className="rounded-lg px-2.5 py-1 text-xs font-semibold"
            style={{
              color: accent,
              backgroundColor: `${accent}14`,
            }}
          >
            {course.subject || "General"}
          </span>

          <span className="text-xs text-slate-400">
            {formatDate(course.enrolled_at)}
          </span>
        </div>

        <Link href={`/student/courses/${course.id}`}>
          <h2 className="line-clamp-2 text-lg font-bold leading-snug text-slate-900 transition group-hover:text-[#4776e6]">
            {course.title || "Untitled course"}
          </h2>
        </Link>

        <p className="mt-2 line-clamp-2 flex-1 text-sm leading-6 text-slate-500">
          {course.description || "Open this course to explore its learning materials."}
        </p>

        <div className="mt-5 border-t border-slate-100 pt-4">
          <Link
            href={`/courses/${course.id}`}
            className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition"
            style={{
              color: COLORS.navy,
              backgroundColor: "#f4f6fa",
            }}
          >
            <span className="flex items-center gap-2">
              <BookMarked size={16} />
              Open course
            </span>
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>
        </div>
      </div>
    </article>
  );
}