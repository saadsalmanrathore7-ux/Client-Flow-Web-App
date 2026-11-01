"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type NotificationSettings = {
  projectStatusChange: boolean;
  newMessage: boolean;
  paymentConfirmed: boolean;
  fileUploaded: boolean;
};

type NotificationPreferencesProps = {
  initialSettings: NotificationSettings;
};

export function NotificationPreferences({
  initialSettings,
}: NotificationPreferencesProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [settings, setSettings] = useState<NotificationSettings>(
    initialSettings,
  );
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const isLoading = isPending;

  const handleToggle = (key: keyof NotificationSettings) => {
    const next = { ...settings, [key]: !settings[key] };
    setSettings(next);
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/settings/notifications", {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(next),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            data?.error ??
            data?.message ??
            "Failed to update notification preferences.";
          setServerError(message);
          return;
        }

        setSuccessMessage(
          data?.message ?? "Notification preferences have been updated.",
        );
        router.refresh();
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
      <ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        <li className="flex items-center justify-between gap-4 px-4 py-3 md:px-5 md:py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Project status changes
            </p>
            <p className="text-xs text-slate-500">
              Receive an email when a project moves between stages.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.projectStatusChange}
            onClick={() => handleToggle("projectStatusChange")}
            disabled={isLoading}
            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
              settings.projectStatusChange
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            } ${isLoading ? "cursor-wait opacity-70" : ""}`}
          >
            <span
              className={`mr-1 inline-block h-3 w-3 rounded-full ${
                settings.projectStatusChange ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {settings.projectStatusChange ? "On" : "Off"}
          </button>
        </li>

        <li className="flex items-center justify-between gap-4 px-4 py-3 md:px-5 md:py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">New messages</p>
            <p className="text-xs text-slate-500">
              Get an email when someone sends you a new message.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.newMessage}
            onClick={() => handleToggle("newMessage")}
            disabled={isLoading}
            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
              settings.newMessage
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            } ${isLoading ? "cursor-wait opacity-70" : ""}`}
          >
            <span
              className={`mr-1 inline-block h-3 w-3 rounded-full ${
                settings.newMessage ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {settings.newMessage ? "On" : "Off"}
          </button>
        </li>

        <li className="flex items-center justify-between gap-4 px-4 py-3 md:px-5 md:py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">
              Payment confirmations
            </p>
            <p className="text-xs text-slate-500">
              Be notified when a payment is successfully processed.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.paymentConfirmed}
            onClick={() => handleToggle("paymentConfirmed")}
            disabled={isLoading}
            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
              settings.paymentConfirmed
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            } ${isLoading ? "cursor-wait opacity-70" : ""}`}
          >
            <span
              className={`mr-1 inline-block h-3 w-3 rounded-full ${
                settings.paymentConfirmed ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {settings.paymentConfirmed ? "On" : "Off"}
          </button>
        </li>

        <li className="flex items-center justify-between gap-4 px-4 py-3 md:px-5 md:py-4">
          <div>
            <p className="text-sm font-medium text-slate-900">File uploads</p>
            <p className="text-xs text-slate-500">
              Get an email when new files are uploaded to your projects.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={settings.fileUploaded}
            onClick={() => handleToggle("fileUploaded")}
            disabled={isLoading}
            className={`inline-flex items-center rounded-full border px-2 py-1 text-xs font-medium transition ${
              settings.fileUploaded
                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border-slate-200 bg-slate-50 text-slate-500"
            } ${isLoading ? "cursor-wait opacity-70" : ""}`}
          >
            <span
              className={`mr-1 inline-block h-3 w-3 rounded-full ${
                settings.fileUploaded ? "bg-emerald-500" : "bg-slate-300"
              }`}
            />
            {settings.fileUploaded ? "On" : "Off"}
          </button>
        </li>
      </ul>

      {serverError ? (
        <p className="text-xs text-rose-600">{serverError}</p>
      ) : null}
      {successMessage ? (
        <p className="text-xs text-emerald-600">{successMessage}</p>
      ) : null}
    </div>
  );
}

