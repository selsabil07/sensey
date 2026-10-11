"uuse client"
import React from 'react'
import { useState } from 'react'

const Navbar = ({onMenuClick}) => {
    
  return (
    <div>
        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between rounded-2xl border border-slate-200 shadow-sm  p-4 backdrop-blur-lg bg-transparent sm:px-8">
          <div className="flex items-center gap-3">
            
              <button
                type="button"
                onClick={onMenuClick}
                aria-label="Open navigation"
                className="rounded-lg border border-slate-200 p-2 text-slate-700 hover:bg-slate-50 lg:hidden"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  className="h-5 w-5"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>


            <div>
              <p className="text-xs text-slate-400">
                Workspace / Overview
              </p>
              <h1 className="text-lg font-bold text-[#0b1b33]">
                Dashboard
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold text-[#0b1b33]">
                Administrator
              </p>
              <p className="text-xs text-slate-400">
                Platform management
              </p>
            </div>

            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#0b1b33] text-sm font-bold text-white ring-4 ring-slate-100">
              A
            </div>
          </div>
        </header>
    </div>
  )
}

export default Navbar