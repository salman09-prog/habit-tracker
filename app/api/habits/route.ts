// app/api/habits/route.ts
import { parseHabitText } from "@/lib/gemini-service";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-utils"; // FIX: Import from auth-utils

export async function POST(request: NextRequest) {
  try {
    // FIX: Use getCurrentUser instead of auth()
    const user = await getCurrentUser();
    const { inputText } = await request.json();

    if (!inputText?.trim()) {
      return NextResponse.json(
        { error: "Input text is required" },
        { status: 400 }
      );
    }

    const parsedHabits = await parseHabitText(inputText);

    const habit = await prisma.habit.create({
      data: {
        title: parsedHabits[0]?.activity || "Custom Habit",
        description: inputText,
        inputText: inputText,
        parsedData: parsedHabits as any,
        userId: user.id,
        completedAt: new Date(),
      },
    });

    return NextResponse.json({ habit, parsedHabits });
  } catch (error) {
    console.error("Habit creation error:", error);
    
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to create habit" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // FIX: Use getCurrentUser instead of auth()
    const user = await getCurrentUser();
    
    const habits = await prisma.habit.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ habits });
  } catch (error) {
    console.error("Habits fetch error:", error);
    
    if (error instanceof Error && error.message === "Not authenticated") {
      return NextResponse.json(
        { error: "Authentication required. Please sign in." },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to fetch habits" },
      { status: 500 }
    );
  }
}