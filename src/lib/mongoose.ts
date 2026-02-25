/**
 * src/lib/mongoose.ts
 *
 * Mongoose connection singleton — reused across Next.js hot reloads.
 * Connects lazily on first call to connectDB().
 */
import mongoose from "mongoose";

type MongooseCache = {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
};

const globalForMongoose = globalThis as unknown as { _mongoose: MongooseCache };

if (!globalForMongoose._mongoose) {
  globalForMongoose._mongoose = { conn: null, promise: null };
}

const cached = globalForMongoose._mongoose;

/**
 * Connect to MongoDB. Throws if MONGODB_URI is not set.
 * Called lazily — safe to import this module even before setup is complete.
 */
export async function connectDB(): Promise<typeof mongoose> {
  // If we have a cached connection but it was closed externally (e.g. by connectWithUri
  // on the global mongoose instance), clear the cache and reconnect.
  if (cached.conn && mongoose.connection.readyState !== 1) {
    cached.conn = null;
    cached.promise = null;
  }

  if (cached.conn) return cached.conn;

  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not set. Run the setup wizard at /setup to configure your database."
    );
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

/**
 * Connect using an explicit URI (used by the setup wizard before .env.local is written).
 * Uses createConnection() so it is completely isolated from the global singleton —
 * closing it never affects the cached connectDB() connection.
 */
export async function connectWithUri(uri: string): Promise<mongoose.Connection> {
  const conn = mongoose.createConnection(uri, {
    bufferCommands: false,
    serverSelectionTimeoutMS: 5000,
  });
  await conn.asPromise();
  return conn;
}

export default connectDB;
