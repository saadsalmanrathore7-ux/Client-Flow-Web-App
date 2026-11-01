import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pusherServer } from "@/lib/pusher";
import { sendChatNotificationEmail } from "@/lib/email";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { conversationId, body, fileUrl } = (await request.json()) as {
      conversationId?: string;
      body?: string;
      fileUrl?: string | null;
    };

    if (!conversationId || !body) {
      return NextResponse.json(
        { error: "conversationId and body are required" },
        { status: 400 },
      );
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        project: {
          select: {
            id: true,
            title: true,
            clientId: true,
            assignedToId: true,
            client: {
              select: { id: true, email: true, name: true, lastSeenAt: true },
            },
            assignedTo: {
              select: { id: true, email: true, name: true, lastSeenAt: true },
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

    const message = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        senderId: user.id,
        body,
        fileUrl: fileUrl ?? null,
      },
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
    });

    const payload = {
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
      conversationId: conversation.id,
      projectId: conversation.project.id,
    };

    if (pusherServer) {
      await pusherServer.trigger(
        `chat-${conversation.id}`,
        "new-message",
        payload,
      );
    }

    // Pseudo-logic: if the recipient has not been seen recently, send an email.
    try {
      const appUrl = process.env.APP_URL ?? "http://localhost:3000";
      const conversationUrl = `${appUrl}/dashboard/chat?conversationId=${encodeURIComponent(
        conversation.id,
      )}`;

      const THRESHOLD_MINUTES = 15;
      const thresholdMs = THRESHOLD_MINUTES * 60 * 1000;

      const now = Date.now();

      let recipientEmail: string | null = null;
      let lastSeenAt: Date | null = null;

      if (user.role === "CLIENT") {
        recipientEmail = conversation.project.assignedTo?.email ?? null;
        lastSeenAt =
          (conversation.project.assignedTo as any)?.lastSeenAt ?? null;
      } else {
        recipientEmail = conversation.project.client.email ?? null;
        lastSeenAt = (conversation.project.client as any)?.lastSeenAt ?? null;
      }

      if (
        recipientEmail &&
        (!lastSeenAt || now - new Date(lastSeenAt).getTime() > thresholdMs)
      ) {
        await sendChatNotificationEmail({
          to: recipientEmail,
          previewText: body.slice(0, 120),
          conversationUrl,
        });
      }
    } catch (emailError) {
      console.warn(
        "[POST /api/chat/messages] Failed to send chat notification email",
        emailError,
      );
    }

    return NextResponse.json(payload, { status: 201 });
  } catch (error) {
    console.error("[POST /api/chat/messages] Failed to create message", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 },
    );
  }
}

