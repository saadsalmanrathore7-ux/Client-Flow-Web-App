import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { cancelAtPeriodEnd } = (await request.json()) as {
    cancelAtPeriodEnd?: boolean;
  };

  if (typeof cancelAtPeriodEnd !== "boolean") {
    return NextResponse.json(
      { error: "cancelAtPeriodEnd must be a boolean" },
      { status: 400 },
    );
  }

  const subscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  if (!subscription) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  await prisma.subscription.update({
    where: {
      id: subscription.id,
    },
    data: {
      cancelAtPeriodEnd,
    },
  });

  // Optionally, you would also call Stripe's API here to update the
  // subscription's cancel_at_period_end flag so that billing aligns.

  return NextResponse.json({ ok: true });
}

