
"use client";

import { useState } from "react";
import {
  BookOpen,
  Download,
  FileText,
  LoaderCircle,
} from "lucide-react";

export function ClipboardListIcon() {
  return (
    <BookOpen
      className="shrink-0 text-[#fe5933]"
      size={21}
    />
  );
}

export function LessonPdfButton({
  supabase,
  pdfPath,
  lessonTitle,
}) {
  const [downloading, setDownloading] = useState(false);
  const [opening, setOpening] = useState(false);

  const fileName = `${(lessonTitle || "lesson")
    .replace(/[\\/:*?"<>|]/g, "-")}.pdf`;

  async function downloadPdf() {
    if (!pdfPath || downloading || opening) return;

    setDownloading(true);

    try {
      const { data, error } = await supabase.storage
        .from("lesson-pdfs")
        .createSignedUrl(pdfPath, 300, {
          download: fileName,
        });

      if (error) throw error;

      window.location.assign(data.signedUrl);
    } catch (error) {
      console.error("PDF download failed:", error);
      alert("Unable to download this lesson PDF. Please try again.");
    } finally {
      setDownloading(false);
    }
  }

  async function openPdf() {
    if (!pdfPath || opening || downloading) return;

    setOpening(true);

    try {
      const { data, error } = await supabase.storage
        .from("lesson-pdfs")
        .createSignedUrl(pdfPath, 300);

      if (error) throw error;

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Lesson PDF error:", error);
      alert("Unable to open this lesson PDF.");
    } finally {
      setOpening(false);
    }
  }

  if (!pdfPath) return null;

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      {/* View PDF */}
      <button
        type="button"
        onClick={openPdf}
        disabled={opening || downloading}
        className="inline-flex items-center gap-2 rounded-lg bg-[#0b1b33] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172d4d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {opening ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <BookOpen size={16} />
        )}

        {opening ? "Opening..." : "View PDF"}
      </button>

      {/* Download PDF */}
      <button
        type="button"
        onClick={downloadPdf}
        disabled={downloading || opening}
        className="inline-flex items-center gap-2 rounded-lg bg-[#fe5933] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#e94b28] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {downloading ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}

        {downloading ? "Preparing..." : "Download PDF"}
      </button>
    </div>
  );
}

export function QuizPdfButton({ supabase, pdf }) {
  const [opening, setOpening] = useState(false);

  async function openPdf() {
    if (!pdf?.file_path || opening) return;

    setOpening(true);

    try {
      const { data, error } = await supabase.storage
        .from("quiz-pdfs")
        .createSignedUrl(pdf.file_path, 300);

      if (error) throw error;

      window.open(
        data.signedUrl,
        "_blank",
        "noopener,noreferrer"
      );
    } catch (error) {
      console.error("Quiz PDF error:", error);
      alert("Unable to open this quiz PDF.");
    } finally {
      setOpening(false);
    }
  }

  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <FileText
        className="shrink-0 text-[#fe5933]"
        size={22}
      />

      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-[#0b1b33]">
          {pdf.title}
        </p>

        <p className="text-xs text-slate-500">
          {pdf.original_file_name}
        </p>
      </div>

      <button
        type="button"
        onClick={openPdf}
        disabled={opening}
        className="inline-flex items-center gap-2 rounded-lg bg-[#fe5933] px-3 py-2 text-xs font-bold text-white transition hover:bg-[#e94b28] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {opening && (
          <LoaderCircle size={14} className="animate-spin" />
        )}

        {opening ? "Opening..." : "Open PDF"}
      </button>
    </div>
  );
}
