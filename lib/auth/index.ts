import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import { authConfig } from "./config";
import { credentialsSchema } from "./validation";

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      async authorize(credentials) {
        const parsed = credentialsSchema.safeParse(credentials);
        if (!parsed.success) {
          return null;
        }

        const { email, password } = parsed.data;
        const user = await db.query.users.findFirst({
          where: eq(users.email, email),
        });
        if (!user) {
          return null;
        }

        const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
        if (!passwordsMatch) {
          return null;
        }

        return { id: user.id, email: user.email, name: user.name };
      },
    }),
  ],
});
