import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { AssetType } from "@prisma/client";
import { getOrCreateUser } from "@/lib/user-helper";

export const dynamic = "force-dynamic";

// GET - Fetch all assets
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await getOrCreateUser(user);

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const assets = await prisma.asset.findMany({
      where: { userId: dbUser.id },
      orderBy: { value: "desc" },
    });

    const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0);

    return NextResponse.json({
      assets,
      totalValue,
      count: assets.length,
    });
  } catch (error) {
    console.error("Error fetching assets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST - Create a new asset
export async function POST(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, type, value, institution } = body;

    // Validate required fields
    if (!name || !type || value === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the database user first to get the internal ID
    const dbUser = await getOrCreateUser(user);

    if (!dbUser) {
        return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }

    const asset = await prisma.asset.create({
      data: {
        userId: dbUser.id,
        name,
        type: type as AssetType,
        value: Number(value),
        institution: institution || null,
      },
    });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error creating asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
