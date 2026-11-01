"use client";

import React, { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

type FileUploadProjectOption = {
  id: string;
  title: string;
};

type FileUploadProps = {
  projects: FileUploadProjectOption[];
  canUpload: boolean;
};

export const FileUpload: React.FC<FileUploadProps> = ({
  projects,
  canUpload,
}) => {
  const router = useRouter();
  const [selectedProjectId, setSelectedProjectId] = useState<string>(
    projects[0]?.id ?? "",
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFiles = useCallback((fileList: FileList | null) => {
    if (!fileList) return;
    const nextFiles = Array.from(fileList);
    setFiles(nextFiles);
  }, []);

  const handleDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    handleFiles(event.dataTransfer.files);
  };

  const handleUpload = async () => {
    if (!selectedProjectId || files.length === 0 || !canUpload) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("projectId", selectedProjectId);
      files.forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch("/api/files/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to upload files");
      }

      setFiles([]);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  const hasFiles = files.length > 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Upload files
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Drag and drop to upload new files to your projects.
          </p>
        </div>
        <div className="flex flex-col gap-2 md:flex-row md:items-center">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span>Project</span>
            <select
              className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:border-[#330fe6] focus:outline-none focus:ring-1 focus:ring-[#330fe6]"
              value={selectedProjectId}
              onChange={(event) => setSelectedProjectId(event.target.value)}
              disabled={!canUpload || projects.length === 0}
            >
              {projects.length === 0 ? (
                <option value="">No projects available</option>
              ) : null}
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.title}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={handleUpload}
            disabled={
              !canUpload || !selectedProjectId || !hasFiles || isUploading
            }
            className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>

      <div
        className={`flex flex-col items-center justify-center rounded-xl border border-dashed px-4 py-8 text-center transition ${
          isDragging
            ? "border-[#330fe6] bg-indigo-50/60"
            : "border-slate-200 bg-slate-50"
        }`}
        onDragEnter={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canUpload) return;
          setIsDragging(true);
        }}
        onDragOver={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canUpload) return;
        }}
        onDragLeave={(event) => {
          event.preventDefault();
          event.stopPropagation();
          if (!canUpload) return;
          setIsDragging(false);
        }}
        onDrop={handleDrop}
      >
        <p className="text-sm font-medium text-slate-800">
          Drag and drop files here
        </p>
        <p className="mt-1 text-xs text-slate-500">
          or click to browse files from your computer.
        </p>
        <div className="mt-4">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
            <span>Select files</span>
            <input
              type="file"
              multiple
              className="sr-only"
              disabled={!canUpload}
              onChange={(event) => handleFiles(event.target.files)}
            />
          </label>
        </div>
        {!canUpload ? (
          <p className="mt-3 text-[11px] text-slate-400">
            You need at least one project to upload files.
          </p>
        ) : null}
      </div>

      {hasFiles ? (
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending upload
          </p>
          <ul className="space-y-1 text-xs text-slate-700">
            {files.map((file) => (
              <li key={file.name + file.size}>
                {file.name}{" "}
                <span className="text-[11px] text-slate-400">
                  ({Math.round(file.size / 1024)} KB)
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

