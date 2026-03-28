import { signIn } from "@/lib/auth";
import { redirect } from "next/navigation";

export default function LoginPage() {
  async function handleLogin(formData: FormData) {
    "use server";
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      await signIn("credentials", { email, password, redirectTo: "/" });
    } catch {
      redirect("/login?error=invalid");
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-3xl font-bold">Welcome back</h1>
      <form
        action={handleLogin}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          required
          className="rounded-lg border border-gray-300 p-3"
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          required
          className="rounded-lg border border-gray-300 p-3"
        />
        <button
          type="submit"
          className="rounded-lg bg-blue-600 p-3 font-semibold text-white"
        >
          Sign in
        </button>
        <a href="/signup" className="text-center text-sm text-blue-600">
          Create an account
        </a>
        <a href="/reset-password" className="text-center text-sm text-gray-500">
          Forgot password?
        </a>
      </form>
    </main>
  );
}
