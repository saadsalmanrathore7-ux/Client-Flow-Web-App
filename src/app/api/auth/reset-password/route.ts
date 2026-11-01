import { NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { usePasswordResetToken } from "@/lib/tokens";

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = resetPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { token, password } = parsed.data;

  const tokenRecord = await usePasswordResetToken(token);

  if (!tokenRecord) {
    return NextResponse.json(
      { message: "This reset link is invalid or has expired." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.user.update({
    where: { id: tokenRecord.userId },
    data: { passwordHash },
  });

  return NextResponse.json(
    { message: "Your password has been updated. You can now log in." },
    { status: 200 },
  );
}

