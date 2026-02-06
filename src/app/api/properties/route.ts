import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

// GET - Fetch all properties
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
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    // Using Asset model with type=property for now
    const properties = await prisma.asset.findMany({
      where: {
        userId: dbUser.id,
        type: "property",
      },
      orderBy: { value: "desc" },
    });

    const totalValue = properties.reduce((sum, prop) => sum + Number(prop.value), 0);

    return NextResponse.json({
      properties,
      summary: {
        totalValue,
        count: properties.length,
      },
    });
  } catch (error) {
    console.error("Error fetching properties:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST - Create a new property
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, purchasePrice, currentValue, purchaseDate, address, monthlyRent, ownershipPercentage, isFractional } = body;

    if (!name || purchasePrice === undefined) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const property = await prisma.asset.create({
      data: {
        userId: dbUser.id,
        name,
        type: "property",
        value: currentValue ? Number(currentValue) : Number(purchasePrice),
        institution: address || null,
      },
    });

    // Calculate ROI if rental income provided
    let annualROI = null;
    if (monthlyRent && purchasePrice) {
      const annualRent = Number(monthlyRent) * 12;
      annualROI = (annualRent / Number(purchasePrice)) * 100;
    }

    return NextResponse.json({
      ...property,
      purchasePrice: Number(purchasePrice),
      monthlyRent: monthlyRent ? Number(monthlyRent) : null,
      annualROI: annualROI ? annualROI.toFixed(2) + "%" : null,
      ownershipPercentage: ownershipPercentage ? Number(ownershipPercentage) : null,
      isFractional: isFractional || false,
    });
  } catch (error) {
    console.error("Error creating property:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
