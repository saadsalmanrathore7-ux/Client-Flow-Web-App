import { redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProjectStatus } from "@/generated/prisma/enums";
import { Project } from "@/generated/prisma/client";
import { Prisma } from "@prisma/client";
import { NewProjectModal } from "@/components/projects/NewProjectModal";

type SearchParams = {
  q?: string;
  status?: "all" | keyof typeof ProjectStatus;
  sort?: "deadline" | "newest" | "oldest";
};

const statusClasses: Record<keyof typeof ProjectStatus, string> = {
  PENDING:
    "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100 border border-amber-100",
  IN_PROGRESS:
    "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 border border-blue-100",
  COMPLETED:
    "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100 border border-emerald-100",
};

const statusLabel: Record<keyof typeof ProjectStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
};

const PROJECTS_PRIMARY_COLOR = "#330fe6";

function formatCurrency(value: string) {
  const amount = Number(value);
  if (Number.isNaN(amount)) return value;

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return value;
  }
}

function formatDate(value: Date | string | null) {
  if (!value) return "No deadline";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  try {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  } catch {
    return "Invalid date";
  }
}

async function getProjects(userId: string, role: string, filters: SearchParams) {
  const where: Prisma.ProjectWhereInput = {};

  if (role === "CLIENT") {
    where.clientId = userId;
  }

  if (filters.status && filters.status !== "all") {
    where.status = filters.status;
  }

  if (filters.q && filters.q.trim()) {
    where.title = {
      contains: filters.q.trim(),
      mode: "insensitive",
    };
  }

  const orderBy =
    filters.sort === "deadline"
      ? { deadline: "asc" as const }
      : filters.sort === "oldest"
        ? { createdAt: "asc" as const }
        : { createdAt: "desc" as const };

  const projects = await prisma.project.findMany({
    where,
    orderBy,
  });

  return projects;
}

type ProjectsPageProps = {
  searchParams: Promise<SearchParams>;
};

export default async function ProjectsPage({ searchParams }: ProjectsPageProps) {
  const resolvedSearchParams = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">
            Access restricted
          </h1>
          <p className="mt-1 text-sm text-amber-800">
            This page is only available to client and admin accounts.
          </p>
        </div>
      </main>
    );
  }

  const projects = await getProjects(user.id!, user.role as string, {
    q: resolvedSearchParams.q,
    status: (resolvedSearchParams.status as SearchParams["status"]) ?? "all",
    sort: resolvedSearchParams.sort ?? "newest",
  });

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Projects
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            View and manage all of your projects, deadlines, and files.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 md:inline-flex md:items-center md:justify-center"
          >
            Back to dashboard
          </Link>
          {user.role === "CLIENT" ? (
            <NewProjectModal triggerLabel="Create new project" />
          ) : null}
        </div>
      </header>

      <section className="animate-fade-up delay-100 mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <form className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <label
              htmlFor="search"
              className="sr-only"
            >
              Search projects
            </label>
            <input
              id="search"
              name="q"
              type="text"
              defaultValue={resolvedSearchParams.q ?? ""}
              placeholder="Search by title..."
              className="w-full rounded-full border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:bg-white focus:ring-1 focus:ring-[#330fe6]"
            />
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <label
                htmlFor="status"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Status
              </label>
              <select
                id="status"
                name="status"
                defaultValue={(resolvedSearchParams.status as string) ?? "all"}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-[#330fe6] focus:outline-none focus:ring-1 focus:ring-[#330fe6]"
              >
                <option value="all">All</option>
                <option value={ProjectStatus.PENDING}>Pending</option>
                <option value={ProjectStatus.IN_PROGRESS}>In Progress</option>
                <option value={ProjectStatus.COMPLETED}>Completed</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label
                htmlFor="sort"
                className="text-xs font-medium uppercase tracking-wide text-slate-500"
              >
                Sort by
              </label>
              <select
                id="sort"
                name="sort"
                defaultValue={resolvedSearchParams.sort ?? "newest"}
                className="rounded-full border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 shadow-sm focus:border-[#330fe6] focus:outline-none focus:ring-1 focus:ring-[#330fe6]"
              >
                <option value="deadline">Deadline</option>
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Apply
            </button>
          </div>
        </form>
      </section>

      <section className="animate-fade-up delay-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr className="text-xs uppercase tracking-wide text-slate-500">
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Budget</th>
              <th className="px-4 py-3 text-left">Deadline</th>
              <th className="px-4 py-3 text-left">Created</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {projects.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-sm text-slate-500"
                >
                  {user.role === "CLIENT"
                    ? "You don't have any projects yet. Create your first project to get started."
                    : "No projects found."}
                </td>
              </tr>
            ) : (
              (projects as Project[]).map((project, i) => (
                <tr
                  key={project.id}
                  className="animate-slide-left align-middle"
                  style={{ animationDelay: `${300 + i * 50}ms` }}
                >
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900">
                    {project.title}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusClasses[project.status as keyof typeof ProjectStatus]}`}
                    >
                      {
                        statusLabel[
                          project.status as keyof typeof ProjectStatus
                        ]
                      }
                    </span>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-700">
                    {formatCurrency(project.budget.toString())}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                    {formatDate(project.deadline as Date | null)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500">
                    {formatDate(project.createdAt)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right">
                    <Link
                      href={`/dashboard/projects/${project.id}`}
                      className="text-xs font-medium text-[#330fe6] hover:text-[#2511aa]"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}

