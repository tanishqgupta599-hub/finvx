import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all emergency contacts
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const contacts = await prisma.emergencyContact.findMany({
      where: { userId: dbUser.id },
    });

    return NextResponse.json(contacts);
  } catch (error) {
    console.error("Error fetching emergency contacts:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new emergency contact
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, phone, relationship } = body;

    // Validate required fields
    if (!name || !phone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the database user first to get the internal ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const contact = await prisma.emergencyContact.create({
      data: {
        userId: dbUser.id,
        name,
        phone,
        relationship: relationship || null,
      },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
