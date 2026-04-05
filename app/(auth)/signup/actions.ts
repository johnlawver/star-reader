"use server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

type SignupState = { error: "mismatch" | "exists" } | null;

export async function signupAction(
  _prev: SignupState,
  formData: FormData
): Promise<SignupState> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) return { error: "mismatch" };

  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) return { error: "exists" };

  const passwordHash = await bcrypt.hash(password, 12);
  await db.insert(users).values({ email, passwordHash });

  try {
    await signIn("credentials", { email, password, redirectTo: "/" });
  } catch (e) {
    if ((e as { digest?: string })?.digest?.startsWith("NEXT_REDIRECT")) {
      throw e;
    }
  }

  return null;
}
