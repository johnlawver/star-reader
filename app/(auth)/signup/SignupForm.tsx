"use client";

import { useActionState } from "react";
import { signupAction } from "./actions";

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      {state?.error === "mismatch" && (
        <p className="text-sm text-red-600">Passwords do not match.</p>
      )}
      {state?.error === "exists" && (
        <p className="text-sm text-red-600">
          An account with that email already exists.{" "}
          <a href="/login" className="underline">
            Log in instead?
          </a>
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
      <input
        type="password"
        name="password"
        placeholder="Password (min 8 characters)"
        autoComplete="new-password"
        minLength={8}
        required
        className="rounded-lg border border-gray-300 p-3"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm password"
        autoComplete="new-password"
        minLength={8}
        required
        className="rounded-lg border border-gray-300 p-3"
      />
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-blue-600 p-3 font-semibold text-white disabled:opacity-60"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <a href="/login" className="text-center text-sm text-blue-600">
        Already have an account?
      </a>
    </form>
  );
}
