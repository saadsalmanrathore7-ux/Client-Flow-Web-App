"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import { formatTimeAgo } from "@/lib/date";

type NotificationType =
  | "PROJECT_STATUS_CHANGE"
  | "NEW_MESSAGE"
  | "PAYMENT_CONFIRMED"
  | "FILE_UPLOADED"
  | string;

export type NotificationListItem = {
  id: string;
  type: NotificationType;
  message: string;
  read: boolean;
  createdAt: string | Date;
};

type NotificationListProps = {
  notifications: NotificationListItem[];
};

type Filter = "all" | "unread";

function getTypeConfig(type: NotificationType) {
  switch (type) {
    case "PROJECT_STATUS_CHANGE":
      return {
        label: "Project status",
        bg: "bg-indigo-50",
        dot: "bg-indigo-500",
      };
    case "NEW_MESSAGE":
      return {
        label: "New message",
        bg: "bg-emerald-50",
        dot: "bg-emerald-500",
      };
    case "PAYMENT_CONFIRMED":
      return {
        label: "Payment",
        bg: "bg-amber-50",
        dot: "bg-amber-500",
      };
    case "FILE_UPLOADED":
      return {
        label: "File upload",
        bg: "bg-sky-50",
        dot: "bg-sky-500",
      };
    default:
      return {
        label: "Update",
        bg: "bg-slate-50",
        dot: "bg-slate-400",
      };
  }
}

export function NotificationList({ notifications }: NotificationListProps) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [optimisticNotifications, setOptimisticNotifications] =
    useState<NotificationListItem[]>(notifications);
  const [isPending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    if (filter === "unread") {
      return optimisticNotifications.filter((n) => !n.read);
    }
    return optimisticNotifications;
  }, [filter, optimisticNotifications]);

  const unreadCount = useMemo(
    () => optimisticNotifications.filter((n) => !n.read).length,
    [optimisticNotifications],
  );

  const handleMarkAsRead = (id: string) => {
    setOptimisticNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

    startTransition(async () => {
      try {
        const res = await fetch("/api/notifications/read", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ id }),
        });

        if (!res.ok) {
          // If the request fails, refresh to get back to a consistent state.
          router.refresh();
          return;
        }

        router.refresh();
      } catch {
        router.refresh();
      }
    });
  };

  const handleMarkAllAsRead = () => {
    if (unreadCount === 0) return;

    setOptimisticNotifications((prev) =>
      prev.map((n) => (n.read ? n : { ...n, read: true })),
    );

    startTransition(async () => {
      try {
        const res = await fetch("/api/notifications/read-all", {
          method: "POST",
        });

        if (!res.ok) {
          router.refresh();
          return;
        }

        router.refresh();
      } catch {
        router.refresh();
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex rounded-full bg-slate-100 p-1 text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={`rounded-full px-3 py-1 transition ${
              filter === "all"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setFilter("unread")}
            className={`rounded-full px-3 py-1 transition ${
              filter === "unread"
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Unread
            {unreadCount > 0 && (
              <span className="ml-1 inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-[#330fe6] px-1.5 text-[10px] font-semibold text-white">
                {unreadCount}
              </span>
            )}
          </button>
        </div>

        <button
          type="button"
          onClick={handleMarkAllAsRead}
          disabled={unreadCount === 0 || isPending}
          className={`inline-flex items-center justify-center rounded-full border px-3 py-1.5 text-xs font-medium transition ${
            unreadCount === 0 || isPending
              ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
              : "border-slate-200 bg-white text-slate-700 hover:border-[#330fe6] hover:text-[#330fe6]"
          }`}
        >
          Mark all as read
        </button>
      </div>

      <div className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
        {filtered.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-slate-500">
            {filter === "unread"
              ? "You’re all caught up. No unread notifications."
              : "No notifications yet. You’ll see updates about your projects, messages, and billing here."}
          </div>
        ) : (
          filtered.map((notification, i) => {
            const typeConfig = getTypeConfig(notification.type);
            const createdAt =
              notification.createdAt instanceof Date
                ? notification.createdAt
                : new Date(notification.createdAt);

            return (
              <div
                key={notification.id}
                style={{ animationDelay: `${i * 55}ms` }}
                className={`animate-slide-left flex items-start gap-4 px-6 py-4 transition ${
                  !notification.read ? "bg-slate-50" : "bg-white"
                }`}
              >
                <div
                  className={`mt-1 inline-flex h-8 w-8 items-center justify-center rounded-full ${typeConfig.bg}`}
                >
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full ${typeConfig.dot}`}
                  />
                </div>

                <div className="flex-1">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        {typeConfig.label}
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {notification.message}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 text-right">
                      <p className="text-xs text-slate-400">
                        {formatTimeAgo(createdAt)}
                      </p>
                      {!notification.read && (
                        <button
                          type="button"
                          onClick={() => handleMarkAsRead(notification.id)}
                          disabled={isPending}
                          className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-3 py-1 text-[11px] font-medium text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

