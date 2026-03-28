import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db as defaultDb } from "./db";
import { users } from "./db/schema";

type Db = typeof defaultDb;

export async function authorizeCredentials(
  credentials: { email: string; password: string },
  dbInstance: Db = defaultDb
) {
  const [user] = await dbInstance
    .select()
    .from(users)
    .where(eq(users.email, credentials.email))
    .limit(1);

  if (!user) return null;

  const valid = await bcrypt.compare(credentials.password, user.passwordHash);
  if (!valid) return null;

  return { id: user.id, email: user.email };
}
