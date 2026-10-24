import React from 'react'

const SummaryCard = ({ icon: Icon, label, value, accent }) => {

  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <div
        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
        style={{
          color: accent,
          backgroundColor: `${accent}14`,
        }}
      >
        <Icon size={23} />
      </div>

      <div className="min-w-0">
        <p className="text-sm text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-extrabold text-[#0b1b33]">
          {value}
        </p>
      </div>
    </div>
  );
}

export default SummaryCard