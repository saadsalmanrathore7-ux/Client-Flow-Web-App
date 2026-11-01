import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "New password must be at least 8 characters"),
    confirmNewPassword: z.string().min(1, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Passwords do not match",
    path: ["confirmNewPassword"],
  });

export async function POST(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const json = await request.json().catch(() => null);

  const parsed = passwordSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { passwordHash: true },
    });

    if (!dbUser?.passwordHash) {
      return NextResponse.json(
        { error: "Unable to change password for this account." },
        { status: 400 },
      );
    }

    const isValid = await bcrypt.compare(
      parsed.data.currentPassword,
      dbUser.passwordHash,
    );

    if (!isValid) {
      return NextResponse.json(
        { error: "Current password is incorrect." },
        { status: 400 },
      );
    }

    const newHash = await bcrypt.hash(parsed.data.newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash: newHash },
    });

    // Optionally, we could invalidate other sessions here by deleting them
    // from the Session table based on userId.

    return NextResponse.json(
      { message: "Password updated successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/settings/password] Failed to update password", error);
    return NextResponse.json(
      { error: "Failed to update password." },
      { status: 500 },
    );
  }
}

