


function StatCard({ title, value, subtitle, icon: Icon, color, loading }) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${color}1a`, color }}
      >
        <Icon size={23} />
      </div>

      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-500">{title}</p>
        {loading ? (
          <div className="mt-2 h-8 w-12 animate-pulse rounded-lg bg-slate-100" />
        ) : (
          <p className="text-3xl font-bold leading-tight tracking-tight text-[#0b1b33]">
            {value}
          </p>
        )}
        <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default StatCard