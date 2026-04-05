"use client";

import { useActionState } from "react";
import { consumeResetAction } from "../actions";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function ConfirmForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [state, formAction, pending] = useActionState(consumeResetAction, null);

  if (!token) {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <p className="text-sm text-red-600">Invalid or missing reset token.</p>
        <a href="/reset-password" className="text-blue-600">
          Request a new reset link
        </a>
      </div>
    );
  }

  if (state?.status === "success") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <p className="text-green-700">Password updated successfully.</p>
        <a href="/login" className="text-blue-600">
          Sign in with your new password
        </a>
      </div>
    );
  }

  if (state?.status === "invalid") {
    return (
      <div className="flex w-full max-w-sm flex-col items-center gap-4">
        <p className="text-sm text-red-600">
          This reset link has expired or already been used.
        </p>
        <a href="/reset-password" className="text-blue-600">
          Request a new reset link
        </a>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex w-full max-w-sm flex-col gap-4">
      <input type="hidden" name="token" value={token} />
      {state?.status === "mismatch" && (
        <p className="text-sm text-red-600">Passwords do not match.</p>
      )}
      <input
        type="password"
        name="password"
        placeholder="New password (min 8 characters)"
        autoComplete="new-password"
        minLength={8}
        required
        className="rounded-lg border border-gray-300 p-3"
      />
      <input
        type="password"
        name="confirmPassword"
        placeholder="Confirm new password"
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
        {pending ? "Updating…" : "Set new password"}
      </button>
    </form>
  );
}

export default function ConfirmResetPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8">
      <h1 className="mb-8 text-3xl font-bold">Set new password</h1>
      <Suspense>
        <ConfirmForm />
      </Suspense>
    </main>
  );
}
