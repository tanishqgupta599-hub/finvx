import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  // Use MONGODB_URI directly or DATABASE_URL if it's a MongoDB string
  // This avoids accidental initialization with Postgres/Neon variables that may still be in the environment
  const connectionString = (process.env.MONGODB_URI || "").startsWith("mongodb") 
    ? process.env.MONGODB_URI 
    : (process.env.DATABASE_URL || "").startsWith("mongodb") 
      ? process.env.DATABASE_URL 
      : null;

  if (!connectionString) {
    console.warn("No valid MongoDB connection string found in environment variables. Running in demo mode.");
    return null;
  }

  console.log("Initializing Prisma Client with MongoDB connection...");

  try {
    // Standard initialization - Prisma will read DATABASE_URL from the environment
    process.env.DATABASE_URL = connectionString;
    return new PrismaClient();
  } catch (error) {
    console.warn("Database connection failed, running in demo mode:", error);
    return null;
  }
}

declare global {
  var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton> | null
}

// Initialize prisma - will be null if no database configured
prismaInstance = globalThis.prismaGlobal ?? prismaClientSingleton()

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prismaInstance

// Export prisma (may be null in demo mode, but typed as PrismaClient to avoid strict null checks in API routes)
// API routes will throw 500 if accessed without DB, which is handled by client-side demo fallback
export default prismaInstance as PrismaClient

// Helper to check if database is available
export function isDatabaseAvailable(): boolean {
  return prismaInstance !== null;
}
