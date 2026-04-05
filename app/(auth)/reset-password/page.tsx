"use client";

import { useActionState } from "react";
import { requestResetAction } from "./actions";

export default function ResetPasswordPage() {
  const [state, formAction, pending] = useActionState(requestResetAction, null);

  if (state?.status === "sent") {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center p-8">
        <h1 className="mb-4 text-3xl font-bold">Check your email</h1>
        <p className="mb-6 max-w-sm text-center text-gray-600">
          We sent a password reset link to your email address. The link expires
          in 1 hour.
        </p>
        <a href="/login" className="text-blue-600">
          Back to sign in
        </a>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-4 text-3xl font-bold">Reset your password</h1>
      <p className="mb-8 max-w-sm text-center text-gray-500">
        Enter your email and we&apos;ll send you a reset link.
      </p>
      <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
        {state?.status === "not_found" && (
          <p className="text-sm text-red-600">
            No account found with that email address.
          </p>
        )}
        {state?.status === "error" && (
          <p className="text-sm text-red-600">
            Something went wrong. Please try again.
          </p>
        )}
        <input
          type="email"
          name="email"
          placeholder="Email"
          autoComplete="email"
          required
          className="rounded-lg border border-gray-300 p-3"
        />
        <button
          type="submit"
          disabled={pending}
          className="rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>
        <a href="/login" className="text-center text-sm text-blue-600">
          Back to sign in
        </a>
      </form>
    </main>
  );
}
