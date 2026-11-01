import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const notificationSettingsSchema = z.object({
  projectStatusChange: z.boolean(),
  newMessage: z.boolean(),
  paymentConfirmed: z.boolean(),
  fileUploaded: z.boolean(),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);

  const parsed = notificationSettingsSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    await prisma.user.update({
      where: { id: user.id },
      // This assumes a Json field `notificationSettings` on the User model.
      // In Prisma schema, define it as:
      // notificationSettings Json?
      data: {
        notificationSettings: parsed.data as unknown as Record<string, unknown>,
      } as any,
    });

    return NextResponse.json(
      { message: "Notification preferences updated." },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "[PATCH /api/settings/notifications] Failed to update preferences",
      error,
    );
    return NextResponse.json(
      { error: "Failed to update notification preferences." },
      { status: 500 },
    );
  }
}

