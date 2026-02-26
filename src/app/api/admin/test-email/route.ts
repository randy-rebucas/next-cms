import { NextRequest } from "next/server";
import { checkPin, ok, err } from "@/core/auth";
import { sendEmail } from "@/lib/email";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";

export async function POST(req: NextRequest) {
  const denied = await checkPin(req);
  if (denied) return denied;

  const body = await req.json() as { to?: string };
  if (!body.to) return err("to email address is required");

  // Read adminEmail as fallback
  await connectDB();
  const adminRow = await Setting.findOne({ key: "adminEmail" }).lean() as { value?: string } | null;
  const to = body.to || adminRow?.value || "";
  if (!to) return err("No recipient email address");

  const result = await sendEmail({
    to,
    subject: "Test Email from nextCMS",
    html: `
      <h2 style="font-family:sans-serif">Test Email</h2>
      <p style="font-family:sans-serif">
        This is a test email from your nextCMS installation.<br />
        If you received this, your SMTP settings are working correctly!
      </p>
      <p style="font-family:sans-serif;color:#888;font-size:12px">
        Sent at ${new Date().toISOString()}
      </p>
    `,
  });

  if (!result.ok) return err(result.error ?? "Failed to send email", 500);
  return ok({ sent: true, to });
}
