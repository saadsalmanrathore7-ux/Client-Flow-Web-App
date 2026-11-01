"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { ProjectStatus } from "@/generated/prisma/enums";

type ProjectStatusControlProps = {
  projectId: string;
  currentStatus: keyof typeof ProjectStatus;
  canEdit: boolean;
};

const STATUS_OPTIONS: { value: keyof typeof ProjectStatus; label: string }[] = [
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "COMPLETED", label: "Completed" },
];

export const ProjectStatusControl: React.FC<ProjectStatusControlProps> = ({
  projectId,
  currentStatus,
  canEdit,
}) => {
  const router = useRouter();
  const [status, setStatus] = useState<keyof typeof ProjectStatus>(
    currentStatus,
  );
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to update status");
      }

      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  if (!canEdit) {
    return null;
  }

  return (
    <div className="mt-3 space-y-2 rounded-lg border border-slate-100 bg-slate-50 p-3">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-600">
            Update status
          </p>
          <p className="text-[11px] text-slate-500">
            Changes are visible to the client and recorded in the activity log.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as keyof typeof ProjectStatus)
            }
            disabled={isSaving}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-700 shadow-sm focus:border-[#330fe6] focus:outline-none focus:ring-1 focus:ring-[#330fe6]"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {isSaving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
};

