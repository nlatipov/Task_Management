import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { auth } from "@/lib/auth";
import { logout } from "@/lib/auth/actions";
import { Button } from "@/components/ui/button";
import { LocaleSwitcher } from "@/components/locale-switcher";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "boards" });
  return { title: t("title") };
}

export default async function BoardsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("boards");
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b px-6 py-4">
        <h1 className="text-lg font-semibold">{t("title")}</h1>
        <div className="flex items-center gap-3">
          <LocaleSwitcher />
          <span className="text-sm text-muted-foreground">
            {session?.user?.email}
          </span>
          <form action={logout}>
            <Button type="submit" variant="outline" size="sm">
              {t("signOut")}
            </Button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center p-6">
        <p className="text-muted-foreground">{t("comingSoon")}</p>
      </main>
    </div>
  );
}
