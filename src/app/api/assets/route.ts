import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable } from "@/lib/mongo";
import { getOrCreateUser } from "@/lib/user-helper";

export const dynamic = "force-dynamic";

// GET - Fetch all assets
export async function GET(request: Request) {
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (isMongoAvailable()) {
      const assetsCol = await getCollection<any>("assets");
      if (!assetsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const assets = await assetsCol.find({ clerkId: user.id }).sort({ value: -1 }).toArray();
      const totalValue = assets.reduce((sum: number, asset: any) => sum + Number(asset.value || 0), 0);
      return NextResponse.json({ assets, totalValue, count: assets.length });
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }
    const assets = await prisma.asset.findMany({
      where: { userId: dbUser.id },
      orderBy: { value: "desc" },
    });
    const totalValue = assets.reduce((sum, asset) => sum + Number(asset.value), 0);
    return NextResponse.json({ assets, totalValue, count: assets.length });
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

    if (isMongoAvailable()) {
      const assetsCol = await getCollection<any>("assets");
      if (!assetsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const doc = {
        clerkId: user.id,
        name,
        type,
        value: Number(value),
        institution: institution || null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const res = await assetsCol.insertOne(doc);
      const asset = await assetsCol.findOne({ _id: res.insertedId });
      return NextResponse.json(asset);
    }

    const dbUser = await getOrCreateUser(user);
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found. Please refresh." }, { status: 404 });
    }
    const asset = await prisma.asset.create({
      data: {
        userId: dbUser.id,
        name,
        type,
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
