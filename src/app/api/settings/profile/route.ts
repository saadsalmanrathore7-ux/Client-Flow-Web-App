import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

const profileSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(100, "Name must be at most 100 characters"),
  email: z.string().email("Enter a valid email address"),
});

export async function PATCH(request: Request) {
  const user = await getCurrentUser();

  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const name = formData.get("name");
    const email = formData.get("email");
    const avatar = formData.get("avatar");

    const parsed = profileSchema.safeParse({
      name: typeof name === "string" ? name : "",
      email: typeof email === "string" ? email : "",
    });

    if (!parsed.success) {
      return NextResponse.json(
        { errors: parsed.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    let avatarUrl: string | undefined;

    if (avatar instanceof File) {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

      if (!supabaseUrl || !supabaseKey) {
        console.warn(
          "[PATCH /api/settings/profile] Supabase env vars are missing; skipping avatar upload.",
        );
      } else {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const arrayBuffer = await avatar.arrayBuffer();
        const filePath = `avatars/${user.id}/${Date.now()}-${avatar.name}`;

        const { data, error } = await supabase.storage
          .from("avatars")
          .upload(filePath, arrayBuffer, {
            contentType: avatar.type || "image/jpeg",
            upsert: false,
          });

        if (error) {
          console.error(
            "[PATCH /api/settings/profile] Supabase avatar upload error",
            error,
          );
        } else {
          const { data: publicData } = supabase.storage
            .from("avatars")
            .getPublicUrl(data.path);
          avatarUrl = publicData.publicUrl;
        }
      }
    }

    const updateData: Record<string, unknown> = {
      name: parsed.data.name,
      email: parsed.data.email,
    };

    if (avatarUrl) {
      updateData.avatarUrl = avatarUrl;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: updateData,
    });

    return NextResponse.json(
      { message: "Profile updated successfully." },
      { status: 200 },
    );
  } catch (error) {
    console.error("[PATCH /api/settings/profile] Failed to update profile", error);
    return NextResponse.json(
      { error: "Failed to update profile." },
      { status: 500 },
    );
  }
}

