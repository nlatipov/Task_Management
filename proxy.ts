import createMiddleware from "next-intl/middleware";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { routing } from "@/i18n/routing";

// Next.js 16 renamed `middleware` to `proxy`. We wrap next-intl's locale
// middleware in NextAuth's `auth` handler so `req.auth` is available, then
// gate protected routes ourselves (the `authorized` config callback is only
// consulted in the no-callback form of `auth`).
const intlMiddleware = createMiddleware(routing);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const pathnameWithoutLocale = pathname.replace(/^\/[a-z]{2}(?=\/|$)/, "");
  const isProtected = pathnameWithoutLocale.startsWith("/boards");

  if (isProtected && !req.auth) {
    const locale =
      pathname.match(/^\/([a-z]{2})(?=\/|$)/)?.[1] ?? routing.defaultLocale;
    return NextResponse.redirect(new URL(`/${locale}/login`, req.nextUrl));
  }

  return intlMiddleware(req);
});

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
