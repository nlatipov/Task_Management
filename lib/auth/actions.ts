"use server";

import { AuthError } from "next-auth";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { getLocale, getTranslations } from "next-intl/server";

import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";

import { signIn, signOut } from "./index";
import { getLoginSchema, getRegisterSchema } from "./validation";

export type AuthFormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export async function registerUser(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const t = await getTranslations("auth.errors");
  const locale = await getLocale();

  const parsed = getRegisterSchema(t).safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.query.users.findFirst({
    where: eq(users.email, email),
  });
  if (existing) {
    return { errors: { email: [t("emailTaken")] } };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await db.insert(users).values({ name, email, passwordHash });

  // Signs the new user in and throws a redirect to /{locale}/boards on success.
  await signIn("credentials", {
    email,
    password,
    redirectTo: `/${locale}/boards`,
  });

  return undefined;
}

export async function authenticate(
  _prevState: AuthFormState,
  formData: FormData,
): Promise<AuthFormState> {
  const t = await getTranslations("auth.errors");
  const locale = await getLocale();

  const parsed = getLoginSchema(t).safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { errors: z.flattenError(parsed.error).fieldErrors };
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirectTo: `/${locale}/boards`,
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return { message: t("invalidCredentials") };
    }
    // Re-throw the redirect (NEXT_REDIRECT) so navigation happens.
    throw error;
  }

  return undefined;
}

export async function logout() {
  const locale = await getLocale();
  await signOut({ redirectTo: `/${locale}/login` });
}
