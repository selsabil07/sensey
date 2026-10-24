"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ClipboardList,
  FileText,
  CalendarDays,
  AlertCircle,
  LoaderCircle,
  RefreshCw,
  ArrowUpRight,
  BookOpen,
  Filter,
  Download,
  Inbox,
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import SummaryCard from "@/components/student/SummaryCard";

const COLORS = {
  navy: "#0b1b33",
  orange: "#fe5933",
  blue: "#4776e6",
  teal: "#20b8a6",
  purple: "#9274e8",
};

const TYPE_FILTERS = ["All", "Online quizzes", "Quiz PDFs"];
const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

function normalizeRelation(value) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value) {
  if (!value) return "Added date unavailable";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Added date unavailable";

  return date.toLocaleDateString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function ResourceCard({ item, onOpen }) {
  const isPdf = item.type === "pdf";
  const accent = isPdf ? COLORS.orange : COLORS.blue;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg sm:p-6">
      <div className="flex items-start justify-between gap-3">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
          style={{
            color: accent,
            backgroundColor: `${accent}14`,
          }}
        >
          {isPdf ? <FileText size={23} /> : <ClipboardList size={23} />}
        </div>

        <span
          className="rounded-full px-3 py-1 text-xs font-semibold"
          style={{
            color: isPdf ? "#b45309" : COLORS.blue,
            backgroundColor: isPdf ? "#fef3c7" : "#4776e618",
          }}
        >
          {isPdf ? "PDF available" : "Online quiz"}
        </span>
      </div>

      <div className="mt-4 flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wide"
          style={{ color: accent }}
        >
          {isPdf ? "Quiz PDF" : "Interactive quiz"}
        </p>

        <h3 className="mt-2 text-lg font-bold leading-snug text-[#0b1b33]">
          {item.title}
        </h3>

        {item.courseTitle && (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <BookOpen size={15} />
            <span className="line-clamp-1">{item.courseTitle}</span>
          </p>
        )}

        {item.lessonTitle && (
          <p className="mt-2 flex items-center gap-2 text-sm text-slate-500">
            <ClipboardList size={15} />
            <span className="line-clamp-1">{item.lessonTitle}</span>
          </p>
        )}

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <CalendarDays size={14} />
            Added: {formatDate(item.created_at)}
          </span>

          {isPdf && item.file_name && (
            <span className="flex min-w-0 items-center gap-1.5">
              <FileText size={14} />
              <span className="max-w-36 truncate">{item.file_name}</span>
            </span>
          )}

          {isPdf && item.file_size != null && (
            <span>{(Number(item.file_size) / (1024 * 1024)).toFixed(2)} MB</span>
          )}
        </div>
      </div>

      <div className="mt-5 border-t border-slate-100 pt-4">
        <button
          type="button"
          onClick={() => onOpen(item)}
          className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition hover:opacity-90"
          style={{
            backgroundColor: COLORS.navy,
            color: "#ffffff",
          }}
        >
          <span className="flex items-center gap-2">
            {isPdf ? <Download size={16} /> : <ArrowUpRight size={16} />}
            {isPdf ? "Open quiz PDF" : "Take quiz"}
          </span>
          <ArrowUpRight size={17} />
        </button>
      </div>
    </article>
  );
}

function EmptyState({ hasSearch, onReset }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-5 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-[#4776e6]">
        <Inbox size={30} />
      </div>

      <h3 className="mt-5 text-xl font-bold text-[#0b1b33]">
        {hasSearch ? "No matching results" : "No quizzes yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
        {hasSearch
          ? "Try another search term or change your filters."
          : "Online quizzes and quiz PDFs for your enrolled courses will appear here when your teachers add them."}
      </p>

      {hasSearch && (
        <button
          onClick={onReset}
          className="mt-5 rounded-xl bg-slate-100 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-200"
        >
          Clear filters
        </button>
      )}
    </div>
  );
}

export default function StudentQuizzesPage() {
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortOrder, setSortOrder] = useState("newest");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [openingId, setOpeningId] = useState(null);

  const loadItems = useCallback(
    async ({ refresh = false } = {}) => {
      if (refresh) setRefreshing(true);
      else setLoading(true);

      setError("");

      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) throw authError;

        if (!user) {
          router.replace("/sign-in");
          return;
        }

        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.role === "admin") {
          router.replace("/admin/dashboard");
          return;
        }

        if (profile?.role === "teacher") {
          router.replace("/teacher");
          return;
        }

        // Find the courses this student is enrolled in.
        const { data: enrollments, error: enrollmentError } = await supabase
          .from("enrollments")
          .select("course_id")
          .eq("student_id", user.id);

        if (enrollmentError) throw enrollmentError;

        const courseIds = [
          ...new Set((enrollments || []).map((row) => row.course_id).filter(Boolean)),
        ];

        if (courseIds.length === 0) {
          setItems([]);
          return;
        }

        // PDF quizzes are linked directly to courses, with an optional lesson.
        const { data: quizPdfs, error: pdfError } = await supabase
          .from("quiz_pdfs")
          .select(`
            id,
            course_id,
            lesson_id,
            title,
            original_file_name,
            file_path,
            file_size,
            created_at,
            courses ( title ),
            lessons ( title )
          `)
          .in("course_id", courseIds)
          .order("created_at", { ascending: false });

        if (pdfError) throw pdfError;

        // Online quizzes belong to lessons, and lessons belong to enrolled courses.
        const { data: lessons, error: lessonsError } = await supabase
          .from("lessons")
          .select("id, title, course_id, courses ( title )")
          .in("course_id", courseIds);

        if (lessonsError) throw lessonsError;

        const lessonIds = [...new Set((lessons || []).map((lesson) => lesson.id).filter(Boolean))];

        let onlineQuizzes = [];
        if (lessonIds.length > 0) {
          const { data: quizRows, error: onlineQuizError } = await supabase
            .from("quizzes")
            .select("id, lesson_id, title, created_at")
            .in("lesson_id", lessonIds)
            .order("created_at", { ascending: false });

          if (onlineQuizError) throw onlineQuizError;

          const lessonById = new Map(
            (lessons || []).map((lesson) => [lesson.id, lesson])
          );

          onlineQuizzes = (quizRows || []).map((quiz) => {
            const lesson = lessonById.get(quiz.lesson_id);
            const course = normalizeRelation(lesson?.courses);

            return {
              id: quiz.id,
              type: "online",
              title: quiz.title,
              course_id: lesson?.course_id || null,
              courseTitle: course?.title || "",
              lessonTitle: lesson?.title || "",
              created_at: quiz.created_at,
              file_path: null,
              file_name: "",
              file_size: null,
            };
          });
        }

        const pdfItems = (quizPdfs || []).map((quiz) => ({
          id: quiz.id,
          type: "pdf",
          title: quiz.title,
          course_id: quiz.course_id,
          courseTitle: normalizeRelation(quiz.courses)?.title || "",
          lessonTitle: normalizeRelation(quiz.lessons)?.title || "",
          created_at: quiz.created_at,
          file_path: quiz.file_path,
          file_name: quiz.original_file_name,
          file_size: quiz.file_size,
        }));

        setItems([...onlineQuizzes, ...pdfItems]);
      } catch (err) {
        console.error("Failed to load quizzes:", err);
        setError(err?.message || "We couldn't load your quizzes.");
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [router, supabase]
  );

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const filteredItems = useMemo(() => {
    const query = search.trim().toLowerCase();

    return items
      .filter((item) => {
        if (typeFilter === "Online quizzes" && item.type !== "online") return false;
        if (typeFilter === "Quiz PDFs" && item.type !== "pdf") return false;

        if (query) {
          const searchable = [
            item.title,
            item.courseTitle,
            item.lessonTitle,
            item.file_name,
          ]
            .join(" ")
            .toLowerCase();

          if (!searchable.includes(query)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const aDate = new Date(a.created_at || 0).getTime();
        const bDate = new Date(b.created_at || 0).getTime();
        return sortOrder === "newest" ? bDate - aDate : aDate - bDate;
      });
  }, [items, search, typeFilter, sortOrder]);

  const onlineQuizCount = items.filter((item) => item.type === "online").length;
  const pdfCount = items.filter((item) => item.type === "pdf").length;

  async function openItem(item) {
    setError("");
    setOpeningId(item.id);

    try {
      if (item.type === "pdf") {
        if (!item.file_path) {
          throw new Error("This quiz PDF does not have a file path.");
        }

        // The quiz-pdfs bucket is private, so use a short-lived signed URL.
        const { data, error: signedUrlError } = await supabase.storage
          .from("quiz-pdfs")
          .createSignedUrl(item.file_path, 60 * 5);

        if (signedUrlError) throw signedUrlError;

        window.open(data.signedUrl, "_blank", "noopener,noreferrer");
      } else {
        // This route should render the online quiz-taking page for this quiz ID.
        router.push(`/student/quizzes/${item.id}`);
      }
    } catch (err) {
      console.error("Unable to open quiz:", err);
      setError(err?.message || "Unable to open this quiz.");
    } finally {
      setOpeningId(null);
    }
  }

  return (
    <div className="min-h-screen bg-[#f6f8fc] text-slate-800">
      <main className="mx-auto max-w-[1500px] space-y-7 p-4 sm:p-7 lg:p-9">
        {/* Heading */}
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <BookOpen size={17} />
              Student learning
              <span className="text-slate-300">/</span>
              <span style={{ color: COLORS.blue }}>Quizzes</span>
            </div>

            <h1 className="text-3xl font-extrabold tracking-tight text-[#0b1b33] sm:text-4xl">
              Quizzes
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
              Take online quizzes, or open quiz PDFs shared by your teachers.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadItems({ refresh: true })}
            disabled={loading || refreshing}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
          >
            <RefreshCw size={16} className={refreshing ? "animate-spin" : ""} />
            Refresh
          </button>
        </section>

        {/* Summary */}
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <SummaryCard
            icon={ClipboardList}
            label="Online quizzes"
            value={onlineQuizCount}
            color={COLORS.blue}
          />

          <SummaryCard
            icon={FileText}
            label="Quiz PDFs"
            value={pdfCount}
            color={COLORS.orange}
          />

          <SummaryCard
            icon={BookOpen}
            label="Total quizzes"
            value={items.length}
            color={COLORS.teal}
          />
        </section>

        {error && (
          <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            <AlertCircle size={19} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Something went wrong</p>
              <p className="mt-1 break-words">{error}</p>
            </div>
          </div>
        )}

        {/* Search and filters */}
        <section className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-md">
              <Search
                size={19}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search quizzes, lessons, or courses..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#4776e6] focus:bg-white focus:ring-4 focus:ring-blue-100"
              />
            </div>

            <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
              <Filter size={17} />
              Filter quizzes or sort by date
            </div>
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
            <div className="flex flex-wrap gap-2">
              {TYPE_FILTERS.map((filter) => {
                const active = typeFilter === filter;

                return (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setTypeFilter(filter)}
                    className="rounded-xl px-4 py-2.5 text-sm font-semibold transition"
                    style={{
                      backgroundColor: active ? COLORS.navy : "#f1f5f9",
                      color: active ? "#fff" : "#64748b",
                    }}
                  >
                    {filter}
                  </button>
                );
              })}
            </div>

            <select
              value={sortOrder}
              onChange={(event) => setSortOrder(event.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#4776e6] focus:ring-4 focus:ring-blue-100"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* Results */}
        <section>
          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-[#0b1b33]">
                Your quizzes
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Loading your quizzes..."
                  : `${filteredItems.length} ${
                      filteredItems.length === 1 ? "quiz" : "quizzes"
                    } found`}
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white">
              <LoaderCircle
                size={34}
                className="animate-spin text-[#4776e6]"
              />
              <p className="mt-4 text-sm font-medium text-slate-500">
                Loading quizzes...
              </p>
            </div>
          ) : filteredItems.length === 0 && !error ? (
            <EmptyState
              hasSearch={Boolean(search || typeFilter !== "All")}
              onReset={() => {
                setSearch("");
                setTypeFilter("All");
                setSortOrder("newest");
              }}
            />
          ) : (
            !error && (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 2xl:grid-cols-3">
                {filteredItems.map((item) => (
                  <div key={`${item.type}-${item.id}`} className="relative">
                    <ResourceCard item={item} onOpen={openItem} />

                    {openingId === item.id && (
                      <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/80">
                        <div className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-slate-700 shadow">
                          <LoaderCircle size={18} className="animate-spin" />
                          Opening quiz...
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )
          )}
        </section>
      </main>
    </div>
  );
}
