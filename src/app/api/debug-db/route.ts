import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // 1. Check Environment Variable
    const dbUrl = process.env.DATABASE_URL;
    const isDefined = !!dbUrl;
    const maskedUrl = isDefined 
      ? `${dbUrl.substring(0, 15)}...${dbUrl.substring(dbUrl.length - 5)}` 
      : "UNDEFINED";

    // 2. Attempt Database Query
    // We use a simple count query or a raw query to verify connection
    const userCount = await prisma.user.count();

    return NextResponse.json({
      status: "success",
      message: "Database connection established successfully",
      env: {
        DATABASE_URL_DEFINED: isDefined,
        DATABASE_URL_PREVIEW: maskedUrl,
      },
      data: {
        userCount,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Database Connection Test Failed:", error);
    return NextResponse.json(
      {
        status: "error",
        message: "Failed to connect to database",
        error: error.message,
        stack: error.stack,
        env: {
          DATABASE_URL_DEFINED: !!process.env.DATABASE_URL,
        },
      },
      { status: 500 }
    );
  }
}
