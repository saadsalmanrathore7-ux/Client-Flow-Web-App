import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const baseWhere =
      user.role === "CLIENT"
        ? {
            project: {
              clientId: user.id,
            },
          }
        : {};

    const conversations = await prisma.conversation.findMany({
      where: baseWhere,
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
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            body: true,
            createdAt: true,
            senderId: true,
          },
        },
        _count: {
          select: {
            messages: {
              where: {
                readAt: null,
                NOT: {
                  senderId: user.id,
                },
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const payload = conversations.map((conversation) => {
      const lastMessage = conversation.messages[0] ?? null;

      return {
        id: conversation.id,
        projectId: conversation.project.id,
        projectTitle: conversation.project.title,
        lastMessageBody: lastMessage?.body ?? null,
        lastMessageAt: lastMessage?.createdAt ?? conversation.createdAt,
        unreadCount: (conversation._count as any).messages ?? 0,
      };
    });

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[GET /api/chat/conversations] Failed to list conversations", error);
    return NextResponse.json(
      { error: "Failed to load conversations" },
      { status: 500 },
    );
  }
}

