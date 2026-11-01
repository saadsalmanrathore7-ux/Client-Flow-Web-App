import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

export const prisma =
  global.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(
      new Pool({
        connectionString: process.env.DATABASE_URL,
        // Fail fast instead of hanging for 75 s
        connectionTimeoutMillis: 10_000,
        // Release idle connections quickly (important for serverless)
        idleTimeoutMillis: 30_000,
        // Keep pool small in dev
        max: 5,
      }),
    ),
  });

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

