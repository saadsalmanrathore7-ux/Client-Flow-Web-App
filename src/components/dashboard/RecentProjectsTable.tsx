import React from "react";
import Link from "next/link";
import { ArrowRight, FolderOpen } from "lucide-react";
import { ProjectStatus } from "@/generated/prisma/enums";

type RecentProject = {
  id: string;
  title: string;
  status: ProjectStatus;
  budget: string;
  deadline: Date | null;
};

type RecentProjectsTableProps = {
  projects: RecentProject[];
};

const STATUS_CONFIG: Record<ProjectStatus, { label: string; classes: string; dot: string }> = {
  PENDING: {
    label: "Pending",
    classes: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    dot: "bg-amber-500",
  },
  IN_PROGRESS: {
    label: "In Progress",
    classes: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
    dot: "bg-blue-500",
  },
  COMPLETED: {
    label: "Completed",
    classes: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
};

const fmt = (v: string) => {
  const n = Number(v);
  if (Number.isNaN(n)) return v;
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
  } catch { return v; }
};

const fmtDate = (v: Date | null) => {
  if (!v) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric", year: "numeric" }).format(v);
  } catch { return "—"; }
};

export const RecentProjectsTable: React.FC<RecentProjectsTableProps> = ({ projects }) => {
  return (
    <section className="flex flex-col rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
      {/* header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-stone-400" />
          <h2 className="text-sm font-semibold text-stone-900">Recent Projects</h2>
        </div>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-1 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors"
        >
          View all <ArrowRight className="h-3 w-3" />
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 px-6 py-12 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-stone-50">
            <FolderOpen className="h-6 w-6 text-stone-300" />
          </div>
          <div>
            <p className="text-sm font-medium text-stone-600">No projects yet</p>
            <p className="mt-0.5 text-xs text-stone-400">Create your first project to get started.</p>
          </div>
          <Link
            href="/dashboard/projects"
            className="mt-1 rounded-full bg-stone-900 px-4 py-1.5 text-xs font-medium text-white hover:bg-stone-700 transition-colors"
          >
            Create project
          </Link>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-stone-50 bg-stone-50/60">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">Project</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">Budget</th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-stone-400">Deadline</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {projects.map((project, i) => {
                const cfg = STATUS_CONFIG[project.status];
                return (
                  <tr
                    key={project.id}
                    className="animate-slide-left group transition-colors hover:bg-stone-50/70"
                    style={{ animationDelay: `${350 + i * 55}ms` }}
                  >
                    <td className="px-5 py-3.5">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="font-medium text-stone-900 hover:text-violet-700 transition-colors line-clamp-1"
                      >
                        {project.title}
                      </Link>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.classes}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-stone-700 font-medium">
                      {fmt(project.budget)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-stone-500">
                      {fmtDate(project.deadline)}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href={`/dashboard/projects/${project.id}`}
                        className="inline-flex items-center gap-1 rounded-lg bg-stone-100 px-2.5 py-1 text-xs font-medium text-stone-600 opacity-0 transition-all group-hover:opacity-100 hover:bg-stone-200"
                      >
                        Open <ArrowRight className="h-3 w-3" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
};
