import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AssetType } from "@prisma/client";

export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, value, currency, tags } = body;

    // Validate required fields
    if (!name || !type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the database user first to get the internal ID
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const asset = await prisma.asset.create({
              data: {
                userId: dbUser.id,
                name,
                type: type as AssetType,
                value: Number(value),
              },
            });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
