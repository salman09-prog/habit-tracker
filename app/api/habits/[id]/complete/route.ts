// app/api/habits/[id]/complete/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authConfig } from "@/lib/auth";

const RESET_HOUR = 5; // 5 AM reset

// Utility functions to handle 5 AM-based cycles
function cycleStart(date: Date, resetHour = RESET_HOUR) {
  const d = new Date(date);
  if (d.getHours() < resetHour) d.setDate(d.getDate() - 1);
  d.setHours(resetHour, 0, 0, 0);
  d.setMilliseconds(0);
  return d;
}

function previousCycleStart(date: Date, resetHour = RESET_HOUR) {
  const start = cycleStart(date, resetHour);
  const prev = new Date(start);
  prev.setDate(prev.getDate() - 1);
  return prev;
}

// Changed from PATCH(params) → PUT(req)
export async function PATCH(req: NextRequest) {
  try {
    // Extract habit ID safely from URL
    const url = new URL(req.url);
    const habitId = url.pathname.split("/").pop();

    if (!habitId) {
      return NextResponse.json({ error: "Missing habit ID" }, { status: 400 });
    }

    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Find habit belonging to this user
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId: session.user.id },
    });

    if (!habit) {
      return NextResponse.json({ error: "Habit not found" }, { status: 404 });
    }

    const now = new Date();
    const start = cycleStart(now, RESET_HOUR);
    const prevStart = previousCycleStart(now, RESET_HOUR);

    // Already completed this cycle?
    if (habit.completedAt) {
      const last = new Date(habit.completedAt);
      if (!isNaN(last.getTime()) && last.getTime() >= start.getTime()) {
        return NextResponse.json(
          { error: "Habit already completed in this cycle" },
          { status: 400 }
        );
      }
    }

    // Calculate new streak
    let newStreak = habit.streak || 0;
    if (!habit.completedAt) {
      newStreak = 1; // First ever completion
    } else {
      const last = new Date(habit.completedAt);
      const lastInPrevCycle =
        last.getTime() >= prevStart.getTime() && last.getTime() < start.getTime();

      newStreak = lastInPrevCycle ? newStreak + 1 : 1;
    }

    // Update habit completion and streak
    const updatedHabit = await prisma.habit.update({
      where: { id: habitId },
      data: {
        completedAt: now,
        streak: newStreak,
      },
    });

    return NextResponse.json({ habit: updatedHabit });
  } catch (error) {
    console.error("Habit completion error:", error);
    return NextResponse.json({ error: "Failed to complete habit" }, { status: 500 });
  }
}
