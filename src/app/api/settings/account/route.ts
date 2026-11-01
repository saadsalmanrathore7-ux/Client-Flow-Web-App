import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function DELETE() {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // For simplicity, this route fully deletes the user.
    // Thanks to onDelete: Cascade on many relations (Session, Project,
    // Subscription, Payment, File, etc.), related records will also be
    // removed automatically where configured. For relations without cascade
    // configured (like ActivityLog.user), records will remain but can be
    // anonymized or cleaned up separately if needed.
    await prisma.user.delete({
      where: { id: user.id },
    });

    // The client is responsible for calling `signOut` and redirecting
    // after this request succeeds.

    return NextResponse.json(
      { message: "Account deleted successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[DELETE /api/settings/account] Failed to delete account", error);
    return NextResponse.json(
      { error: "Failed to delete account." },
      { status: 500 },
    );
  }
}

