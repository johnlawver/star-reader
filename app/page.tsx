import { auth } from "@/lib/auth";
import { signOut } from "@/lib/auth";

export default async function Home() {
  const session = await auth();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold">⭐ Star Reader</h1>
      <p className="mt-4 text-lg text-gray-500">
        Welcome, {session?.user?.email}
      </p>
      <form
        action={async () => {
          "use server";
          await signOut({ redirectTo: "/login" });
        }}
        className="mt-8"
      >
        <button type="submit" className="text-sm text-gray-400 underline">
          Sign out
        </button>
      </form>
    </main>
  );
}
