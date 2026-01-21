import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { CalendarEventType } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { title, date, amount, type, isRecurring } = body;

    if (!title || !date || amount === undefined || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const event = await prisma.calendarEvent.create({
      data: {
        userId: dbUser.id,
        title,
        date: new Date(date),
        amount: Number(amount),
        type: type as CalendarEventType,
        isRecurring: Boolean(isRecurring),
      },
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating calendar event:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
