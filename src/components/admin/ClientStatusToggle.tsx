"use client";

import { useTransition, useState } from "react";

type ClientStatusToggleProps = {
  clientId: string;
  initialStatus: "active" | "suspended";
};

export function ClientStatusToggle({
  clientId,
  initialStatus,
}: ClientStatusToggleProps) {
  const [status, setStatus] = useState<"active" | "suspended">(initialStatus);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isSuspended = status === "suspended";

  const handleToggle = () => {
    startTransition(async () => {
      setError(null);
      const nextStatus = isSuspended ? "active" : "suspended";

      try {
        const response = await fetch(`/api/admin/clients/${clientId}/status`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status: nextStatus }),
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to update status");
        }

        setStatus(nextStatus);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Something went wrong";
        setError(message);
      }
    });
  };

  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={handleToggle}
        disabled={isPending}
        className={`inline-flex items-center justify-center rounded-full px-3 py-1.5 text-xs font-medium shadow-sm transition ${
          isSuspended
            ? "bg-rose-50 text-rose-700 ring-1 ring-rose-200 hover:bg-rose-100"
            : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
        } disabled:cursor-not-allowed disabled:opacity-70`}
      >
        {isPending
          ? "Updating..."
          : isSuspended
            ? "Reactivate account"
            : "Suspend account"}
      </button>
      {error && <p className="text-[11px] text-rose-600">{error}</p>}
    </div>
  );
}

