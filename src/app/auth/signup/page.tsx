"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Mail, User } from "lucide-react";

import { AuthLayout } from "@/components/auth/auth-layout";
import { PasswordInput } from "@/components/auth/password-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

const schema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type FormValues = z.infer<typeof schema>;

const features = [
  { icon: <Check className="w-4 h-4" />, text: "Real-time collaboration with your team" },
  { icon: <Check className="w-4 h-4" />, text: "Secure payments & subscription management" },
  { icon: <Check className="w-4 h-4" />, text: "Full project tracking from start to delivery" },
];

export default function SignupPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [serverSuccess, setServerSuccess] = useState<string | null>(null);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    setServerSuccess(null);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      setServerError(data.message ?? "Unable to create account.");
      return;
    }

    setServerSuccess(data.message ?? "Account created. You can now sign in.");

    setTimeout(() => {
      router.push("/auth/login");
    }, 2000);
  };

  return (
    <AuthLayout
      heading="Start managing projects smarter"
      subheading="Join thousands of clients who trust ClientFlow to manage their projects efficiently."
      features={features}
    >
      <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm animate-slide-up">
        <div className="mb-6 animate-fade-up delay-50">
          <h2 className="text-2xl font-bold tracking-tight text-stone-900">
            Create your account
          </h2>
          <p className="text-stone-500 mt-1">
            Join hundreds of clients already using ClientFlow
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <div className="space-y-2 animate-fade-up delay-100">
            <Label htmlFor="name" className="text-stone-700">
              Full Name
            </Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
              <Input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="John Doe"
                className="pl-10 h-11 bg-stone-50 border-stone-200 focus:border-stone-900 rounded-xl text-stone-900 placeholder:text-stone-400"
                {...register("name")}
              />
            </div>
            {errors.name && (
              <p className="text-xs text-red-500">{errors.name.message}</p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-2 animate-fade-up delay-150">
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
          <div className="space-y-2 animate-fade-up delay-200">
            <Label htmlFor="password" className="text-stone-700">
              Password
            </Label>
            <PasswordInput
              id="password"
              placeholder="Create a password (min. 8 characters)"
              showStrength
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          {/* Terms */}
          <div className="flex items-start gap-2 animate-fade-up delay-300">
            <Checkbox
              id="terms"
              checked={agreeToTerms}
              onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
              className="mt-1 border-stone-300 data-[state=checked]:bg-stone-900 data-[state=checked]:border-stone-900"
            />
            <Label
              htmlFor="terms"
              className="text-sm text-stone-500 leading-tight cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-stone-900 font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-stone-900 font-medium hover:underline">
                Privacy Policy
              </Link>
            </Label>
          </div>

          {serverError && (
            <p className="text-sm text-red-500" role="alert">
              {serverError}
            </p>
          )}

          {serverSuccess && (
            <p className="text-sm text-emerald-600" role="status">
              {serverSuccess}
            </p>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium transition-all duration-200 hover:scale-[1.02] disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isSubmitting ? "Creating account..." : "Create Account"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-stone-900 font-medium hover:underline"
          >
            Sign in
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
}
