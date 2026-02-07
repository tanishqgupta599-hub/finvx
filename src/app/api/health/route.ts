import { NextResponse } from "next/server";
import prisma, { isDatabaseAvailable } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const status = {
    database: "unknown",
    env_check: !!(process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL),
    node_env: process.env.NODE_ENV,
    timestamp: new Date().toISOString(),
    error: null as string | null,
  };

  try {
    if (!isDatabaseAvailable()) {
      status.database = "disconnected (lib/db check failed)";
      return NextResponse.json(status, { status: 503 });
    }

    // Try a simple query
    await prisma.$queryRaw`SELECT 1`;
    status.database = "connected";
    return NextResponse.json(status);
  } catch (error: any) {
    console.error("Health check failed:", error);
    status.database = "error";
    status.error = error.message;
    return NextResponse.json(status, { status: 500 });
  }
}
