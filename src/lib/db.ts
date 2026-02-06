import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
import { PrismaClient } from '@prisma/client'

let prismaInstance: PrismaClient | null = null;

const prismaClientSingleton = () => {
  // Try DATABASE_URL, then fallback to Vercel/Neon specific variables
  const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_PRISMA_URL || process.env.POSTGRES_URL

  if (!connectionString) {
    // Return null instead of throwing - allows demo mode
    return null;
  }

  try {
    // Check if we are running locally to avoid forcing SSL on local DBs
    const isLocal = connectionString.includes("localhost") || connectionString.includes("127.0.0.1");

    const pool = new Pool({ 
      connectionString,
      // Neon and most production Postgres require SSL
      ssl: isLocal ? false : { rejectUnauthorized: false },
      // Connection pool settings
      max: 10,
      min: 0,
      idleTimeoutMillis: 20000,
      connectionTimeoutMillis: 5000,
    })
    
    const adapter = new PrismaPg(pool)
    return new PrismaClient({ adapter })
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
