import NextAuth from "next-auth";
import { authConfig } from "./auth.config";

// Use the edge-compatible config for proxy — no Node.js imports
const { auth } = NextAuth(authConfig);
export default auth;

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
