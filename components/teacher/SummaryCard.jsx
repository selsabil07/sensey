function SummaryCard({ label, value, icon: Icon, color, background }) {
return (
<article className="group rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md sm:p-6">
<div className="flex items-center justify-between gap-4">
<div>
<p className="text-sm font-medium text-slate-500">{label}</p>
<p className="mt-3 text-3xl font-bold tracking-tight text-[#0b1b33]">
{value}
</p>
</div>

    <div
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl"
      style={{ backgroundColor: background, color }}
    >
      <Icon size={23} />
    </div>
  </div>

  <div className="mt-5 h-1 overflow-hidden rounded-full bg-slate-100">
    <div
      className="h-full w-1/3 rounded-full"
      style={{ backgroundColor: color }}
    />
  </div>
</article>

);
}

export default SummaryCard;