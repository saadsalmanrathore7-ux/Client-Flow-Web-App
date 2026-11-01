import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const file = await prisma.file.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            clientId: true,
          },
        },
      },
    });

    if (!file) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    const isAdmin = user.role === "ADMIN";
    const isProjectClient = file.project.clientId === user.id;

    if (!isAdmin && !isProjectClient) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.warn(
        "[DELETE /api/files/:id] Supabase environment variables are not set. Skipping actual delete.",
      );
    }

    const supabase =
      supabaseUrl && supabaseKey
        ? createClient(supabaseUrl, supabaseKey)
        : null;

    if (supabase && file.url && file.url !== "#") {
      try {
        const url = new URL(file.url);
        const [, , ...pathParts] = url.pathname.split("/");
        const path = pathParts.join("/");

        if (path) {
          const { error } = await supabase.storage
            .from("project-files")
            .remove([path]);

          if (error) {
            console.error("Supabase delete error", error);
          }
        }
      } catch (parseError) {
        console.warn(
          "[DELETE /api/files/:id] Failed to parse file URL for deletion",
          parseError,
        );
      }
    }

    await prisma.file.delete({
      where: { id: file.id },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: file.project.id,
        action: "FILE_DELETED",
        meta: {
          fileId: file.id,
          fileName: file.name,
          fileSize: file.size,
          fileVersion: file.version,
        } as unknown as Record<string, unknown>,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[DELETE /api/files/:id] Failed to delete file", error);
    return NextResponse.json(
      { error: "Failed to delete file" },
      { status: 500 },
    );
  }
}

