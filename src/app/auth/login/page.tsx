"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { Mail } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";


const schema = z.object({
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

const testimonial = {
  quote:
    "ClientFlow transformed how we manage our agency projects. The real-time collaboration features alone saved us hours every week.",
  name: "Sarah Mitchell",
  role: "CEO, DesignCraft Agency",
  avatar: "SM",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [serverError, setServerError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl,
    });

    if (!result || result.error) {
      setServerError("Invalid email or password.");
      return;
    }

    router.push(result.url ?? callbackUrl);
  };

  return (
    <AuthLayout
      heading="Welcome back"
      subheading="Your projects are waiting for you. Sign in to continue where you left off."
      testimonial={testimonial}
    >
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm animate-slide-up">
        <div className="mb-6 animate-fade-up delay-50">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Sign in to your account
          </h2>
          <p className="text-stone-500 mt-1">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Email */}
          <div className="space-y-2 animate-fade-up delay-100">
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

          {/* Password */}
          <div className="space-y-2 animate-fade-up delay-150">
            <div className="flex items-center justify-between">
              <Label htmlFor="password" className="text-stone-700">
                Password
              </Label>
              <Link
                href="/auth/forgot-password"
                className="text-sm text-stone-900 font-medium hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id="password"
              placeholder="Enter your password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2 animate-fade-up delay-200">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked as boolean)}
              className="border-stone-300 data-[state=checked]:bg-stone-900 data-[state=checked]:border-stone-900"
            />
            <Label
              htmlFor="rememberMe"
              className="text-sm text-stone-500 cursor-pointer"
            >
              Remember me for 30 days
            </Label>
          </div>

          {serverError && (
            <p className="text-sm text-red-500" role="alert">
              {serverError}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/auth/signup"
            className="text-stone-900 font-medium hover:underline"
          >
            Sign up
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
