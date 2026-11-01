import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId } = (await request.json()) as {
      conversationId?: string;
    };

    if (!conversationId) {
      return NextResponse.json(
        { error: "conversationId is required" },
        { status: 400 },
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: {
          select: {
            clientId: true,
            assignedToId: true,
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 });
    }

    const isClient = user.role === "CLIENT";
    const isProjectClient = conversation.project.clientId === user.id;
    const isAssignedTeamMember =
      conversation.project.assignedToId &&
      conversation.project.assignedToId === user.id;
    const isAdmin = user.role === "ADMIN";

    if (
      (isClient && !isProjectClient) ||
      (!isClient && !isAdmin && !isAssignedTeamMember)
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: {
          not: user.id,
        },
        readAt: null,
      },
      data: {
        readAt: new Date(),
      },
    });

    return NextResponse.json({ updated: result.count });
  } catch (error) {
    console.error("[POST /api/chat/read] Failed to mark messages as read", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 },
    );
  }
}

