import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { NotificationList } from "@/components/notifications/NotificationList";

const PRIMARY_COLOR = "#330fe6";

async function getNotifications(userId: string) {
  const [notifications, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.notification.count({
      where: {
        userId,
        read: false,
      },
    }),
  ]);

  return { notifications, unreadCount };
}

export default async function NotificationsPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "ADMIN") {
    redirect("/admin");
  }

  if (user.role !== "CLIENT") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">
            Access restricted
          </h1>
          <p className="mt-1 text-sm text-amber-800">
            This page is only available to client accounts.
          </p>
        </div>
      </main>
    );
  }

  const { notifications, unreadCount } = await getNotifications(user.id);

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="flex items-center gap-3 text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Notifications
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
              <span className="mr-1 inline-flex h-2 w-2 rounded-full bg-[#330fe6]" />
              {unreadCount} unread
            </span>
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Stay on top of project changes, new messages, billing updates, and
            file activity.
          </p>
        </div>

        {/* Bell UI can later be moved into a shared layout/header */}
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm ring-1 ring-slate-200">
          <span
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-slate-50 text-slate-500"
            aria-hidden="true"
          >
            {/* Placeholder bell glyph */}
            <span className="inline-block h-3 w-3 rounded-full border border-slate-400 border-b-transparent border-l-transparent" />
          </span>
          <span className="hidden sm:inline">
            Bell widget placeholder (header)
          </span>
        </div>
      </header>

      <section
        className="animate-slide-left delay-200 rounded-2xl bg-slate-50 px-4 py-5 shadow-sm ring-1 ring-slate-200 md:px-6 md:py-6"
        style={{ borderTopColor: PRIMARY_COLOR, borderTopWidth: 3 }}
      >
        <NotificationList
          notifications={notifications.map((n) => ({
            id: n.id,
            type: n.type as any,
            message: n.message,
            read: n.read,
            createdAt: n.createdAt,
          }))}
        />
      </section>
    </main>
  );
}

