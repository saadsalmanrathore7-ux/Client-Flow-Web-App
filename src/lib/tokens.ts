import crypto from "node:crypto";
import { addHours } from "date-fns";
import { prisma } from "@/lib/prisma";

export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString("hex");
}

export async function createEmailVerificationToken(userId: string) {
  const token = generateToken(32);
  const expires = addHours(new Date(), 24);

  const record = await prisma.verificationToken.create({
    data: {
      token,
      userId,
      expires,
    },
  });

  return record;
}

export async function useEmailVerificationToken(token: string) {
  const record = await prisma.verificationToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: new Date() },
    }),
    prisma.verificationToken.delete({ where: { id: record.id } }),
  ]);

  return record;
}

export async function createPasswordResetToken(userId: string) {
  const token = generateToken(32);
  const expires = addHours(new Date(), 1);

  const record = await prisma.passwordResetToken.create({
    data: {
      token,
      userId,
      expires,
    },
  });

  return record;
}

export async function usePasswordResetToken(token: string) {
  const record = await prisma.passwordResetToken.findUnique({
    where: { token },
  });

  if (!record || record.expires < new Date()) {
    return null;
  }

  await prisma.passwordResetToken.delete({
    where: { id: record.id },
  });

  return record;
}

