// app/api/habits/[id]/route.ts
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  req: NextRequest
) {

        const url = new URL(req.url);
    const habitId = url.pathname.split("/").pop();
  try {
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }


    const del = await prisma.habit.deleteMany({
      where: { id: habitId, userId: session.user.id },
    });

    if (del.count === 0) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("Habit delete error:", e);
    return NextResponse.json({ error: "Failed to delete habit" }, { status: 500 });
  }
}
