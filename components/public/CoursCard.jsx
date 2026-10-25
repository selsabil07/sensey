
import Link from "next/link";
import { ArrowUpRight, BookOpen } from "lucide-react";

export default function CourseCard({ course, isEnrolled = false }) {
  if (!course) return null;

  const description =
    course.description?.trim() ||
    "Explore this course and start learning with Sensey.";

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-lg">
      {/* Thumbnail */}
      <Link
        href={`/courses/${course.id}`}
        aria-label={`View ${course.title}`}
        className="relative block aspect-video overflow-hidden bg-slate-100"
      >
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title || "Course thumbnail"}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0b1b33] to-[#4776e6]">
            <BookOpen
              size={48}
              strokeWidth={1.4}
              className="text-white"
            />
          </div>
        )}

        {course.level && (
          <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-[#0b1b33] shadow-sm">
            {course.level}
          </span>
        )}
      </Link>

      {/* Course details */}
      <div className="flex flex-1 flex-col p-5">
        {course.subject && (
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-[#fe5933]">
            {course.subject}
          </p>
        )}

        <h3 className="text-lg font-bold leading-snug text-[#0b1b33]">
          <Link
            href={`/courses/${course.id}`}
            className="transition hover:text-[#fe5933]"
          >
            {course.title || "Untitled course"}
          </Link>
        </h3>

        <p className="mt-3 line-clamp-3 flex-1 text-sm leading-6 text-slate-600">
          {description}
        </p>

        {/* Action */}
        <div className="mt-5 border-t border-slate-100 pt-4">
          {isEnrolled && (
            <p className="mb-3 text-xs font-semibold text-emerald-700">
              ✓ You're enrolled
            </p>
          )}

          <Link
            href={`/courses/${course.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0b1b33] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#fe5933]"
          >
            View course
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </div>
    </article>
  );
}
