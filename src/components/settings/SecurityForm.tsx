"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

export function SecurityForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  const onSubmit = (values: PasswordFormValues) => {
    setServerError(null);
    setSuccessMessage(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/settings/password", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          const message =
            data?.error ??
            data?.message ??
            "Failed to update password. Please try again.";
          setServerError(message);
          return;
        }

        setSuccessMessage(
          data?.message ?? "Your password has been updated successfully.",
        );
        reset({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        });
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

  const isLoading = isSubmitting || isPending;

  return (
    <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
      <div className="space-y-1.5">
        <label
          htmlFor="currentPassword"
          className="text-xs font-medium uppercase tracking-wide text-slate-500"
        >
          Current password
        </label>
        <input
          id="currentPassword"
          type="password"
          autoComplete="current-password"
          className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
          {...register("currentPassword")}
        />
        {errors.currentPassword ? (
          <p className="text-xs text-rose-600">
            {errors.currentPassword.message}
          </p>
        ) : null}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="newPassword"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            New password
          </label>
          <input
            id="newPassword"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
            {...register("newPassword")}
          />
          {errors.newPassword ? (
            <p className="text-xs text-rose-600">{errors.newPassword.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="confirmNewPassword"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Confirm new password
          </label>
          <input
            id="confirmNewPassword"
            type="password"
            autoComplete="new-password"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
            {...register("confirmNewPassword")}
          />
          {errors.confirmNewPassword ? (
            <p className="text-xs text-rose-600">
              {errors.confirmNewPassword.message}
            </p>
          ) : null}
        </div>
      </div>

      <p className="text-xs text-slate-500">
        For your security, you&apos;ll be signed out of other active sessions
        after changing your password.
      </p>

      {serverError ? (
        <p className="text-xs text-rose-600">{serverError}</p>
      ) : null}
      {successMessage ? (
        <p className="text-xs text-emerald-600">{successMessage}</p>
      ) : null}

      <div className="flex items-center justify-end gap-3 pt-1">
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? "Updating..." : "Update password"}
        </button>
      </div>
    </form>
  );
}

