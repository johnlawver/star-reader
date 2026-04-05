"use server";

import { requestPasswordReset, consumeResetToken } from "@/lib/reset-password";

type RequestState = { status: "sent" | "not_found" | "error" } | null;

export async function requestResetAction(
  _prev: RequestState,
  formData: FormData
): Promise<RequestState> {
  const email = formData.get("email") as string;
  const result = await requestPasswordReset(email);
  return { status: result.status };
}

type ConsumeState =
  | { status: "success" }
  | { status: "invalid" }
  | { status: "mismatch" }
  | null;

export async function consumeResetAction(
  _prev: ConsumeState,
  formData: FormData
): Promise<ConsumeState> {
  const token = formData.get("token") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (password !== confirmPassword) return { status: "mismatch" };

  const result = await consumeResetToken(token, password);
  if (!result.success) return { status: "invalid" };

  return { status: "success" };
}
