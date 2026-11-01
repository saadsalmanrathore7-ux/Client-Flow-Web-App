import React from "react";
import { Folder, CheckCircle2, CreditCard, Bell } from "lucide-react";

export type StatsGridProps = {
  stats: {
    label: string;
    value: number | string;
    description?: string;
  }[];
};

/* Map label keywords → icon + accent colour */
function getCardMeta(label: string) {
  const l = label.toLowerCase();
  if (l.includes("active"))
    return { Icon: Folder,       accent: "bg-violet-50 text-violet-600", ring: "ring-violet-100" };
  if (l.includes("completed"))
    return { Icon: CheckCircle2, accent: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-100" };
  if (l.includes("subscription") || l.includes("plan"))
    return { Icon: CreditCard,   accent: "bg-sky-50 text-sky-600",        ring: "ring-sky-100" };
  return   { Icon: Bell,         accent: "bg-amber-50 text-amber-600",     ring: "ring-amber-100" };
}

export const StatsGrid: React.FC<StatsGridProps> = ({ stats }) => {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {stats.map((stat, i) => {
        const { Icon, accent, ring } = getCardMeta(stat.label);
        return (
          <div
            key={stat.label}
            className="animate-scale-up group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-stone-100 bg-white p-5 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            {/* top row */}
            <div className="flex items-start justify-between gap-3">
              <div
                className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${accent} ${ring}`}
              >
                <Icon className="h-5 w-5" />
              </div>
              {/* subtle bg shape */}
              <div className="absolute -right-4 -top-4 h-20 w-20 rounded-full bg-stone-50 opacity-60 transition-transform duration-300 group-hover:scale-110" />
            </div>

            {/* value */}
            <div className="mt-4">
              <p className="text-3xl font-bold tracking-tight text-stone-900">
                {stat.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wide text-stone-400">
                {stat.label}
              </p>
            </div>

            {/* description */}
            {stat.description && (
              <p className="mt-3 border-t border-stone-50 pt-3 text-xs leading-relaxed text-stone-500">
                {stat.description}
              </p>
            )}
          </div>
        );
      })}
    </section>
  );
};
