import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

  // If no SQL connection string, or a Mongo connection is configured, skip Prisma entirely
  if (!connectionString || process.env.MONGODB_URI) {
    return null;
  }

  try {
    // For MongoDB and other providers, PrismaClient can be instantiated directly.
    return new PrismaClient()
  } catch (error) {
    // If connection fails, return null for demo mode
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
