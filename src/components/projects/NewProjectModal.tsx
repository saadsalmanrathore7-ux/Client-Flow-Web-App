"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

const projectSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters"),
  budget: z
    .string()
    .refine((val) => !Number.isNaN(Number(val)) && Number(val) > 0, {
      message: "Budget must be a positive number",
    }),
  deadline: z
    .string()
    .optional()
    .refine(
      (val) => !val || !Number.isNaN(Date.parse(val)),
      "Please provide a valid date",
    ),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

type NewProjectModalProps = {
  /** Optional label for the trigger button */
  triggerLabel?: string;
};

export const NewProjectModal: React.FC<NewProjectModalProps> = ({
  triggerLabel = "Create new project",
}) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [files, setFiles] = useState<FileList | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: "",
      description: "",
      budget: "",
      deadline: "",
    },
  });

  const closeModal = () => {
    setIsOpen(false);
    setError(null);
    setFiles(null);
    reset();
  };

  const onSubmit = async (values: ProjectFormValues) => {
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          description: values.description,
          budget: values.budget,
          deadline: values.deadline || null,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error ?? "Failed to create project");
      }

      const project = (await response.json()) as { id: string };

      if (files && files.length > 0) {
        const formData = new FormData();
        Array.from(files).forEach((file) => {
          // Support both "files" and "files[]" on the server
          formData.append("files", file);
        });

        const uploadResponse = await fetch(
          `/api/projects/${project.id}/files`,
          {
            method: "POST",
            body: formData,
          },
        );

        if (!uploadResponse.ok) {
          const data = await uploadResponse.json().catch(() => null);
          throw new Error(data?.error ?? "Failed to upload files");
        }
      }

      closeModal();
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2511aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      >
        {triggerLabel}
      </button>

      {isOpen ? (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  New project
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Describe your project and optionally attach any relevant
                  files.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50"
                disabled={isSubmitting}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-4"
              noValidate
            >
              <div className="space-y-1.5">
                <label
                  htmlFor="title"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
                  placeholder="Website redesign, new branding, app prototype..."
                  {...register("title")}
                  disabled={isSubmitting}
                />
                {errors.title ? (
                  <p className="text-xs text-rose-600">
                    {errors.title.message}
                  </p>
                ) : null}
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="description"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  rows={4}
                  className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
                  placeholder="Share goals, scope, and any context that will help our team."
                  {...register("description")}
                  disabled={isSubmitting}
                />
                {errors.description ? (
                  <p className="text-xs text-rose-600">
                    {errors.description.message}
                  </p>
                ) : null}
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1.5">
                  <label
                    htmlFor="budget"
                    className="text-xs font-medium uppercase tracking-wide text-slate-600"
                  >
                    Budget (USD)
                  </label>
                  <input
                    id="budget"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
                    placeholder="5000"
                    {...register("budget")}
                    disabled={isSubmitting}
                  />
                  {errors.budget ? (
                    <p className="text-xs text-rose-600">
                      {errors.budget.message}
                    </p>
                  ) : null}
                </div>

                <div className="space-y-1.5">
                  <label
                    htmlFor="deadline"
                    className="text-xs font-medium uppercase tracking-wide text-slate-600"
                  >
                    Preferred deadline
                  </label>
                  <input
                    id="deadline"
                    type="date"
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none ring-0 transition placeholder:text-slate-400 focus:border-[#330fe6] focus:ring-1 focus:ring-[#330fe6]"
                    {...register("deadline")}
                    disabled={isSubmitting}
                  />
                  {errors.deadline ? (
                    <p className="text-xs text-rose-600">
                      {errors.deadline.message}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="files"
                  className="text-xs font-medium uppercase tracking-wide text-slate-600"
                >
                  File attachments
                </label>
                <input
                  id="files"
                  type="file"
                  multiple
                  onChange={(event) => {
                    setFiles(event.target.files);
                  }}
                  disabled={isSubmitting}
                  className="block w-full text-xs text-slate-600 file:mr-3 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-slate-700 hover:file:bg-slate-200"
                />
                <p className="text-[11px] text-slate-400">
                  You can attach briefs, mockups, spreadsheets, or other
                  supporting files. Files are uploaded securely.
                </p>
              </div>

              {error ? (
                <p className="text-xs text-rose-600">{error}</p>
              ) : null}

              <div className="mt-4 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-[#330fe6] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#2511aa] disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {isSubmitting ? "Creating..." : "Create project"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
};

