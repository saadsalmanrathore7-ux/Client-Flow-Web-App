import { notFound, redirect } from "next/navigation";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProjectStatus } from "@/generated/prisma/enums";
import { ProjectFileUpload } from "@/components/projects/ProjectFileUpload";
import { ProjectStatusControl } from "@/components/projects/ProjectStatusControl";
import { AdminNotesForm } from "@/components/projects/AdminNotesForm";

type ProjectPageProps = {
  params: Promise<{ id: string }>;
};

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
  if (!value) return "No date";
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

const statusSteps: {
  key: keyof typeof ProjectStatus;
  label: string;
  description: string;
}[] = [
  {
    key: "PENDING",
    label: "Pending",
    description: "Project is being reviewed and scoped.",
  },
  {
    key: "IN_PROGRESS",
    label: "In progress",
    description: "Our team is actively working on this project.",
  },
  {
    key: "COMPLETED",
    label: "Completed",
    description: "The project has been delivered and closed.",
  },
];

export default async function ProjectPage({ params }: ProjectPageProps) {
  const { id } = await params;
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      files: {
        orderBy: { createdAt: "desc" },
      },
      activityLogs: {
        include: {
          user: {
            select: { id: true, name: true, email: true },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      client: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  if (!project) {
    notFound();
  }

  if (user.role === "CLIENT" && project.clientId !== user.id) {
    notFound();
  }

  const isAdmin = user.role === "ADMIN";
  const canUploadFiles = isAdmin || project.clientId === user.id;

  const adminNotes = project.activityLogs.filter(
    (log) => log.action === "ADMIN_NOTE",
  );

  const otherActivity = project.activityLogs.filter(
    (log) => log.action !== "ADMIN_NOTE",
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
              {project.title}
            </h1>
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                project.status === ProjectStatus.PENDING
                  ? "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100 border border-amber-100"
                  : project.status === ProjectStatus.IN_PROGRESS
                    ? "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100 border border-blue-100"
                    : "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-100 border border-emerald-100"
              }`}
            >
              {project.status === ProjectStatus.PENDING
                ? "Pending"
                : project.status === ProjectStatus.IN_PROGRESS
                  ? "In Progress"
                  : "Completed"}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Created on {formatDate(project.createdAt)} • Client:{" "}
            {project.client.name} ({project.client.email})
          </p>
        </div>
        <Link
          href="/dashboard/projects"
          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          Back to projects
        </Link>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        <section className="space-y-6">
          <div className="animate-scale-up delay-100 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Overview
            </h2>
            <dl className="mt-4 grid gap-4 text-sm md:grid-cols-3">
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Budget
                </dt>
                <dd className="mt-1 text-sm font-semibold text-slate-900">
                  {formatCurrency(project.budget.toString())}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Deadline
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {formatDate(project.deadline as Date | null)}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </dt>
                <dd className="mt-1 text-sm text-slate-900">
                  {project.status === ProjectStatus.PENDING
                    ? "Pending"
                    : project.status === ProjectStatus.IN_PROGRESS
                      ? "In Progress"
                      : "Completed"}
                </dd>
              </div>
            </dl>
            <div className="mt-4 border-t border-slate-100 pt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Description
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
                {project.description}
              </p>
            </div>
          </div>

          <div className="animate-scale-up delay-200 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Status timeline
              </h2>
            </div>
            <ol className="mt-4 space-y-4">
              {statusSteps.map((step, index) => {
                const isActive = project.status === step.key;
                const isCompletedIndex =
                  Object.values(ProjectStatus).indexOf(project.status) >
                  Object.values(ProjectStatus).indexOf(step.key);

                const circleClassName = isActive
                  ? "border-[#330fe6] text-white bg-[#330fe6]"
                  : isCompletedIndex
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : "border-slate-300 bg-white text-slate-500";

                const lineClassName =
                  index === statusSteps.length - 1
                    ? "hidden"
                    : isCompletedIndex
                      ? "bg-emerald-500"
                      : "bg-slate-200";

                return (
                  <li key={step.key} className="relative flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`flex h-6 w-6 items-center justify-center rounded-full border text-xs font-semibold ${circleClassName}`}
                      >
                        {index + 1}
                      </div>
                      <div className={`mt-1 h-10 w-px ${lineClassName}`} />
                    </div>
                    <div className="pt-0.5">
                      <p className="text-sm font-medium text-slate-900">
                        {step.label}
                      </p>
                      <p className="text-xs text-slate-500">
                        {step.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
            <ProjectStatusControl
              projectId={project.id}
              currentStatus={project.status as keyof typeof ProjectStatus}
              canEdit={isAdmin}
            />
          </div>

          <div className="animate-scale-up delay-300 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Activity
            </h2>
            <div className="mt-4 space-y-3 text-sm">
              {otherActivity.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No activity has been recorded for this project yet.
                </p>
              ) : (
                otherActivity.map((log) => {
                  const display =
                    log.action === "PROJECT_STATUS_UPDATED"
                      ? "Status updated"
                      : log.action === "FILE_UPLOADED"
                        ? "File uploaded"
                        : log.action === "PROJECT_CREATED"
                          ? "Project created"
                          : log.action === "MESSAGE_SENT"
                            ? "Message sent"
                            : log.action;

                  return (
                    <div
                      key={log.id}
                      className="flex items-start justify-between gap-4 rounded-lg border border-slate-100 bg-slate-50 p-3"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {display}
                        </p>
                        {log.meta && typeof log.meta === "object" ? (
                          <p className="mt-1 text-xs text-slate-500">
                            {log.action === "PROJECT_STATUS_UPDATED" &&
                            "fromStatus" in log.meta &&
                            "toStatus" in log.meta
                              ? `Status changed from ${(log.meta as any).fromStatus} to ${(log.meta as any).toStatus}`
                              : log.action === "FILE_UPLOADED" &&
                                  "fileName" in log.meta
                                ? `File ${(log.meta as any).fileName} uploaded`
                                : null}
                          </p>
                        ) : null}
                        {log.user ? (
                          <p className="mt-1 text-xs text-slate-400">
                            By {log.user.name ?? log.user.email}
                          </p>
                        ) : null}
                      </div>
                      <time className="shrink-0 text-[11px] text-slate-400">
                        {formatDate(log.createdAt)}
                      </time>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <section className="animate-slide-right delay-200 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
                Files
              </h2>
              <span className="text-xs text-slate-400">
                {project.files.length} file
                {project.files.length === 1 ? "" : "s"}
              </span>
            </div>
            {project.files.length === 0 ? (
              <p className="text-sm text-slate-500">
                No files have been uploaded for this project yet.
              </p>
            ) : (
              <ul className="space-y-2 text-sm">
                {project.files.map((file) => (
                  <li
                    key={file.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {file.name}
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {file.size
                          ? `${Math.round(file.size / 1024)} KB`
                          : "Unknown size"}{" "}
                        • Uploaded {formatDate(file.createdAt)}
                      </p>
                    </div>
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-medium text-[#330fe6] hover:text-[#2511aa]"
                    >
                      Download
                    </a>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4">
              <ProjectFileUpload
                projectId={project.id}
                canUpload={canUploadFiles}
              />
            </div>
          </section>

          <section className="animate-slide-right delay-400 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
              Admin notes
            </h2>
            <div className="mt-3 space-y-3">
              {adminNotes.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No admin notes have been added yet.
                </p>
              ) : (
                adminNotes.map((log) => (
                  <div
                    key={log.id}
                    className="rounded-lg border border-slate-100 bg-slate-50 p-3"
                  >
                    <p className="text-sm text-slate-800">
                      {(log.meta as any)?.note ?? ""}
                    </p>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] text-slate-400">
                        {log.user
                          ? `By ${log.user.name ?? log.user.email}`
                          : "By admin"}
                      </span>
                      <time className="text-[11px] text-slate-400">
                        {formatDate(log.createdAt)}
                      </time>
                    </div>
                  </div>
                ))
              )}
            </div>
            {isAdmin ? (
              <div className="mt-4 border-t border-slate-100 pt-4">
                <AdminNotesForm projectId={project.id} />
              </div>
            ) : null}
          </section>
        </aside>
      </div>
    </main>
  );
}

