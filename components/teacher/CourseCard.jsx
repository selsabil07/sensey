import Link from "next/link";
import {
GraduationCap,
CalendarDays,
ArrowUpRight,
} from "lucide-react";

export default function CourseCard({ course, status = "unknown" }) {
if (!course) return null;

const statusStyles = {
published: "bg-emerald-50 text-emerald-700 ring-emerald-600/10",
draft: "bg-orange-50 text-orange-700 ring-orange-600/10",
unknown: "bg-slate-100 text-slate-600 ring-slate-500/10",
};

const statusLabel = {
published: "Published",
draft: "Draft",
unknown: "Unknown",
};

return (
<article className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-lg">
<div className="relative flex h-40 shrink-0 items-center justify-center overflow-hidden bg-gradient-to-br from-[#0b1b33] via-[#142e50] to-[#24456c]">
{course.thumbnail_url ? (
<img
src={course.thumbnail_url}
alt={course.title || "Course thumbnail"}
className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover"
/>
) : (
<>
<div className="absolute -right-8 -top-10 h-36 w-36 rounded-full border-[22px] border-white/5" />
<div className="absolute -bottom-12 -left-8 h-36 w-36 rounded-full border-[22px] border-white/5" />

        <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-white backdrop-blur">
          <GraduationCap size={34} strokeWidth={1.7} />
        </div>

        <span className="absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.2em] text-white/50">
          Sensey learning
        </span>
      </>
    )}

    <span
      className={`absolute right-4 top-4 rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${
        statusStyles[status] || statusStyles.unknown
      }`}
    >
      {statusLabel[status] || statusLabel.unknown}
    </span>
  </div>

  <div className="flex flex-1 flex-col p-5">
    <h2 className="line-clamp-2 min-h-14 break-words text-lg font-bold leading-7 text-[#0b1b33] transition group-hover:text-[#fe5933]">
      {course.title || "Untitled course"}
    </h2>

    {course.description && (
      <p className="mt-2 line-clamp-2 text-sm leading-5 text-slate-500">
        {course.description}
      </p>
    )}

    <div className="mt-4 flex flex-wrap gap-2">
      {course.subject && (
        <span className="rounded-lg bg-[#edf2ff] px-2.5 py-1.5 text-xs font-semibold text-[#4776e6]">
          {course.subject}
        </span>
      )}

      {course.level && (
        <span className="rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-medium text-slate-600">
          {course.level}
        </span>
      )}
    </div>

    <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
      <CalendarDays size={15} className="shrink-0" />
      <span>
        Created{" "}
        {course.created_at
          ? new Date(course.created_at).toLocaleDateString()
          : "Date unavailable"}
      </span>
    </div>

    <div className="mt-auto border-t border-slate-100 pt-4">
      <Link
        href={`/teacher/courses/${course.id}/edit`}
        className="flex items-center justify-between gap-2 rounded-lg py-2 text-sm font-semibold text-[#fe5933] transition hover:text-[#d94020]"
      >
        <span>Manage course</span>
        <ArrowUpRight
          size={18}
          className="transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
        />
      </Link>
    </div>
  </div>
</article>

);
}