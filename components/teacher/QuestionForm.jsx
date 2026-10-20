
import React from "react";
import { Save, X, LoaderCircle } from "lucide-react";
import { inputClass } from "@/lib/utils";

const QuestionForm = ({
  saveQuestion,
  editingQuestionId,
  setShowQuestionForm,
  setEditingQuestionId,
  setQuestionForm,
  questionForm,
  updateOption,
  savingQuestion,
  emptyQuestion,
}) => {
  return (
    <form
      onSubmit={saveQuestion}
      className="space-y-5 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">
          {editingQuestionId ? "Edit question" : "New question"}
        </h2>

        <button
          type="button"
          onClick={() => {
            setShowQuestionForm(false);
            setEditingQuestionId(null);
            setQuestionForm({ ...emptyQuestion, options: [...emptyQuestion.options] });
          }}
          aria-label="Close question form"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
        >
          <X size={18} />
        </button>
      </div>

      <div>
        <label htmlFor="question-text" className="text-sm font-semibold">
          Question *
        </label>

        <textarea
          id="question-text"
          required
          rows={3}
          value={questionForm.question_text}
          onChange={(event) =>
            setQuestionForm({
              ...questionForm,
              question_text: event.target.value,
            })
          }
          className={`${inputClass} resize-y`}
          placeholder="Enter your question..."
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-semibold">Answer options *</p>

        {questionForm.options.map((option, index) => (
          <div key={index}>
            <label
              htmlFor={`option-${index}`}
              className="text-xs font-medium text-slate-500"
            >
              Option {String.fromCharCode(65 + index)}
            </label>

            <div className="flex items-center gap-3">
              <input
                id={`option-${index}`}
                required
                value={option}
                onChange={(event) =>
                  updateOption(index, event.target.value)
                }
                className={inputClass}
                placeholder={`Enter option ${String.fromCharCode(65 + index)}`}
              />

              <label className="flex shrink-0 items-center gap-2 text-xs font-medium text-slate-600">
                <input
                  type="radio"
                  name="correct-answer"
                  checked={
                    questionForm.correct_answer === option &&
                    option.trim() !== ""
                  }
                  disabled={!option.trim()}
                  onChange={() =>
                    setQuestionForm({
                      ...questionForm,
                      correct_answer: option,
                    })
                  }
                  className="accent-[#fe5933]"
                  
                />
                Correct
              </label>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={() => setShowQuestionForm(false)}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={savingQuestion}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#fe5933] px-5 py-3 text-sm font-semibold text-white hover:bg-[#e94b27] disabled:opacity-50"
        >
          {savingQuestion ? (
            <LoaderCircle size={17} className="animate-spin" />
          ) : (
            <Save size={17} />
          )}

          {editingQuestionId ? "Save changes" : "Save question"}
        </button>
      </div>
    </form>
  );
};

export default QuestionForm;
