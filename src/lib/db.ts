import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  // Prioritize MongoDB connections to avoid conflicts with leftover Postgres/Neon variables
  const mongoUrl = process.env.MONGODB_URI || (process.env.DATABASE_URL?.startsWith('mongodb') ? process.env.DATABASE_URL : null);
  const postgresUrl = process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL || (process.env.DATABASE_URL?.startsWith('postgres') ? process.env.DATABASE_URL : null);

  // Since we are using the MongoDB provider in schema.prisma, we MUST use a mongodb connection string
  const connectionString = mongoUrl || postgresUrl;

  if (!connectionString) {
    console.warn("No database connection string found in environment variables.");
    return null;
  }

  // Log which connection type we are using (safe version without credentials)
  const isMongo = connectionString.startsWith('mongodb');
  console.log(`Initializing Prisma with ${isMongo ? 'MongoDB' : 'PostgreSQL'} connection string...`);

  try {
    return new PrismaClient({
      datasources: {
        db: {
          url: connectionString
        }
      }
    });
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
