"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  email: z.string().email("Please enter a valid email"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [serverMessage, setServerMessage] = useState<string | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setServerMessage(null);

    const res = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setServerError(data.message ?? "Unable to start password reset.");
      return;
    }

    setServerMessage(
      data.message ??
        "If an account with that email exists, you will receive a reset link shortly.",
    );
  };

  return (
    <AuthLayout
      heading="Reset your password"
      subheading="Enter your email address and we'll send you a link to reset your password."
    >
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
        <div className="mb-6">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Forgot your password?
          </h2>
          <p className="text-stone-500 mt-1">
            Enter your email and we&apos;ll send you a reset link
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-stone-700">
              Email Address
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="john@example.com"
                className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-stone-900 rounded-xl text-stone-900 placeholder:text-stone-400"
                {...register("email")}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-500">{errors.email.message}</p>
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
            {isSubmitting ? "Sending reset link..." : "Send Reset Link"}
          </Button>
        </form>
      </div>
    </AuthLayout>
  );
}
