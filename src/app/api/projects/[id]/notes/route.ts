import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type AddNoteBody = {
  note: string;
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

    const body = (await request.json()) as AddNoteBody;

    if (!body.note || body.note.trim().length === 0) {
      return NextResponse.json(
        { error: "Note cannot be empty" },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const activity = await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: id,
        action: "ADMIN_NOTE",
        meta: {
          note: body.note,
        } as unknown as Record<string, unknown>,
      },
    });

    return NextResponse.json(
      {
        id: activity.id,
        note: body.note,
        createdAt: activity.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error(
      "[PATCH /api/projects/:id/notes] Failed to add note",
      error,
    );
    return NextResponse.json(
      { error: "Failed to add note" },
      { status: 500 },
    );
  }
}

