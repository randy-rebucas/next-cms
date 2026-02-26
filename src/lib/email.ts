/**
 * src/lib/email.ts
 *
 * SMTP email utility using nodemailer.
 * Reads configuration from the Setting collection at send time.
 */
import nodemailer from "nodemailer";
import connectDB from "@/lib/mongoose";
import { Setting } from "@/models/Setting";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
  fromName: string;
  fromAddress: string;
}

// ── Config reader ─────────────────────────────────────────────────────────────

async function getSmtpConfig(): Promise<SmtpConfig | null> {
  try {
    await connectDB();
    const keys = ["smtpHost", "smtpPort", "smtpUser", "smtpPass", "smtpEncryption", "emailFromName", "emailFromAddress"];
    const rows = await Setting.find({ key: { $in: keys } }).lean() as { key: string; value: unknown }[];
    const s: Record<string, string> = {};
    for (const { key, value } of rows) {
      s[key] = typeof value === "string" ? value : String(value ?? "");
    }

    if (!s.smtpHost || !s.smtpUser || !s.smtpPass) return null;

    const port = parseInt(s.smtpPort || "587", 10);
    const secure = s.smtpEncryption === "ssl" || port === 465;

    return {
      host: s.smtpHost,
      port,
      secure,
      user: s.smtpUser,
      pass: s.smtpPass,
      fromName: s.emailFromName || "nextCMS",
      fromAddress: s.emailFromAddress || s.smtpUser,
    };
  } catch {
    return null;
  }
}

// ── Core send function ────────────────────────────────────────────────────────

/**
 * Send an email using the configured SMTP settings.
 * Returns `{ ok: true }` on success or `{ ok: false, error }` on failure.
 * Never throws — email errors are always caught gracefully.
 */
export async function sendEmail(options: EmailOptions): Promise<{ ok: boolean; error?: string }> {
  try {
    const config = await getSmtpConfig();
    if (!config) {
      return { ok: false, error: "SMTP not configured. Set smtpHost, smtpUser, smtpPass in Settings." };
    }

    const transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: { user: config.user, pass: config.pass },
    });

    await transporter.sendMail({
      from: `"${config.fromName}" <${config.fromAddress}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text ?? options.html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim(),
    });

    return { ok: true };
  } catch (e) {
    return { ok: false, error: String(e) };
  }
}

// ── Specific notification helpers ─────────────────────────────────────────────

/** Notify admin when a new comment is submitted (pending moderation). */
export async function sendCommentNotification(opts: {
  adminEmail: string;
  postTitle: string;
  postSlug: string;
  authorName: string;
  authorEmail: string;
  commentContent: string;
  siteUrl?: string;
}): Promise<void> {
  const adminUrl = `${opts.siteUrl || ""}/admin/comments`;
  await sendEmail({
    to: opts.adminEmail,
    subject: `New comment on "${opts.postTitle}" awaiting moderation`,
    html: `
      <h2 style="font-family:sans-serif">New Comment Awaiting Moderation</h2>
      <p style="font-family:sans-serif"><strong>Post:</strong> ${opts.postTitle}</p>
      <p style="font-family:sans-serif"><strong>Author:</strong> ${opts.authorName} (${opts.authorEmail})</p>
      <blockquote style="font-family:sans-serif;border-left:4px solid #b45309;padding-left:12px;color:#555">
        ${opts.commentContent}
      </blockquote>
      <p><a href="${adminUrl}" style="background:#b45309;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;font-family:sans-serif">
        Review in Admin →
      </a></p>
    `,
  });
}

/** Notify commenter when their comment is approved. */
export async function sendCommentApprovalNotification(opts: {
  authorEmail: string;
  authorName: string;
  postTitle: string;
  postUrl: string;
}): Promise<void> {
  await sendEmail({
    to: opts.authorEmail,
    subject: `Your comment on "${opts.postTitle}" has been approved`,
    html: `
      <h2 style="font-family:sans-serif">Your Comment Was Approved</h2>
      <p style="font-family:sans-serif">Hi ${opts.authorName},</p>
      <p style="font-family:sans-serif">Your comment on <strong>${opts.postTitle}</strong> has been approved and is now visible.</p>
      <p><a href="${opts.postUrl}" style="background:#b45309;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;font-family:sans-serif">
        View Post →
      </a></p>
    `,
  });
}

/** Welcome email sent when a new user account is created. */
export async function sendWelcomeEmail(opts: {
  userEmail: string;
  userName: string;
  role: string;
  siteUrl?: string;
  siteName?: string;
}): Promise<void> {
  const loginUrl = `${opts.siteUrl || ""}/admin/login`;
  await sendEmail({
    to: opts.userEmail,
    subject: `Welcome to ${opts.siteName || "nextCMS"}`,
    html: `
      <h2 style="font-family:sans-serif">Welcome to ${opts.siteName || "nextCMS"}</h2>
      <p style="font-family:sans-serif">Hi ${opts.userName},</p>
      <p style="font-family:sans-serif">Your account has been created with the role: <strong>${opts.role}</strong>.</p>
      <p style="font-family:sans-serif">You can log in at:</p>
      <p><a href="${loginUrl}" style="background:#b45309;color:#fff;padding:10px 20px;text-decoration:none;border-radius:6px;font-family:sans-serif">
        Log In →
      </a></p>
    `,
  });
}
