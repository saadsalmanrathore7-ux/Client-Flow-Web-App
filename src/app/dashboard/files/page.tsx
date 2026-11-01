import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { FileUpload } from "@/components/files/FileUpload";
import { FileList } from "@/components/files/FileList";

const FILES_PRIMARY_COLOR = "#330fe6";

async function getAccessibleProjectsAndFiles(userId: string, role: string) {
  const projectWhere =
    role === "CLIENT"
      ? {
          clientId: userId,
        }
      : {};

  const [projects, files] = await Promise.all([
    prisma.project.findMany({
      where: projectWhere,
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.file.findMany({
      where: projectWhere
        ? {
            project: projectWhere,
          }
        : undefined,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        project: {
          select: {
            id: true,
            title: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
  ]);

  return { projects, files };
}

export default async function FilesPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role !== "CLIENT" && user.role !== "ADMIN") {
    return (
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-amber-900">
            Access restricted
          </h1>
          <p className="mt-1 text-sm text-amber-800">
            This page is only available to client and admin accounts.
          </p>
        </div>
      </main>
    );
  }

  const { projects, files } = await getAccessibleProjectsAndFiles(
    user.id,
    user.role,
  );

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 md:py-10">
      <header className="animate-fade-up mb-6 flex flex-col gap-3 md:mb-8 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900 md:text-3xl">
            Files
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Upload, preview, and manage files across your projects.
          </p>
        </div>
        <a
          href="/dashboard/projects"
          className="inline-flex items-center justify-center rounded-full bg-[${FILES_PRIMARY_COLOR}] px-5 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-[#2511aa] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ focusVisible: { ringColor: FILES_PRIMARY_COLOR } as any }}
        >
          View projects
        </a>
      </header>

      <section className="animate-fade-up delay-100 mb-6 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <FileUpload
          projects={projects.map((project) => ({
            id: project.id,
            title: project.title,
          }))}
          canUpload={projects.length > 0}
        />
      </section>

      <section className="animate-scale-up delay-200 space-y-4">
        <FileList
          files={files.map((file) => ({
            id: file.id,
            name: file.name,
            url: file.url,
            size: file.size,
            version: file.version,
            createdAt: file.createdAt.toISOString(),
            project: {
              id: file.project.id,
              title: file.project.title,
            },
            uploadedBy: {
              id: file.uploadedBy.id,
              name: file.uploadedBy.name,
              email: file.uploadedBy.email,
            },
          }))}
        />
      </section>
    </main>
  );
}

