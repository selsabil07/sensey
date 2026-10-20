
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";


export default function QuickAction({ icon: Icon, title, description, href }) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border border-slate-100 p-3.5 transition hover:border-orange-200 hover:bg-orange-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#fff0e9] text-[#fe5933]">
        <Icon size={20} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="mt-1 text-xs text-slate-500">{description}</p>
      </div>

      <ArrowUpRight size={16} className="shrink-0 text-slate-400" />
    </Link>
  );
}