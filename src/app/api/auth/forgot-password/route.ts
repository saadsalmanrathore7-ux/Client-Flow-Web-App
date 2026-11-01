import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createPasswordResetToken } from "@/lib/tokens";
import { sendPasswordResetEmail } from "@/lib/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = forgotPasswordSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true },
  });

  // Always respond successfully even if user does not exist to avoid leaking accounts.
  if (!user) {
    return NextResponse.json(
      {
        message:
          "If an account with that email exists, you will receive a password reset link shortly.",
      },
      { status: 200 },
    );
  }

  const tokenRecord = await createPasswordResetToken(user.id);

  await sendPasswordResetEmail({
    to: user.email!,
    token: tokenRecord.token,
  });

  return NextResponse.json(
    {
      message:
        "If an account with that email exists, you will receive a password reset link shortly.",
    },
    { status: 200 },
  );
}

