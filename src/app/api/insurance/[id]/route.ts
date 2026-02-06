import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { PolicyType } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Get a single insurance policy
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
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        id: id,
        userId: dbUser.id,
      },
    });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Error fetching insurance policy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update an insurance policy
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
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const existingPolicy = await prisma.insurancePolicy.findFirst({
      where: {
        id: id,
        userId: dbUser.id,
      },
    });

    if (!existingPolicy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.type !== undefined) updateData.type = body.type as PolicyType;
    if (body.provider !== undefined) updateData.provider = body.provider;
    if (body.premium !== undefined) updateData.premium = Number(body.premium);
    if (body.coverageAmount !== undefined) updateData.coverageAmount = body.coverageAmount ? Number(body.coverageAmount) : null;
    if (body.renewalDate !== undefined) updateData.renewalDate = body.renewalDate ? new Date(body.renewalDate) : null;

    const policy = await prisma.insurancePolicy.update({
      where: { id: id },
      data: updateData,
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error("Error updating insurance policy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an insurance policy
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
      return NextResponse.json(
        { error: "User profile not found" },
        { status: 404 }
      );
    }

    const policy = await prisma.insurancePolicy.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 });
    }

    await prisma.insurancePolicy.delete({
      where: { id: id },
    });

    return NextResponse.json({ message: "Insurance policy deleted successfully" });
  } catch (error) {
    console.error("Error deleting insurance policy:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
