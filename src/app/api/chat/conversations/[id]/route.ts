import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientId: true,
            assignedToId: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
              },
            },
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

    const payload = {
      id: conversation.id,
      projectId: conversation.project.id,
      projectTitle: conversation.project.title,
      messages: conversation.messages.map((message) => ({
        id: message.id,
        body: message.body,
        fileUrl: message.fileUrl,
        createdAt: message.createdAt,
        readAt: message.readAt,
        senderId: message.senderId,
        sender: {
          id: message.sender.id,
          name: message.sender.name,
          email: message.sender.email,
          role: message.sender.role,
        },
      })),
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error(
      "[GET /api/chat/conversations/:id] Failed to fetch conversation",
      error,
    );
    return NextResponse.json(
      { error: "Failed to load conversation" },
      { status: 500 },
    );
  }
}

