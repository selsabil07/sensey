
"use client";

import {
  X,
  FileText,
  Save,
  LoaderCircle,
} from "lucide-react";

const Lessoncreate = ({
  saveLesson,
  editingLessonId,
  setEditingLessonId,
  lessonForm,
  setLessonForm,
  emptyLesson,
  inputClass,
  savingLesson,
  setShowLessonForm,
  lessonPdf,
  setLessonPdf,
  existingPdfPath,
}) => {
  function closeForm() {
    setShowLessonForm(false);
    setEditingLessonId(null);
    setLessonForm(emptyLesson);
    setLessonPdf(null);
  }

  function handleFileChange(event) {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (
      selectedFile.type !== "application/pdf" &&
      !selectedFile.name.toLowerCase().endsWith(".pdf")
    ) {
      alert("Please select a valid PDF file.");
      event.target.value = "";
      return;
    }

    if (selectedFile.size > 20 * 1024 * 1024) {
      alert("The PDF must be smaller than 20 MB.");
      event.target.value = "";
      return;
    }

    setLessonPdf(selectedFile);
  }

  return (
    <form
      onSubmit={saveLesson}
      className="mt-6 space-y-5 rounded-2xl border border-[#fe5933]/20 bg-[#fffaf8] p-5"
    >
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-bold">
          {editingLessonId ? "Edit lesson" : "New lesson"}
        </h3>

        <button
          type="button"
          onClick={closeForm}
          aria-label="Close lesson form"
          className="rounded-lg p-2 text-slate-500 hover:bg-white"
        >
          <X size={18} />
        </button>
      </div>

      {/* Lesson title */}
      <div>
        <label htmlFor="lesson-title" className="text-sm font-semibold">
          Lesson title *
        </label>

        <input
          id="lesson-title"
          required
          maxLength={200}
          value={lessonForm.title}
          onChange={(event) =>
            setLessonForm({
              ...lessonForm,
              title: event.target.value,
            })
          }
          className={inputClass}
          placeholder="e.g. Introduction to algebra"
        />
      </div>

      {/* Description */}
      <div>
        <label
          htmlFor="lesson-description"
          className="text-sm font-semibold"
        >
          Short description
        </label>

        <textarea
          id="lesson-description"
          rows={2}
          value={lessonForm.description}
          onChange={(event) =>
            setLessonForm({
              ...lessonForm,
              description: event.target.value,
            })
          }
          className={`${inputClass} resize-y`}
          placeholder="Briefly describe this lesson"
        />
      </div>

      {/* PDF upload */}
      <div>
        <label htmlFor="lesson-pdf" className="text-sm font-semibold">
          Lesson PDF {!editingLessonId && "*"}
        </label>

        <div className="mt-2 rounded-xl border-2 border-dashed border-slate-300 bg-white p-5">
          <input
            id="lesson-pdf"
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-lg file:border-0 file:bg-[#fe5933]/10 file:px-4 file:py-2 file:font-semibold file:text-[#fe5933] hover:file:bg-[#fe5933]/20"
          />

          {lessonPdf ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-700">
              <FileText size={18} />

              <span className="break-all font-medium">
                {lessonPdf.name}
              </span>

              <span className="shrink-0 text-slate-400">
                ({(lessonPdf.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
          ) : existingPdfPath ? (
            <div className="mt-3 flex items-center gap-2 text-sm text-emerald-700">
              <FileText size={18} />
              Existing PDF attached. Select another file to replace it.
            </div>
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              PDF only · Maximum size: 20 MB
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={closeForm}
          disabled={savingLesson}
          className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold hover:bg-slate-50 disabled:opacity-60"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={
            savingLesson ||
            (!editingLessonId && !lessonPdf && !existingPdfPath)
          }
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e94b27] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {savingLesson ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {savingLesson
            ? "Saving..."
            : editingLessonId
              ? "Update lesson"
              : "Save lesson"}
        </button>
      </div>
    </form>
  );
};

export default Lessoncreate;
