import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Get a single loan
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
    if (isMongoAvailable()) {
      const loansCol = await getCollection<any>("loans");
      if (!loansCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const loan = await loansCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!loan) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
      }
      return NextResponse.json(loan);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const loan = await prisma.loan.findFirst({ where: { id, userId: dbUser.id } });

    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }

    return NextResponse.json(loan);
  } catch (error) {
    console.error("Error fetching loan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a loan
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
    if (isMongoAvailable()) {
      const loansCol = await getCollection<any>("loans");
      if (!loansCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.principal !== undefined) updateData.principal = Number(body.principal);
      if (body.balance !== undefined) updateData.balance = Number(body.balance);
      if (body.apr !== undefined) updateData.apr = Number(body.apr);
      if (body.monthlyPayment !== undefined) updateData.monthlyPayment = Number(body.monthlyPayment);
      updateData.updatedAt = new Date().toISOString();
      const oid = toObjectId(id);
      const res = await loansCol.updateOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id }, { $set: updateData });
      if (!res.matchedCount) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
      }
      const loan = await loansCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      return NextResponse.json(loan);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const existingLoan = await prisma.loan.findFirst({ where: { id, userId: dbUser.id } });
    if (!existingLoan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.principal !== undefined) updateData.principal = Number(body.principal);
    if (body.balance !== undefined) updateData.balance = Number(body.balance);
    if (body.apr !== undefined) updateData.apr = Number(body.apr);
    if (body.monthlyPayment !== undefined) updateData.monthlyPayment = Number(body.monthlyPayment);
    const loan = await prisma.loan.update({ where: { id }, data: updateData });

    return NextResponse.json(loan);
  } catch (error) {
    console.error("Error updating loan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a loan
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
    if (isMongoAvailable()) {
      const loansCol = await getCollection<any>("loans");
      if (!loansCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const res = await loansCol.deleteOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!res.deletedCount) {
        return NextResponse.json({ error: "Loan not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Loan deleted successfully" });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const loan = await prisma.loan.findFirst({ where: { id, userId: dbUser.id } });
    if (!loan) {
      return NextResponse.json({ error: "Loan not found" }, { status: 404 });
    }
    await prisma.loan.delete({ where: { id } });

    return NextResponse.json({ message: "Loan deleted successfully" });
  } catch (error) {
    console.error("Error deleting loan:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
