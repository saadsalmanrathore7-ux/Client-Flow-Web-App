import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProfileForm } from "@/components/settings/ProfileForm";
import { SecurityForm } from "@/components/settings/SecurityForm";
import { NotificationPreferences } from "@/components/settings/NotificationPreferences";
import { DangerZone } from "@/components/settings/DangerZone";

async function getSettingsData(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      notificationSettings: true,
    },
  });

  if (!user) {
    return null;
  }

  const notificationSettings = (user.notificationSettings as Record<string, boolean> | null) ?? {};

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatarUrl: user.avatarUrl ?? undefined,
    notifications: {
      projectStatusChange: Boolean(notificationSettings.projectStatusChange),
      newMessage: Boolean(notificationSettings.newMessage),
      paymentConfirmed: Boolean(notificationSettings.paymentConfirmed),
      fileUploaded: Boolean(notificationSettings.fileUploaded),
    },
  };
}

export default async function SettingsPage() {
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
            This settings page is only available to client accounts.
          </p>
        </div>
      </main>
    );
  }

  const data = await getSettingsData(user.id);

  if (!data) {
    redirect("/auth/login");
  }

  const PRIMARY_COLOR = "#330fe6";

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Account settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your profile details, security, notifications, and account
            status.
          </p>
        </div>
      </header>

      <section className="animate-fade-up delay-100 grid gap-8 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)]">
        <nav
          aria-label="Settings sections"
          className="h-fit rounded-2xl bg-slate-50 p-3 text-sm shadow-sm ring-1 ring-slate-200"
        >
          <ol className="space-y-1">
            <li>
              <a
                href="#profile"
                className="flex items-center justify-between rounded-xl bg-white px-3 py-2 font-medium text-slate-900 ring-1 ring-slate-200 transition hover:text-[#330fe6]"
              >
                <span>Profile</span>
              </a>
            </li>
            <li>
              <a
                href="#security"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-700 transition hover:bg-white hover:text-[#330fe6] hover:ring-1 hover:ring-slate-200"
              >
                <span>Security</span>
              </a>
            </li>
            <li>
              <a
                href="#notifications"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-slate-700 transition hover:bg-white hover:text-[#330fe6] hover:ring-1 hover:ring-slate-200"
              >
                <span>Notifications</span>
              </a>
            </li>
            <li>
              <a
                href="#danger"
                className="flex items-center justify-between rounded-xl px-3 py-2 text-rose-600 transition hover:bg-white hover:text-rose-700 hover:ring-1 hover:ring-rose-100"
              >
                <span>Danger zone</span>
              </a>
            </li>
          </ol>
        </nav>

        <div className="space-y-8">
          <section
            id="profile"
            className="animate-slide-right delay-200 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6"
            style={{ borderTopColor: PRIMARY_COLOR, borderTopWidth: 3 }}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Profile
              </h2>
              <p className="text-sm text-slate-500">
                Update your name, email address, and avatar.
              </p>
            </div>
            <ProfileForm
              initialName={data.name}
              initialEmail={data.email}
              initialAvatarUrl={data.avatarUrl}
            />
          </section>

          <section
            id="security"
            className="animate-slide-right delay-400 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6"
            style={{ borderTopColor: PRIMARY_COLOR, borderTopWidth: 3 }}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Security
              </h2>
              <p className="text-sm text-slate-500">
                Change your password to keep your account secure.
              </p>
            </div>
            <SecurityForm />
          </section>

          <section
            id="notifications"
            className="animate-slide-right delay-300 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6"
            style={{ borderTopColor: PRIMARY_COLOR, borderTopWidth: 3 }}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Notifications
              </h2>
              <p className="text-sm text-slate-500">
                Choose which updates you want to receive by email.
              </p>
            </div>
            <NotificationPreferences initialSettings={data.notifications} />
          </section>

          <section
            id="danger"
            className="animate-slide-right delay-500 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:p-6"
            style={{ borderTopColor: "#e11d48", borderTopWidth: 3 }}
          >
            <div className="mb-4 flex flex-col gap-1">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-rose-600">
                Danger zone
              </h2>
              <p className="text-sm text-slate-500">
                Permanently delete your account and associated data.
              </p>
            </div>
            <DangerZone />
          </section>
        </div>
      </section>
    </main>
  );
}

