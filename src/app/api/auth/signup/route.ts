import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { createEmailVerificationToken } from "@/lib/tokens";
import { sendVerificationEmail } from "@/lib/email";

const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);

  const parsed = signupSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { errors: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const { name, email, password } = parsed.data;

  const existing = await prisma.user.findUnique({
    where: { email },
  });

  if (existing) {
    return NextResponse.json(
      { message: "An account with this email already exists." },
      { status: 400 },
    );
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role: "CLIENT",
    },
  });

  // Try to send verification email; don't fail signup if this fails (e.g. missing Resend/table)
  try {
    const tokenRecord = await createEmailVerificationToken(user.id);
    await sendVerificationEmail({
      to: user.email,
      token: tokenRecord.token,
    });
  } catch (e) {
    console.error("[signup] Verification token or email failed:", e);
  }

  return NextResponse.json(
    {
      message:
        "Account created. You can log in now.",
    },
    { status: 201 },
  );
}

