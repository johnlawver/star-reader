"use client";

import { useActionState } from "react";
import { loginAction } from "./actions";

export function LoginForm({ sessionExpired }: { sessionExpired?: boolean }) {
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {sessionExpired && (
        <p className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
          Session expired, please sign in again.
        </p>
      )}
      {state?.error === "invalid" && (
        <p className="text-sm text-red-600">Incorrect email or password.</p>
      )}
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
        placeholder="Password"
        autoComplete="current-password"
        required
        className="rounded-lg border border-gray-300 p-3"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
      <a href="/signup" className="text-center text-sm text-blue-600">
        Create an account
      </a>
      <a href="/reset-password" className="text-center text-sm text-gray-500">
        Forgot password?
      </a>
    </form>
  );
}
