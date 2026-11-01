import React from "react";
import Link from "next/link";
import { CalendarClock, AlertTriangle, Clock, CheckCircle2 } from "lucide-react";
import { ProjectStatus } from "@/generated/prisma/enums";

type UpcomingProject = {
  id: string;
  title: string;
  deadline: Date | null;
  status: ProjectStatus;
};

type UpcomingDeadlinesProps = {
  projects: UpcomingProject[];
};

function getDaysRemaining(deadline: Date | null): number | null {
  if (!deadline) return null;
  const diff = deadline.getTime() - Date.now();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

function getUrgency(days: number | null) {
  if (days === null) return {
    label: "No date",
    bar: "bg-stone-200",
    badge: "bg-stone-100 text-stone-500",
    Icon: Clock,
    iconClass: "text-stone-400",
  };
  if (days < 0) return {
    label: "Overdue",
    bar: "bg-rose-500",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Icon: AlertTriangle,
    iconClass: "text-rose-500",
  };
  if (days <= 3) return {
    label: `${days}d left`,
    bar: "bg-rose-400",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    Icon: AlertTriangle,
    iconClass: "text-rose-400",
  };
  if (days <= 7) return {
    label: `${days}d left`,
    bar: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    Icon: CalendarClock,
    iconClass: "text-amber-400",
  };
  return {
    label: `${days}d left`,
    bar: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    Icon: CheckCircle2,
    iconClass: "text-emerald-400",
  };
}

const fmtDate = (v: Date | null) => {
  if (!v) return "No date";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(v);
  } catch { return "—"; }
};

export const UpcomingDeadlines: React.FC<UpcomingDeadlinesProps> = ({ projects }) => {
  return (
    <section className="flex flex-col rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex items-center gap-2 px-5 py-4 border-b border-stone-100">
        <CalendarClock className="h-4 w-4 text-stone-400" />
        <h2 className="text-sm font-semibold text-stone-900">Upcoming Deadlines</h2>
      </div>

      <div className="divide-y divide-stone-50">
        {projects.length === 0 ? (
          <div className="flex flex-col items-center gap-2 px-5 py-8 text-center">
            <CheckCircle2 className="h-8 w-8 text-emerald-300" />
            <p className="text-sm font-medium text-stone-600">All caught up!</p>
            <p className="text-xs text-stone-400">No upcoming deadlines right now.</p>
          </div>
        ) : (
          projects.map((project, i) => {
            const days = getDaysRemaining(project.deadline);
            const u = getUrgency(days);
            const { Icon } = u;
            /* bar width: overdue=100%, else clamp days 0-30 → 100-0% */
            const pct = days === null ? 0 : days < 0 ? 100 : Math.max(0, 100 - Math.min(days, 30) / 30 * 100);

            return (
              <Link
                key={project.id}
                href={`/dashboard/projects/${project.id}`}
                className="group flex items-start gap-3 px-5 py-3.5 transition-colors hover:bg-stone-50"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {/* urgency icon */}
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-stone-50 ring-1 ring-stone-100">
                  <Icon className={`h-4 w-4 ${u.iconClass}`} />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-stone-900 truncate group-hover:text-violet-700 transition-colors">
                    {project.title}
                  </p>
                  {/* urgency bar */}
                  <div className="mt-1.5 h-1 w-full rounded-full bg-stone-100">
                    <div
                      className={`h-1 rounded-full transition-all ${u.bar}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-stone-400">{fmtDate(project.deadline)}</p>
                </div>

                {/* badge */}
                <span className={`mt-0.5 shrink-0 rounded-full px-2 py-0.5 text-xs font-medium ${u.badge}`}>
                  {u.label}
                </span>
              </Link>
            );
          })
        )}
      </div>
    </section>
  );
};
