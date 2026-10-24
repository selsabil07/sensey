import { ArrowRight, LibraryBig } from "lucide-react";
import Link from "next/link";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};


export default function EmptyState({ search, onClear }) {
  return (
    <div className="col-span-full rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#4776e6]">
        <LibraryBig size={30} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-slate-900">
        {search ? "No matching courses" : "Your learning journey starts here"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {search
          ? "Try another course title, subject, or level."
          : "You don't have any enrolled courses yet. Browse available courses to find something you'd like to learn."}
      </p>

      {search ? (
        <button
          onClick={onClear}
          className="mt-6 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
        >
          Clear search
        </button>
      ) : (
        <Link
          href="/courses"
          className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90"
          style={{ backgroundColor: COLORS.orange }}
        >
          Explore courses
          <ArrowRight size={17} />
        </Link>
      )}
    </div>
  );
}
