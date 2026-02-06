import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all vault documents
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

    const docs = await prisma.vaultDocument.findMany({
      where: { userId: dbUser.id },
      orderBy: { dateAdded: "desc" },
    });

    return NextResponse.json(docs);
  } catch (error) {
    console.error("Error fetching vault documents:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new vault document
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, category, tags, url } = body;

    // Validate required fields
    if (!name || !category) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the database user first to get the internal ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const doc = await prisma.vaultDocument.create({
      data: {
        userId: dbUser.id,
        name,
        category,
        tags: tags || [],
        url: url || null,
      },
    });

    return NextResponse.json(doc);
  } catch (error) {
    console.error("Error creating vault document:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
