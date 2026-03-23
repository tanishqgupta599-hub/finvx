import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    // Explicitly only use MongoDB URLs to match the provider in schema.prisma
    url: (process.env.MONGODB_URI || process.env.DATABASE_URL || "").startsWith("mongodb") 
      ? (process.env.MONGODB_URI || process.env.DATABASE_URL) 
      : "mongodb://dummy:27017/finvx", // Fallback for generation only
  },
});
