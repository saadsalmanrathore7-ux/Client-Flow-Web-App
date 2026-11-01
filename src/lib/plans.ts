export type SubscriptionPlanId = "basic" | "standard" | "premium";

export type SubscriptionPlan = {
  id: SubscriptionPlanId;
  name: string;
  price: number;
  priceLabel: string;
  description: string;
  stripePriceId: string;
  features: string[];
};

export const PLANS: SubscriptionPlan[] = [
  {
    id: "basic",
    name: "Basic",
    price: 29,
    priceLabel: "$29/mo",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID as string,
    description: "For solo clients getting started with 1–2 projects.",
    features: [
      "Up to 3 active projects",
      "Email support within 24 hours",
      "Basic project timelines",
      "Secure file sharing",
    ],
  },
  {
    id: "standard",
    name: "Standard",
    price: 79,
    priceLabel: "$79/mo",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STANDARD_PRICE_ID as string,
    description: "For growing teams that need more collaboration.",
    features: [
      "Unlimited active projects",
      "Priority email support",
      "Advanced project analytics",
      "Team collaboration workspace",
      "Custom branding on client portal",
    ],
  },
  {
    id: "premium",
    name: "Premium",
    price: 149,
    priceLabel: "$149/mo",
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID as string,
    description: "For agencies that need white-glove support.",
    features: [
      "Everything in Standard",
      "Dedicated success manager",
      "Quarterly strategy reviews",
      "Custom SLA & onboarding",
      "Early access to new features",
    ],
  },
];

