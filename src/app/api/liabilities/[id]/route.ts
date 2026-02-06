import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { LiabilityType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Get a single liability
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const liability = await prisma.liability.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!liability) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }

    return NextResponse.json(liability);
  } catch (error) {
    console.error("Error fetching liability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update a liability
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: id,
        userId: dbUser.id,
      },
    });

    if (!existingLiability) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type as LiabilityType;
    if (body.balance !== undefined) updateData.balance = Number(body.balance);
    if (body.apr !== undefined) updateData.apr = body.apr ? Number(body.apr) : null;

    const liability = await prisma.liability.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(liability);
  } catch (error) {
    console.error("Error updating liability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete a liability
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await currentUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const dbUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
    });

    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }

    const liability = await prisma.liability.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!liability) {
      return NextResponse.json({ error: "Liability not found" }, { status: 404 });
    }

    await prisma.liability.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Liability deleted successfully" });
  } catch (error) {
    console.error("Error deleting liability:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
