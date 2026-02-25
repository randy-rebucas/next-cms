import { NextRequest, NextResponse } from "next/server";
import { connectWithUri } from "@/lib/mongoose";

/**
 * POST /api/setup/test-db
 * Body: { uri: string }
 *
 * Tests a MongoDB connection string without writing anything to disk.
 * Returns { ok: true } or { ok: false, error: string }.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as { uri?: string };
    const uri = body?.uri?.trim();

    if (!uri) {
      return NextResponse.json({ ok: false, error: "Connection string is required." }, { status: 400 });
    }

    // Validate basic URI format
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      return NextResponse.json(
        { ok: false, error: "Invalid connection string. Must start with mongodb:// or mongodb+srv://" },
        { status: 400 }
      );
    }

    // Attempt connection with a short timeout
    const conn = await connectWithUri(uri);
    // Ping the database to confirm connectivity
    await conn.db?.admin().ping();
    await conn.close();

    return NextResponse.json({ ok: true });
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Connection failed.";
    // Strip credentials from error messages before sending to client
    const safe = msg.replace(/(mongodb(?:\+srv)?:\/\/)[^@]*@/gi, "$1***@");
    return NextResponse.json({ ok: false, error: safe });
  }
}
