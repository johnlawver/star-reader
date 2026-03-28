import { describe, it, expect, beforeAll, afterAll } from "vitest";
import bcrypt from "bcryptjs";
import { createTestDb } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { authorizeCredentials } from "../auth-credentials";

const db = createTestDb();

const TEST_EMAIL = "test-parent@example.com";
const TEST_PASSWORD = "correct-password-123";

beforeAll(async () => {
  // Clean up any leftover test user
  await db.delete(users).where(eq(users.email, TEST_EMAIL));
  // Insert a test user with a hashed password
  const passwordHash = await bcrypt.hash(TEST_PASSWORD, 12);
  await db.insert(users).values({ email: TEST_EMAIL, passwordHash });
});

afterAll(async () => {
  await db.delete(users).where(eq(users.email, TEST_EMAIL));
});

describe("authorizeCredentials", () => {
  it("returns null when password is wrong", async () => {
    const result = await authorizeCredentials(
      { email: TEST_EMAIL, password: "wrong-password" },
      db
    );
    expect(result).toBeNull();
  });

  it("returns the user when credentials are correct", async () => {
    const result = await authorizeCredentials(
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      db
    );
    expect(result).not.toBeNull();
    expect(result?.email).toBe(TEST_EMAIL);
  });

  it("returns null when email does not exist", async () => {
    const result = await authorizeCredentials(
      { email: "nobody@example.com", password: TEST_PASSWORD },
      db
    );
    expect(result).toBeNull();
  });
});
