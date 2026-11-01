"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Enter a valid email address"),
  avatar: z
    .instanceof(File)
    .optional()
    .or(z.null())
    .or(z.undefined()),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

type ProfileFormProps = {
  initialName: string;
  initialEmail: string;
  initialAvatarUrl?: string;
};

export function ProfileForm({
  initialName,
  initialEmail,
  initialAvatarUrl,
}: ProfileFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [serverError, setServerError] = useState<string | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    initialAvatarUrl ?? null,
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: initialName,
      email: initialEmail,
      avatar: undefined,
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    setServerError(null);

    const formData = new FormData();
    formData.append("name", values.name);
    formData.append("email", values.email);

    if (values.avatar instanceof File) {
      formData.append("avatar", values.avatar);
    }

    startTransition(async () => {
      try {
        const response = await fetch("/api/settings/profile", {
          method: "PATCH",
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json().catch(() => null);
          const message =
            data?.error ??
            data?.message ??
            "Failed to update profile. Please try again.";
          setServerError(message);
          return;
        }

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
    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
      <div className="flex flex-col gap-4 md:flex-row md:items-center">
        <div className="flex-shrink-0">
          <div className="relative h-16 w-16 overflow-hidden rounded-full bg-slate-100 ring-2 ring-slate-200">
            {avatarPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={avatarPreview}
                alt="Avatar preview"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-slate-400">
                {initialName?.charAt(0)?.toUpperCase() ?? "U"}
              </div>
            )}
          </div>
        </div>

        <div className="flex-1 space-y-2 text-sm">
          <label className="block text-xs font-medium uppercase tracking-wide text-slate-500">
            Avatar
          </label>
          <p className="text-xs text-slate-500">
            This is your public avatar. It will be shown on messages and
            activity throughout the portal.
          </p>
          <input
            type="file"
            accept="image/*"
            className="mt-2 block w-full text-xs text-slate-700 file:mr-3 file:rounded-full file:border-0 file:bg-slate-900 file:px-4 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-slate-700"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) {
                setValue("avatar", file);
                const previewUrl = URL.createObjectURL(file);
                setAvatarPreview(previewUrl);
              }
            }}
          />
          {errors.avatar ? (
            <p className="text-xs text-rose-600">{errors.avatar.message}</p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1.5">
          <label
            htmlFor="name"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Name
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
            {...register("name")}
          />
          {errors.name ? (
            <p className="text-xs text-rose-600">{errors.name.message}</p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className="block w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
            {...register("email")}
          />
          {errors.email ? (
            <p className="text-xs text-rose-600">{errors.email.message}</p>
          ) : null}
        </div>
      </div>

      {serverError ? (
        <p className="text-xs text-rose-600">{serverError}</p>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-xs text-slate-500">
          We’ll send important account updates and billing information to this
          email address.
        </p>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {isLoading ? "Saving..." : "Save changes"}
        </button>
      </div>
    </form>
  );
}

