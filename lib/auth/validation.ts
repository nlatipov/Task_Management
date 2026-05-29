import { z } from "zod";

type ErrorKey =
  | "invalidEmail"
  | "passwordRequired"
  | "nameMin"
  | "passwordMin"
  | "passwordLetter"
  | "passwordDigit";

type Translator = (key: ErrorKey) => string;

// Used by the NextAuth Credentials provider, where validation messages are
// never surfaced to the user (a failed parse just returns `null`).
export const credentialsSchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export function getLoginSchema(t: Translator) {
  return z.object({
    email: z.email({ error: t("invalidEmail") }).trim(),
    password: z.string().min(1, { error: t("passwordRequired") }),
  });
}

export function getRegisterSchema(t: Translator) {
  return z.object({
    name: z.string().trim().min(2, { error: t("nameMin") }),
    email: z.email({ error: t("invalidEmail") }).trim(),
    password: z
      .string()
      .min(8, { error: t("passwordMin") })
      .regex(/[a-zA-Z]/, { error: t("passwordLetter") })
      .regex(/[0-9]/, { error: t("passwordDigit") }),
  });
}

export type LoginInput = z.infer<ReturnType<typeof getLoginSchema>>;
export type RegisterInput = z.infer<ReturnType<typeof getRegisterSchema>>;
