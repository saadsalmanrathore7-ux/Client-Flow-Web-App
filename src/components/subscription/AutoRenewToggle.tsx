"use client";

import { useState, useTransition } from "react";

type AutoRenewToggleProps = {
  initialEnabled: boolean;
};

export function AutoRenewToggle({ initialEnabled }: AutoRenewToggleProps) {
  const [isPending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initialEnabled);

  const isLoading = isPending;

  const handleToggle = () => {
    const next = !enabled;
    setEnabled(next);

    startTransition(async () => {
      try {
        await fetch("/api/stripe/auto-renew", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            cancelAtPeriodEnd: !next,
          }),
        });
      } catch {
        // If the request fails, optimistically keep the UI state.
      }
    });
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      onClick={handleToggle}
      disabled={isLoading}
      className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
        enabled
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-slate-200 bg-slate-50 text-slate-500"
      }`}
    >
      <span
        className={`mr-1 inline-block h-3 w-3 rounded-full ${
          enabled ? "bg-emerald-500" : "bg-slate-300"
        }`}
      />
      {enabled ? "Auto-renew on" : "Auto-renew off"}
    </button>
  );
}

