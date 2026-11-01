"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type ProjectFileUploadProps = {
  projectId: string;
  canUpload: boolean;
};

export const ProjectFileUpload: React.FC<ProjectFileUploadProps> = ({
  projectId,
  canUpload,
}) => {
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const handleUpload = async () => {
    if (!files || files.length === 0) return;

    try {
      setIsUploading(true);
      setError(null);

      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("files", file);
      });

      const response = await fetch(`/api/projects/${projectId}/files`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to upload files");
      }

      setFiles(null);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Upload files
          </p>
          <p className="text-[11px] text-slate-500">
            Add additional briefs, assets, or reference documents to this
            project.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="file"
            multiple
            disabled={!canUpload || isUploading}
            onChange={(event) => {
              setFiles(event.target.files);
            }}
            className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
          />
          <button
            type="button"
            onClick={handleUpload}
            disabled={!canUpload || isUploading || !files || files.length === 0}
            className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      {!canUpload ? (
        <p className="text-[11px] text-slate-400">
          Only the project owner and admins can upload files.
        </p>
      ) : null}
    </div>
  );
};

