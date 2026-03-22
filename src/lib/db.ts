import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  // Use MONGODB_URI if DATABASE_URL is missing, as the schema now supports MongoDB
  const connectionString = process.env.DATABASE_URL || process.env.MONGODB_URI || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    return null;
  }

  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    })
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
