import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = (await request.json()) as { id?: string };

    if (!id) {
      return NextResponse.json(
        { error: "id is required" },
        { status: 400 },
      );
    }

    const result = await prisma.notification.updateMany({
      where: {
        id,
        userId: user.id,
        read: false,
      },
      data: {
        read: true,
      },
    });

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    });

    return NextResponse.json({
      updated: result.count,
      unreadCount,
    });
  } catch (error) {
    console.error(
      "[POST /api/notifications/read] Failed to mark notification as read",
      error,
    );
    return NextResponse.json(
      { error: "Failed to mark notification as read" },
      { status: 500 },
    );
  }
}

