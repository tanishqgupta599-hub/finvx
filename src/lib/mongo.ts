import { MongoClient, Db, Collection, ObjectId, Document } from "mongodb";

let client: MongoClient | null = null;
let db: Db | null = null;

function isMongoConfigured(): boolean {
  const url = process.env.MONGODB_URI || process.env.DATABASE_URL;
  return !!url && url.startsWith("mongodb");
}

export async function getMongoDb(): Promise<Db | null> {
  if (!isMongoConfigured()) return null;
  try {
    if (!client) {
      const url = (process.env.MONGODB_URI || process.env.DATABASE_URL)!;
      if (!url.startsWith("mongodb")) {
        return null;
      }
      client = new MongoClient(url);
      await client.connect();
      const dbNameFromUri = new URL(url).pathname.replace("/", "") || "finvx";
      db = client.db(dbNameFromUri);
    }
    return db;
  } catch (e) {
    console.error("MongoDB connection error:", e);
    return null;
  }
}

export async function getCollection<T extends Document>(name: string): Promise<Collection<T> | null> {
  const database = await getMongoDb();
  if (!database) return null;
  return database.collection<T>(name);
}

export function isMongoAvailable(): boolean {
  return isMongoConfigured();
}

export function toObjectId(id: string | any): ObjectId | null {
  try {
    if (id instanceof ObjectId) return id;
    if (typeof id !== "string") return null;
    // Valid 24-hex string
    if (/^[a-fA-F0-9]{24}$/.test(id)) {
      return new ObjectId(id);
    }
    return null;
  } catch {
    return null;
  }
}

export const mongoReady = true;
