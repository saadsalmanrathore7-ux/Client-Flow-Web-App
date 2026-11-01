"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

type AdminNotesFormProps = {
  projectId: string;
};

export const AdminNotesForm: React.FC<AdminNotesFormProps> = ({
  projectId,
}) => {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!note.trim()) return;

    try {
      setIsSaving(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/notes`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ note }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to add note");
      }

      setNote("");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <label
        htmlFor="admin-note"
        className="text-xs font-medium uppercase tracking-wide text-slate-600"
      >
        Add admin note
      </label>
      <textarea
        id="admin-note"
        rows={3}
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Share updates, decisions, or internal context. Clients will see these notes."
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
        disabled={isSaving}
      />
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
      <div className="flex items-center justify-end">
        <button
          type="submit"
          disabled={isSaving || !note.trim()}
          className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isSaving ? "Saving..." : "Add note"}
        </button>
      </div>
    </form>
  );
};

