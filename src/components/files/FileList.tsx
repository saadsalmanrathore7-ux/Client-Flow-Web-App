"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type FileItem = {
  id: string;
  name: string;
  url: string;
  size: number;
  version: number;
  createdAt: string;
  project: {
    id: string;
    title: string;
  };
  uploadedBy: {
    id: string;
    name: string | null;
    email: string | null;
  };
};

type FileListProps = {
  files: FileItem[];
};

function formatBytes(size: number): string {
  if (!Number.isFinite(size) || size < 0) return "—";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let index = 0;
  let value = size;

  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }

  return `${value.toFixed(index === 0 ? 0 : 1)} ${units[index]}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";

  return date.toLocaleString();
}

export const FileList: React.FC<FileListProps> = ({ files }) => {
  const router = useRouter();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const groupedByProject = useMemo(() => {
    const byProject = new Map<
      string,
      { projectTitle: string; files: FileItem[] }
    >();

    for (const file of files) {
      const key = file.project.id;
      const existing = byProject.get(key);
      if (existing) {
        existing.files.push(file);
      } else {
        byProject.set(key, {
          projectTitle: file.project.title,
          files: [file],
        });
      }
    }

    return Array.from(byProject.entries()).map(([projectId, value]) => ({
      projectId,
      projectTitle: value.projectTitle,
      files: value.files,
    }));
  }, [files]);

  const handleDelete = async (fileId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this file? This action cannot be undone.",
    );
    if (!confirmed) return;

    try {
      setIsDeletingId(fileId);
      setError(null);

      const response = await fetch(`/api/files/${fileId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to delete file");
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsDeletingId(null);
    }
  };

  if (files.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
        No files have been uploaded yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {groupedByProject.map(({ projectId, projectTitle, files: projectFiles }) => {
        const byName = new Map<string, FileItem[]>();
        for (const file of projectFiles) {
          const existing = byName.get(file.name);
          if (existing) {
            existing.push(file);
          } else {
            byName.set(file.name, [file]);
          }
        }

        const groupedFiles = Array.from(byName.entries()).map(
          ([name, versions]) => ({
            name,
            versions: versions.sort(
              (a, b) => b.version - a.version || b.size - a.size,
            ),
          }),
        );

        return (
          <section
            key={projectId}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {projectTitle}
                </h2>
                <p className="mt-0.5 text-xs text-slate-500">
                  {groupedFiles.length} file
                  {groupedFiles.length === 1 ? "" : "s"} for this project
                </p>
              </div>
            </header>
            <div className="divide-y divide-slate-100">
              {groupedFiles.map(({ name, versions }) => {
                const latest = versions[0];
                const hasVersions = versions.length > 1;

                return (
                  <div key={name} className="px-4 py-3 text-sm">
                    <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                      <div>
                        <a
                          href={latest.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-[#330fe6] hover:underline"
                        >
                          {name}
                        </a>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                          <span>{formatBytes(latest.size)}</span>
                          <span>•</span>
                          <span>{formatDate(latest.createdAt)}</span>
                          <span>•</span>
                          <span>
                            Uploaded by{" "}
                            {latest.uploadedBy.name ||
                              latest.uploadedBy.email ||
                              "Unknown"}
                          </span>
                          {hasVersions ? (
                            <>
                              <span>•</span>
                              <span>{versions.length} versions</span>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <a
                          href={latest.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
                        >
                          Download
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(latest.url);
                            setPreviewName(latest.name);
                          }}
                          className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-100"
                        >
                          Preview
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(latest.id)}
                          disabled={isDeletingId === latest.id}
                          className="inline-flex items-center justify-center rounded-full bg-rose-50 px-3 py-1.5 text-xs font-medium text-rose-700 shadow-sm transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-70"
                        >
                          {isDeletingId === latest.id ? "Deleting..." : "Delete"}
                        </button>
                      </div>
                    </div>

                    {hasVersions ? (
                      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2">
                        <p className="mb-1 text-[11px] font-medium uppercase tracking-wide text-slate-500">
                          Version history
                        </p>
                        <ul className="space-y-1 text-[11px] text-slate-600">
                          {versions.map((version, index) => (
                            <li
                              key={version.id}
                              className="flex flex-wrap items-center justify-between gap-2"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600 ring-1 ring-slate-200">
                                  v{versions.length - index}
                                </span>
                                <span>{formatBytes(version.size)}</span>
                                <span>•</span>
                                <span>{formatDate(version.createdAt)}</span>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <a
                                  href={version.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="text-[11px] font-medium text-[#330fe6] hover:underline"
                                >
                                  Download
                                </a>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {error ? (
        <p className="text-xs text-rose-600">
          {error}
        </p>
      ) : null}

      {previewUrl ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-hidden rounded-xl bg-white shadow-xl">
            <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {previewName ?? "Preview"}
                </p>
                <p className="text-xs text-slate-500">
                  Preview is best for images and PDFs.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setPreviewUrl(null);
                  setPreviewName(null);
                }}
                className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 hover:bg-slate-200"
              >
                Close
              </button>
            </header>
            <div className="h-[70vh] bg-slate-900/5">
              <iframe
                src={previewUrl}
                className="h-full w-full border-0"
                title={previewName ?? "File preview"}
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

