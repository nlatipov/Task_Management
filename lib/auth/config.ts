import type { NextAuthConfig } from "next-auth";

// Base config shared by the NextAuth instance and the proxy.
// Keep this free of database / bcrypt imports so it stays lightweight.
export const authConfig = {
  pages: {
    signIn: "/login",
  },
  session: { strategy: "jwt" },
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    session({ session, token }) {
      if (token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  providers: [],
} satisfies NextAuthConfig;
