import React from 'react'
import Link from 'next/link'
import { ArrowRight, ClipboardList, Bot } from 'lucide-react'

const QuickActions = () => {
  return (
    <div>
    <section
        aria-label="Quick actions"
        className="grid grid-cols-1 gap-4 md:grid-cols-2"
      >
        <Link
          href="/student/ai-assistant"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 outline-none transition hover:border-[#4776e6]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#4776e6]/60 sm:p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#4776e6]/10 text-[#4776e6]">
            <Bot size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#0b1b33]">Get help with a lesson</h3>
            <p className="mt-1 text-sm text-slate-500">
              Ask the AI assistant to explain anything you're stuck on.
            </p>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#4776e6]"
          />
        </Link>

        <Link
          href="/student/quizzes"
          className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 outline-none transition hover:border-[#20b8a6]/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-[#20b8a6]/60 sm:p-6"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#20b8a6]/10 text-[#20b8a6]">
            <ClipboardList size={25} />
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-[#0b1b33]">Practice and review</h3>
            <p className="mt-1 text-sm text-slate-500">
              Take available quizzes and review your results.
            </p>
          </div>

          <ArrowRight
            size={19}
            className="shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-[#20b8a6]"
          />
        </Link>
      </section>
    </div>
  )
}

export default QuickActions