import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await prisma.$connect();
    // Try a simple query to verify full connectivity
    const userCount = await prisma.user.count();
    return NextResponse.json({ 
      status: "success", 
      message: "Database connected successfully",
      userCount 
    });
  } catch (error) {
    console.error("Database connection error:", error);
    return NextResponse.json({ 
      status: "error", 
      message: "Database connection failed",
      error: String(error) 
    }, { status: 500 });
  }
}
