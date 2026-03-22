import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  // Ensure DATABASE_URL is set for Prisma, falling back to MONGODB_URI if needed
  // In Prisma 7.x, the URL must be in the environment if not in schema.prisma
  if (!process.env.DATABASE_URL && process.env.MONGODB_URI) {
    process.env.DATABASE_URL = process.env.MONGODB_URI;
  }

  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    return null;
  }

  try {
    // Standard initialization - Prisma 7.x will read DATABASE_URL from the environment
    // as configured in prisma.config.ts and schema.prisma
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
