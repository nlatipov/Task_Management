"use client";

import { useLocale, useTranslations } from "next-intl";

import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Button } from "@/components/ui/button";

export function LocaleSwitcher() {
  const t = useTranslations("common.language");
  const activeLocale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  return (
    <div className="flex items-center gap-1">
      {routing.locales.map((locale) => (
        <Button
          key={locale}
          type="button"
          size="sm"
          variant={locale === activeLocale ? "secondary" : "ghost"}
          aria-pressed={locale === activeLocale}
          onClick={() => router.replace(pathname, { locale })}
        >
          {t(locale)}
        </Button>
      ))}
    </div>
  );
}
