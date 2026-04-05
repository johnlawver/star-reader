import type { NextAuthConfig } from "next-auth";

// Edge-compatible auth config — no Node.js imports (no pg, bcryptjs, etc.)
// Used by middleware for session checking only.
// Full auth config with Credentials provider is in lib/auth.ts.
export const authConfig: NextAuthConfig = {
  trustHost: true,
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const PUBLIC_ROUTES = [
        "/login",
        "/signup",
        "/reset-password",
        "/api/auth",
        "/api/health",
      ];
      const isPublic = PUBLIC_ROUTES.some((route) =>
        nextUrl.pathname.startsWith(route)
      );
      if (isPublic) return true;
      if (!isLoggedIn) {
        const loginUrl = new URL("/login", nextUrl);
        loginUrl.searchParams.set("error", "session_expired");
        loginUrl.searchParams.set("callbackUrl", nextUrl.pathname);
        return Response.redirect(loginUrl);
      }
      return true;
    },
  },
  providers: [],
};
