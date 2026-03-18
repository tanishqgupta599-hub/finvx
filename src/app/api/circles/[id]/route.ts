import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Get a single expense circle
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
      const circlesCol = await getCollection<any>("circles");
      const expensesCol = await getCollection<any>("sharedExpenses");
      if (!circlesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const circleDoc = await circlesCol.findOne(
        oid
          ? { _id: oid, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
          : { _id: id as any, $or: [{ ownerClerkId: user.id }, { memberClerkIds: user.id }] }
      );
      if (!circleDoc) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }
      const expenses = expensesCol
        ? await expensesCol.find({ circleId: (circleDoc._id as any).toString() }).sort({ date: -1 }).toArray()
        : [];
      const members = (circleDoc.memberClerkIds || []).map((cid: string) => ({ id: cid, name: null, email: null }));
      const owner = { id: circleDoc.ownerClerkId, name: null, email: null };
      const balances: Record<string, number> = {};
      members.forEach((m) => (balances[m.id] = 0));
      balances[owner.id] = 0;
      expenses.forEach((expense: any) => {
        const paidBy = String(expense.paidById);
        const amount = Number(expense.amount);
        const splitType = expense.splitType;
        if (splitType === "equal") {
          const totalMembers = members.length + 1;
          const perPerson = amount / totalMembers;
          balances[paidBy] = (balances[paidBy] || 0) + amount;
          members.forEach((member: any) => {
            if (member.id !== paidBy) {
              balances[member.id] = (balances[member.id] || 0) - perPerson;
            }
          });
          if (owner.id !== paidBy) {
            balances[owner.id] = (balances[owner.id] || 0) - perPerson;
          }
        }
      });
      return NextResponse.json({
        id: circleDoc._id,
        name: circleDoc.name,
        description: circleDoc.description || null,
        emoji: circleDoc.emoji || null,
        owner,
        members,
        expenses,
        balances,
        createdAt: circleDoc.createdAt,
        updatedAt: circleDoc.updatedAt,
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.findFirst({
      where: { id, OR: [{ ownerId: dbUser.id }, { members: { some: { id: dbUser.id } } }] },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
        expenses: { orderBy: { date: "desc" } },
      },
    });

    if (!circle) {
      return NextResponse.json({ error: "Circle not found" }, { status: 404 });
    }

    // Calculate balances for each member
    const balances: Record<string, number> = {};
    circle.members.forEach((member) => {
      balances[member.id] = 0;
    });
    balances[circle.owner.id] = 0;

    circle.expenses.forEach((expense) => {
      const paidBy = expense.paidById;
      const amount = Number(expense.amount);
      const splitType = expense.splitType;

      if (splitType === "equal") {
        const totalMembers = circle.members.length + 1; // +1 for owner
        const perPerson = amount / totalMembers;
        
        // Person who paid gets credited
        balances[paidBy] = (balances[paidBy] || 0) + amount;
        
        // Everyone else owes their share
        circle.members.forEach((member) => {
          if (member.id !== paidBy) {
            balances[member.id] = (balances[member.id] || 0) - perPerson;
          }
        });
        if (circle.owner.id !== paidBy) {
          balances[circle.owner.id] = (balances[circle.owner.id] || 0) - perPerson;
        }
      }
    });

    return NextResponse.json({
      ...circle,
      balances,
    });
  } catch (error) {
    console.error("Error fetching expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update an expense circle
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
    const { name, description, emoji, memberIds } = body;

    if (isMongoAvailable()) {
      const circlesCol = await getCollection<any>("circles");
      if (!circlesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const circle = await circlesCol.findOne(oid ? { _id: oid } : { _id: id as any });
      if (!circle || circle.ownerClerkId !== user.id) {
        return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
      }
      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (emoji !== undefined) updateData.emoji = emoji;
      if (memberIds !== undefined) updateData.memberClerkIds = memberIds;
      updateData.updatedAt = new Date().toISOString();
      const res = await circlesCol.updateOne(oid ? { _id: oid } : { _id: id as any }, { $set: updateData });
      if (!res.matchedCount) {
        return NextResponse.json({ error: "Circle not found" }, { status: 404 });
      }
      const updated = await circlesCol.findOne(oid ? { _id: oid } : { _id: id as any });
      return NextResponse.json({
        id: updated!._id,
        name: updated!.name,
        description: updated!.description || null,
        emoji: updated!.emoji || null,
        owner: { id: updated!.ownerClerkId, name: null, email: null },
        members: (updated!.memberClerkIds || []).map((cid: string) => ({ id: cid, name: null, email: null })),
        createdAt: updated!.createdAt,
        updatedAt: updated!.updatedAt,
      });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.findFirst({ where: { id, ownerId: dbUser.id } });
    if (!circle) {
      return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
    }
    const updateData: any = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (emoji !== undefined) updateData.emoji = emoji;
    const updatedCircle = await prisma.expenseCircle.update({
      where: { id },
      data: {
        ...updateData,
        ...(memberIds !== undefined && { members: { set: memberIds.map((id: string) => ({ id })) } }),
      },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: { select: { id: true, name: true, email: true } },
      },
    });

    return NextResponse.json(updatedCircle);
  } catch (error) {
    console.error("Error updating expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete an expense circle
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
      const circlesCol = await getCollection<any>("circles");
      const expensesCol = await getCollection<any>("sharedExpenses");
      if (!circlesCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const circle = await circlesCol.findOne(oid ? { _id: oid } : { _id: id as any });
      if (!circle || circle.ownerClerkId !== user.id) {
        return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
      }
      await circlesCol.deleteOne(oid ? { _id: oid } : { _id: id as any });
      if (expensesCol) {
        await expensesCol.deleteMany({ circleId: (circle._id as any).toString() });
      }
      return NextResponse.json({ message: "Circle deleted successfully" });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const circle = await prisma.expenseCircle.findFirst({ where: { id, ownerId: dbUser.id } });
    if (!circle) {
      return NextResponse.json({ error: "Circle not found or unauthorized" }, { status: 404 });
    }
    await prisma.expenseCircle.delete({ where: { id } });

    return NextResponse.json({ message: "Circle deleted successfully" });
  } catch (error) {
    console.error("Error deleting expense circle:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
