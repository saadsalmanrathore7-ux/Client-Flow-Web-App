import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const project = await prisma.project.findUnique({
      where: { id },
      select: { id: true, clientId: true },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    if (user.role === "CLIENT" && project.clientId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await request.formData();
    const primaryFiles = formData.getAll("files");
    const altFiles = formData.getAll("files[]");

    const rawFiles = [...primaryFiles, ...altFiles].filter(
      (file): file is File => file instanceof File,
    );

    if (rawFiles.length === 0) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 },
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "[POST /api/projects/:id/files] Supabase environment variables are not set. Skipping actual upload.",
      );
    }

    const supabase =
      supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

    const createdFiles = [];

    for (const file of rawFiles) {
      let publicUrl = "#";
      let size = file.size;

      if (supabase) {
        const arrayBuffer = await file.arrayBuffer();
        const filePath = `projects/${project.id}/${Date.now()}-${
          file.name
        }`;

        const { data, error } = await supabase.storage
          .from("project-files")
          .upload(filePath, arrayBuffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (error) {
          console.error("Supabase upload error", error);
          continue;
        }

        const { data: publicData } = supabase.storage
          .from("project-files")
          .getPublicUrl(data.path);

        publicUrl = publicData.publicUrl;
      }

      const created = await prisma.file.create({
        data: {
          projectId: project.id,
          uploadedById: user.id,
          name: file.name,
          url: publicUrl,
          size,
        },
      });

      createdFiles.push(created);

      await prisma.activityLog.create({
        data: {
          userId: user.id,
          projectId: project.id,
          action: "FILE_UPLOADED",
          meta: {
            fileId: created.id,
            fileName: created.name,
            fileSize: created.size,
          } as unknown as Record<string, unknown>,
        },
      });
    }

    if (createdFiles.length === 0) {
      return NextResponse.json(
        { error: "Failed to upload files" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      createdFiles.map((file) => ({
        id: file.id,
        name: file.name,
        url: file.url,
        size: file.size,
        createdAt: file.createdAt,
      })),
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/projects/:id/files] Failed to upload files", error);
    return NextResponse.json(
      { error: "Failed to upload files" },
      { status: 500 },
    );
  }
}

