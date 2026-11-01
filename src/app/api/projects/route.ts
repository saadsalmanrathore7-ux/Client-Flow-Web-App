import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type CreateProjectBody = {
  title: string;
  description: string;
  budget: string | number;
  deadline?: string | null;
};

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as CreateProjectBody;

    if (!body.title || !body.description || body.budget === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const budgetNumber =
      typeof body.budget === "string"
        ? Number.parseFloat(body.budget)
        : body.budget;

    if (!Number.isFinite(budgetNumber) || budgetNumber <= 0) {
      return NextResponse.json(
        { error: "Budget must be a positive number" },
        { status: 400 },
      );
    }

    const deadlineDate =
      body.deadline && typeof body.deadline === "string"
        ? new Date(body.deadline)
        : null;

    const project = await prisma.project.create({
      data: {
        title: body.title,
        description: body.description,
        budget: budgetNumber.toString(),
        deadline: deadlineDate,
        clientId: user.id,
      },
    });

    await prisma.activityLog.create({
      data: {
        userId: user.id,
        projectId: project.id,
        action: "PROJECT_CREATED",
        meta: {
          title: project.title,
          budget: project.budget.toString(),
          deadline: project.deadline,
        } as unknown as Record<string, unknown>,
      },
    });

    return NextResponse.json(
      {
        id: project.id,
        title: project.title,
        status: project.status,
        budget: project.budget.toString(),
        deadline: project.deadline,
        createdAt: project.createdAt,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("[POST /api/projects] Failed to create project", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 },
    );
  }
}

