import Stripe from "stripe";
import { NextResponse, type NextRequest } from "next/server";

import { prisma } from "@/lib/prisma";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

export async function POST(request: NextRequest) {
  const signature = request.headers.get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET as string,
    );
  } catch (err) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;

      // Example pseudo-logic:
      // - Read session.customer (Stripe customer ID)
      // - Read session.metadata.userId and session.metadata.planId
      // - Create or update Subscription row:
      //   await prisma.subscription.upsert({ ... })
      // - Optionally create initial Payment record based on session.invoice or latest invoice.
      break;
    }

    case "invoice.payment_succeeded": {
      const invoice = event.data.object as Stripe.Invoice;

      // Example pseudo-logic:
      // - Determine user by invoice.customer or metadata.userId
      // - Upsert Subscription to set:
      //   - status = "active"
      //   - currentPeriodEnd = new Date(invoice.lines.data[0].period.end * 1000)
      // - Create Payment row:
      //   await prisma.payment.create({
      //     data: {
      //       userId,
      //       stripePaymentIntentId: invoice.payment_intent as string,
      //       amount: invoice.amount_paid,
      //       currency: invoice.currency,
      //       status: "succeeded",
      //       // Optionally store invoice.hosted_invoice_url in a future invoiceUrl field.
      //     },
      //   });
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;

      // Example pseudo-logic:
      // - Find local Subscription by stripeCustomerId or metadata.userId
      // - Update local Subscription status to "canceled"
      //   await prisma.subscription.update({ ... })
      break;
    }

    default: {
      break;
    }
  }

  return NextResponse.json({ received: true });
}

