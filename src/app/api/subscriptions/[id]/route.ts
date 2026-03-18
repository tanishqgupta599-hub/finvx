import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";
import { SubscriptionCadence } from "@prisma/client";

export const dynamic = "force-dynamic";

// GET - Get a single subscription
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
      const subsCol = await getCollection<any>("subscriptions");
      if (!subsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const subscription = await subsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!subscription) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      return NextResponse.json(subscription);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const subscription = await prisma.subscription.findFirst({ where: { id, userId: dbUser.id } });

    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error fetching subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH - Update a subscription
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
      const subsCol = await getCollection<any>("subscriptions");
      if (!subsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.amount !== undefined) updateData.amount = Number(body.amount);
      if (body.cadence !== undefined) updateData.cadence = body.cadence;
      if (body.nextChargeDate !== undefined) updateData.nextChargeDate = new Date(body.nextChargeDate);
      updateData.updatedAt = new Date().toISOString();
      const oid = toObjectId(id);
      const res = await subsCol.updateOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id }, { $set: updateData });
      if (!res.matchedCount) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      const subscription = await subsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      return NextResponse.json(subscription);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const existingSubscription = await prisma.subscription.findFirst({ where: { id, userId: dbUser.id } });
    if (!existingSubscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.amount !== undefined) updateData.amount = Number(body.amount);
    if (body.cadence !== undefined) updateData.cadence = body.cadence as SubscriptionCadence;
    if (body.nextChargeDate !== undefined) updateData.nextChargeDate = new Date(body.nextChargeDate);
    const subscription = await prisma.subscription.update({ where: { id }, data: updateData });

    return NextResponse.json(subscription);
  } catch (error) {
    console.error("Error updating subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a subscription
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
      const subsCol = await getCollection<any>("subscriptions");
      if (!subsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const res = await subsCol.deleteOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!res.deletedCount) {
        return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Subscription deleted successfully" });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const subscription = await prisma.subscription.findFirst({ where: { id, userId: dbUser.id } });
    if (!subscription) {
      return NextResponse.json({ error: "Subscription not found" }, { status: 404 });
    }
    await prisma.subscription.delete({ where: { id } });

    return NextResponse.json({ message: "Subscription deleted successfully" });
  } catch (error) {
    console.error("Error deleting subscription:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
