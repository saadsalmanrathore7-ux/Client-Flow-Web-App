"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const schema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string().min(8, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [serverError, setServerError] = useState<string | null>(null);
  const [serverMessage, setServerMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setServerError("This reset link is invalid.");
      return;
    }

    setServerError(null);
    setServerMessage(null);

    const res = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password: values.password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setServerError(data.message ?? "Unable to reset password.");
      return;
    }

    setServerMessage(
      data.message ?? "Your password has been updated. Redirecting to login...",
    );

    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <AuthLayout
      heading="Create a new password"
      subheading="Choose a strong password to secure your account."
    >
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Set new password
          </h2>
          <p className="text-stone-500 mt-1">
            Must be at least 8 characters long
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-stone-700">
              New Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="Create a new password"
              showStrength
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-stone-700">
              Confirm Password
            </Label>
            <PasswordInput
              id="confirmPassword"
              placeholder="Confirm your new password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-xs text-red-500">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-sm text-red-500" role="alert">
              {serverError}
            </p>
          )}

          {serverMessage && (
            <p className="text-sm text-emerald-600" role="status">
              {serverMessage}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Updating password..." : "Update Password"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
