import crypto from "crypto";
import bcrypt from "bcryptjs";
import { eq, and, gt } from "drizzle-orm";
import { Resend } from "resend";
import { db as defaultDb } from "./db";
import { users, passwordResetTokens } from "./db/schema";

type Db = typeof defaultDb;

function hashToken(plaintext: string): string {
  return crypto.createHash("sha256").update(plaintext).digest("hex");
}

export type RequestResetResult =
  | { status: "sent" }
  | { status: "not_found" }
  | { status: "error"; message: string };

export async function requestPasswordReset(
  email: string,
  dbInstance: Db = defaultDb
): Promise<RequestResetResult> {
  const [user] = await dbInstance
    .select({ id: users.id, email: users.email })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user) return { status: "not_found" };

  const plaintext = crypto.randomBytes(32).toString("hex");
  const tokenHash = hashToken(plaintext);
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await dbInstance.insert(passwordResetTokens).values({
    userId: user.id,
    tokenHash,
    expiresAt,
  });

  const resetUrl = `${process.env.NEXTAUTH_URL ?? "http://localhost:3000"}/reset-password/confirm?token=${plaintext}`;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const from =
    process.env.RESEND_FROM_EMAIL ?? "noreply@star-reader.johnlawver.com";

  const { error } = await resend.emails.send({
    from,
    to: user.email,
    subject: "Reset your Star Reader password",
    html: `
      <p>Hi,</p>
      <p>Click the link below to reset your password. This link expires in 1 hour.</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can ignore this email.</p>
    `,
  });

  if (error) return { status: "error", message: error.message };
  return { status: "sent" };
}

export type ValidateTokenResult =
  | { valid: true; userId: string }
  | { valid: false; reason: "expired" | "used" | "not_found" };

export async function validateResetToken(
  plaintext: string,
  dbInstance: Db = defaultDb
): Promise<ValidateTokenResult> {
  const tokenHash = hashToken(plaintext);

  const [record] = await dbInstance
    .select()
    .from(passwordResetTokens)
    .where(
      and(
        eq(passwordResetTokens.tokenHash, tokenHash),
        gt(passwordResetTokens.expiresAt, new Date())
      )
    )
    .limit(1);

  if (!record) return { valid: false, reason: "not_found" };
  if (record.used) return { valid: false, reason: "used" };

  return { valid: true, userId: record.userId };
}

export async function consumeResetToken(
  plaintext: string,
  newPassword: string,
  dbInstance: Db = defaultDb
): Promise<{ success: boolean; reason?: "expired" | "used" | "not_found" }> {
  const validation = await validateResetToken(plaintext, dbInstance);
  if (!validation.valid) return { success: false, reason: validation.reason };

  const passwordHash = await bcrypt.hash(newPassword, 12);

  await dbInstance
    .update(users)
    .set({ passwordHash })
    .where(eq(users.id, validation.userId));

  await dbInstance
    .update(passwordResetTokens)
    .set({ used: true })
    .where(eq(passwordResetTokens.tokenHash, hashToken(plaintext)));

  return { success: true };
}
