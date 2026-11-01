import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const user = await getCurrentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { priceId, planId } = (await request.json()) as {
    priceId?: string;
    planId?: string;
  };

  if (!priceId || !planId) {
    return NextResponse.json({ error: "Missing priceId or planId" }, { status: 400 });
  }

  const plan = PLANS.find((p) => p.id === planId);

  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const existingSubscription = await prisma.subscription.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  let stripeCustomerId = existingSubscription?.stripeCustomerId;

  if (!stripeCustomerId) {
    const customer = await stripe.customers.create({
      email: user.email ?? undefined,
    });

    stripeCustomerId = customer.id;

    await prisma.subscription.create({
      data: {
        userId: user.id,
        stripeCustomerId,
        stripePriceId: priceId,
        plan: plan.id,
        status: "pending",
        currentPeriodEnd: new Date(),
      },
    });
  }

  const successUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?checkout=success`;
  const cancelUrl = `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/subscription?checkout=cancelled`;

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: stripeCustomerId,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      userId: user.id,
      planId: plan.id,
    },
  });

  return NextResponse.json({ url: session.url });
}

