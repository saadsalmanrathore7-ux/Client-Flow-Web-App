import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

type UpdateClientStatusBody = {
  status: "active" | "suspended";
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

    const body = (await request.json()) as UpdateClientStatusBody;

    if (body.status !== "active" && body.status !== "suspended") {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 },
      );
    }

    const client = await prisma.user.findUnique({
      where: { id },
    });

    if (!client || client.role !== "CLIENT") {
      return NextResponse.json({ error: "Client not found" }, { status: 404 });
    }

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: null,
        action: "CLIENT_STATUS_UPDATED",
        meta: {
          status: body.status,
        } as unknown as Record<string, unknown>,
      },
    });

    return NextResponse.json(
      {
        id: client.id,
        status: body.status,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[PATCH /api/admin/clients/:id/status] Failed to update client status",
      error,
    );
    return NextResponse.json(
      { error: "Failed to update client status" },
      { status: 500 },
    );
  }
}

