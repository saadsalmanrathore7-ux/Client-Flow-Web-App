"use client";

import { useState, useTransition } from "react";

import type { SubscriptionPlan } from "@/lib/plans";

type PlanCardProps = {
  plan: SubscriptionPlan;
  isCurrent: boolean;
};

export function PlanCard({ plan, isCurrent }: PlanCardProps) {
  const [isPending, startTransition] = useTransition();
  const [localLoading, setLocalLoading] = useState(false);

  const isLoading = isPending || localLoading;

  const handleSelect = () => {
    if (isCurrent || isLoading) return;

    setLocalLoading(true);
    startTransition(async () => {
      try {
        const response = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            priceId: plan.stripePriceId,
            planId: plan.id,
          }),
        });

        if (!response.ok) {
          // In a real app you might show a toast here.
          setLocalLoading(false);
          return;
        }

        const data = (await response.json()) as { url?: string };

        if (data.url) {
          window.location.href = data.url;
        } else {
          setLocalLoading(false);
        }
      } catch {
        setLocalLoading(false);
      }
    });
  };

  return (
    <div className="flex h-full flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {plan.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{plan.description}</p>
          </div>
          {isCurrent ? (
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700 ring-1 ring-emerald-100">
              Current plan
            </span>
          ) : null}
        </div>

        <div className="mt-4 flex items-baseline gap-1">
          <span className="text-2xl font-semibold text-slate-900">
            {plan.priceLabel}
          </span>
        </div>

        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[#330fe6]" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        type="button"
        onClick={handleSelect}
        disabled={isCurrent || isLoading}
        className={`mt-6 inline-flex w-full items-center justify-center rounded-full px-4 py-2.5 text-sm font-medium shadow-sm transition ${
          isCurrent
            ? "cursor-default bg-slate-100 text-slate-500"
            : "bg-[#330fe6] text-white hover:bg-[#2511aa]"
        } disabled:opacity-60`}
      >
        {isCurrent ? "Active plan" : isLoading ? "Redirecting..." : "Choose plan"}
      </button>
    </div>
  );
}

