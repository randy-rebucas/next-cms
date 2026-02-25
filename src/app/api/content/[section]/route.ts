import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const VALID_SECTIONS = ["site", "practiceAreas", "experience", "testimonials", "blog", "faq"];

const ADMIN_PIN = process.env.ADMIN_PIN || "1234";

function getFilePath(section: string) {
  return path.join(process.cwd(), "src", "data", `${section}.json`);
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 404 });
  }

  try {
    const filePath = getFilePath(section);
    const raw = fs.readFileSync(filePath, "utf-8");
    return NextResponse.json(JSON.parse(raw));
  } catch {
    return NextResponse.json({ error: "Failed to read content" }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ section: string }> }
) {
  const { section } = await params;

  if (!VALID_SECTIONS.includes(section)) {
    return NextResponse.json({ error: "Invalid section" }, { status: 404 });
  }

  const pin = req.headers.get("x-admin-pin");
  if (pin !== ADMIN_PIN) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const filePath = getFilePath(section);
    fs.writeFileSync(filePath, JSON.stringify(body, null, 2), "utf-8");
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to write content" }, { status: 500 });
  }
}
