import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import prisma from "@/lib/db";
import { getCollection, isMongoAvailable, toObjectId } from "@/lib/mongo";

export const dynamic = "force-dynamic";

// GET - Get a single asset
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
      const assetsCol = await getCollection<any>("assets");
      if (!assetsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const asset = await assetsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!asset) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      return NextResponse.json(asset);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const asset = await prisma.asset.findFirst({ where: { id, userId: dbUser.id } });

    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error fetching asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// PATCH - Update an asset
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
      const assetsCol = await getCollection<any>("assets");
      if (!assetsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const updateData: any = {};
      if (body.name !== undefined) updateData.name = body.name;
      if (body.type !== undefined) updateData.type = body.type;
      if (body.value !== undefined) updateData.value = Number(body.value);
      if (body.institution !== undefined) updateData.institution = body.institution;
      updateData.updatedAt = new Date().toISOString();
      const oid = toObjectId(id);
      const res = await assetsCol.updateOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id }, { $set: updateData });
      if (!res.matchedCount) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      const asset = await assetsCol.findOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      return NextResponse.json(asset);
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const existingAsset = await prisma.asset.findFirst({ where: { id, userId: dbUser.id } });
    if (!existingAsset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    const updateData: any = {};
    if (body.name !== undefined) updateData.name = body.name;
    if (body.type !== undefined) updateData.type = body.type;
    if (body.value !== undefined) updateData.value = Number(body.value);
    if (body.institution !== undefined) updateData.institution = body.institution;
    const asset = await prisma.asset.update({ where: { id }, data: updateData });

    return NextResponse.json(asset);
  } catch (error) {
    console.error("Error updating asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// DELETE - Delete an asset
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
      const assetsCol = await getCollection<any>("assets");
      if (!assetsCol) {
        return NextResponse.json({ error: "Database unavailable" }, { status: 503 });
      }
      const oid = toObjectId(id);
      const res = await assetsCol.deleteOne(oid ? { _id: oid, clerkId: user.id } : { _id: id as any, clerkId: user.id });
      if (!res.deletedCount) {
        return NextResponse.json({ error: "Asset not found" }, { status: 404 });
      }
      return NextResponse.json({ message: "Asset deleted successfully" });
    }

    const dbUser = await prisma.user.findUnique({ where: { clerkId: user.id } });
    if (!dbUser) {
      return NextResponse.json({ error: "User profile not found" }, { status: 404 });
    }
    const asset = await prisma.asset.findFirst({ where: { id, userId: dbUser.id } });
    if (!asset) {
      return NextResponse.json({ error: "Asset not found" }, { status: 404 });
    }
    await prisma.asset.delete({ where: { id } });

    return NextResponse.json({ message: "Asset deleted successfully" });
  } catch (error) {
    console.error("Error deleting asset:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
