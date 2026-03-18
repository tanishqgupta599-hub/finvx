import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Fetch all emergency contacts
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isMongoAvailable()) {
      const contactsCol = await getCollection<any>("emergencyContacts");
      if (!contactsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const contacts = await contactsCol.find({ clerkId: user.id }).toArray();
      return NextResponse.json(contacts);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }
    const contacts = await prisma.emergencyContact.findMany({ where: { userId: dbUser.id } });

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

    if (isMongoAvailable()) {
      try {
        const contactsCol = await getCollection<any>("emergencyContacts");
        if (!contactsCol) {
          throw new Error("Mongo collection unavailable");
        }
        const doc = {
          clerkId: user.id,
          name,
          phone,
          relationship: relationship || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        const res = await contactsCol.insertOne(doc);
        const contact = await contactsCol.findOne({ _id: res.insertedId });
        return NextResponse.json(contact);
      } catch {
        // fallback to Prisma below
      }
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }
    const contact = await prisma.emergencyContact.create({
      data: { userId: dbUser.id, name, phone, relationship: relationship || null },
    });

    return NextResponse.json(contact);
  } catch (error) {
    console.error("Error creating emergency contact:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
