import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { PlanCard } from "@/components/subscription/PlanCard";
import { AutoRenewToggle } from "@/components/subscription/AutoRenewToggle";

const SUBSCRIPTION_PRIMARY_COLOR = "#330fe6";

async function getSubscriptionData(userId: string) {
  const [subscription, payments] = await Promise.all([
    prisma.subscription.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.payment.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return { subscription, payments };
}

export default async function SubscriptionPage() {
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
            This subscription page is only available to client accounts.
          </p>
        </div>
      </main>
    );
  }

  const { subscription, payments } = await getSubscriptionData(user.id);

  const currentPlanId = subscription?.plan ?? null;
  const currentPlan = PLANS.find((plan) => plan.id === currentPlanId) ?? null;

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Subscription &amp; billing
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your plan, billing settings, and payment history.
          </p>
        </div>
        <a
          href="/dashboard"
          className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2511aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ focusVisible: { ringColor: SUBSCRIPTION_PRIMARY_COLOR } as any }}
        >
          Back to dashboard
        </a>
      </header>

      <section className="mb-8 grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.1fr)] md:items-start">
        <div className="space-y-4">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Plans
          </h2>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan, i) => (
              <div
                key={plan.id}
                className="animate-bounce-in"
                style={{ animationDelay: `${150 + i * 100}ms` }}
              >
                <PlanCard
                  plan={plan}
                  isCurrent={currentPlanId === plan.id}
                />
              </div>
            ))}
          </div>
        </div>

        <aside className="animate-slide-right delay-300 space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Current subscription
          </h2>
          {subscription && currentPlan ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {currentPlan.name} plan
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    Renews on{" "}
                    {new Date(
                      subscription.currentPeriodEnd,
                    ).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ring-1 ${
                    subscription.status === "active"
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                      : "bg-slate-50 text-slate-600 ring-slate-200"
                  }`}
                >
                  {subscription.status}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="space-y-1">
                  <p className="text-xs font-medium text-slate-500">
                    Auto-renew
                  </p>
                  <p className="text-xs text-slate-500">
                    Toggle renewal at the end of the current period.
                  </p>
                </div>
                <AutoRenewToggle
                  initialEnabled={!subscription.cancelAtPeriodEnd}
                />
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              You do not have an active subscription yet. Choose a plan to
              get started.
            </div>
          )}
        </aside>
      </section>

      <section className="animate-fade-up delay-500 mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Payment history
          </h2>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200 text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Date
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Amount
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                  Invoice
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {payments.length === 0 ? (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No payments found yet.
                  </td>
                </tr>
              ) : (
                payments.map((payment) => {
                  const anyPayment = payment as any;
                  const invoiceUrl: string | undefined =
                    anyPayment.invoiceUrl ?? anyPayment.invoiceURL;

                  return (
                    <tr key={payment.id}>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        ${(payment.amount / 100).toFixed(2)}{" "}
                        <span className="uppercase text-slate-400">
                          {payment.currency}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                            payment.status === "succeeded"
                              ? "bg-emerald-50 text-emerald-700"
                              : payment.status === "failed" ||
                                  payment.status === "canceled"
                                ? "bg-rose-50 text-rose-700"
                                : "bg-slate-50 text-slate-600"
                          }`}
                        >
                          {payment.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-slate-700">
                        {invoiceUrl ? (
                          <a
                            href={invoiceUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs font-medium text-[#330fe6] hover:underline"
                          >
                            View invoice
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

