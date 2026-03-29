import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  async function handleSignup(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const [existing] = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (existing) {
      redirect("/signup?error=exists");
    }

    const passwordHash = await bcrypt.hash(password, 12);
    await db.insert(users).values({ email, passwordHash });

    await signIn("credentials", { email, password, redirectTo: "/" });
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-3xl font-bold">Create your account</h1>
      {error === "exists" && (
        <p className="mb-4 text-sm text-red-600">
          An account with that email already exists.{" "}
          <a href="/login" className="underline">
            Log in instead?
          </a>
        </p>
      )}
      <form
        action={handleSignup}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="rounded-lg border border-gray-300 p-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password (min 8 characters)"
          autoComplete="new-password"
          minLength={8}
          required
          className="rounded-lg border border-gray-300 p-3"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 p-3 font-semibold text-white"
        >
          Create account
        </button>
        <a href="/login" className="text-center text-sm text-blue-600">
          Already have an account?
        </a>
      </form>
    </main>
  );
}
