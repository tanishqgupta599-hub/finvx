import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Get a single friend
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
      const friendsCol = await getCollection<any>("friends");
      if (!friendsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const friend = await friendsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!friend) {
        return NextResponse.json({ error: "Friend not found" }, { status: 404 });
      }
      return NextResponse.json(friend);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const friend = await prisma.friend.findFirst({ where: { id, userId: dbUser.id } });

    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }

    return NextResponse.json(friend);
  } catch (error) {
    console.error("Error fetching friend:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update a friend
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
      const friendsCol = await getCollection<any>("friends");
      if (!friendsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.email !== undefined) updateData.email = body.email;
      if (body.phone !== undefined) updateData.phone = body.phone;
      if (body.relationType !== undefined) updateData.relationType = body.relationType;
      if (body.balance !== undefined) updateData.balance = Number(body.balance);
      if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
      updateData.updatedAt = new Date().toISOString();
      const oid = toObjectId(id);
      const res = await friendsCol.updateOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id }, { $set: updateData });
      if (!res.matchedCount) {
        return NextResponse.json({ error: "Friend not found" }, { status: 404 });
      }
      const friend = await friendsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      return NextResponse.json(friend);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const existingFriend = await prisma.friend.findFirst({ where: { id: id, userId: dbUser.id } });
    if (!existingFriend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.email !== undefined) updateData.email = body.email;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.relationType !== undefined) updateData.relationType = body.relationType;
    if (body.balance !== undefined) updateData.balance = Number(body.balance);
    if (body.avatarUrl !== undefined) updateData.avatarUrl = body.avatarUrl;
    const friend = await prisma.friend.update({ where: { id }, data: updateData });

    return NextResponse.json(friend);
  } catch (error) {
    console.error("Error updating friend:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete a friend
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
      const friendsCol = await getCollection<any>("friends");
      if (!friendsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const res = await friendsCol.deleteOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!res.deletedCount) {
        return NextResponse.json({ error: "Friend not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Friend deleted successfully" });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const friend = await prisma.friend.findFirst({ where: { id, userId: dbUser.id } });
    if (!friend) {
      return NextResponse.json({ error: "Friend not found" }, { status: 404 });
    }
    await prisma.friend.delete({ where: { id } });

    return NextResponse.json({ message: "Friend deleted successfully" });
  } catch (error) {
    console.error("Error deleting friend:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
