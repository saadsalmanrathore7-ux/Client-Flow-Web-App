"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { signOut } from "next-auth/react";

export function DangerZone() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");
  const [serverError, setServerError] = useState<string | null>(null);

  const isLoading = isPending;
  const disabled = isLoading || confirmationText !== "DELETE";

  const handleDelete = () => {
    setServerError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/settings/account", {
          method: "DELETE",
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            data?.error ??
            data?.message ??
            "Failed to delete account. Please try again.";
          setServerError(message);
          return;
        }

        // Best-effort sign out after account deletion.
        await signOut({ redirect: false });
        router.push("/auth/signup");
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.";
        setServerError(message);
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-rose-100 bg-rose-50 px-4 py-3 text-sm text-rose-800">
        <p className="font-semibold">This action cannot be undone.</p>
        <p className="mt-1 text-xs text-rose-700">
          Deleting your account will remove your access to all projects, files,
          and messages associated with this portal.
        </p>
      </div>

      {serverError ? (
        <p className="text-xs text-rose-600">{serverError}</p>
      ) : null}

      <button
        type="button"
        onClick={() => setIsDialogOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-semibold text-rose-700 shadow-sm transition hover:border-rose-300 hover:bg-rose-100"
      >
        Delete account
      </button>

      {isDialogOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white p-5 shadow-lg">
            <h3 className="text-sm font-semibold text-slate-900">
              Are you absolutely sure?
            </h3>
            <p className="mt-2 text-xs text-slate-500">
              This will permanently delete your account and may remove or
              anonymize associated data, including projects, conversations,
              notifications, and billing records where possible.
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Type <span className="font-mono text-[11px]">DELETE</span> below
              to confirm.
            </p>

            <input
              type="text"
              value={confirmationText}
              onChange={(event) => setConfirmationText(event.target.value)}
              className="mt-3 block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-rose-500 focus:ring-1 focus:ring-rose-500"
              placeholder="Type DELETE to confirm"
            />

            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsDialogOpen(false);
                  setConfirmationText("");
                  setServerError(null);
                }}
                disabled={isLoading}
                className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={disabled}
                className="inline-flex items-center justify-center rounded-full bg-rose-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
              >
                {isLoading ? "Deleting..." : "Yes, delete account"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

