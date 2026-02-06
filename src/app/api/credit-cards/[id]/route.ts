import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { CardBrand } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Get a single credit card
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

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!creditCard) {
      return NextResponse.json({ error: "Credit card not found" }, { status: 404 });
    }

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error("Error fetching credit card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a credit card
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

    const existingCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!existingCard) {
      return NextResponse.json({ error: "Credit card not found" }, { status: 404 });
    }

    const updateData: any = {};
    if (body.brand !== undefined) {
      const validBrands = Object.values(CardBrand);
      updateData.brand = validBrands.includes(body.brand) ? body.brand : CardBrand.other;
    }
    if (body.last4 !== undefined) updateData.last4 = body.last4;
    if (body.limit !== undefined) updateData.limit = Number(body.limit);
    if (body.balance !== undefined) updateData.balance = Number(body.balance);
    if (body.apr !== undefined) updateData.apr = body.apr ? Number(body.apr) : null;
    if (body.name !== undefined) updateData.name = body.name;
    if (body.billDueDate !== undefined) updateData.billDueDate = body.billDueDate ? new Date(body.billDueDate) : null;
    if (body.billAmount !== undefined) updateData.billAmount = body.billAmount ? Number(body.billAmount) : null;
    if (body.pointsBalance !== undefined) updateData.pointsBalance = body.pointsBalance ? Number(body.pointsBalance) : null;
    if (body.rewardProgram !== undefined) updateData.rewardProgram = body.rewardProgram;
    if (body.annualFee !== undefined) updateData.annualFee = body.annualFee ? Number(body.annualFee) : null;

    const creditCard = await prisma.creditCard.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(creditCard);
  } catch (error) {
    console.error("Error updating credit card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a credit card
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

    const creditCard = await prisma.creditCard.findFirst({
      where: {
        id,
        userId: dbUser.id,
      },
    });

    if (!creditCard) {
      return NextResponse.json({ error: "Credit card not found" }, { status: 404 });
    }

    await prisma.creditCard.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Credit card deleted successfully" });
  } catch (error) {
    console.error("Error deleting credit card:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
