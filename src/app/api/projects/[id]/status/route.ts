import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { ProjectStatus } from "@/generated/prisma/enums";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateStatusBody = {
  status: keyof typeof ProjectStatus;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = (await request.json()) as UpdateStatusBody;

    if (!body.status || !(body.status in ProjectStatus)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const updated = await prisma.project.update({
      where: { id },
      data: {
        status: body.status,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: project.id,
        action: "PROJECT_STATUS_UPDATED",
        meta: {
          fromStatus: project.status,
          toStatus: updated.status,
        } as unknown as Record<string, unknown>,
      },
    });

    return NextResponse.json(
      {
        id: updated.id,
        status: updated.status,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[PATCH /api/projects/:id/status] Failed to update status",
      error,
    );
    return NextResponse.json(
      { error: "Failed to update status" },
      { status: 500 },
    );
  }
}

