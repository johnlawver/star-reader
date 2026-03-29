import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use the edge-compatible config for middleware — no Node.js imports
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
