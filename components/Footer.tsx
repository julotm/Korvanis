"use client";
import { useT } from "@/lib/i18n";
export default function Footer() {
  const { t } = useT();
  return <footer>{t("footer")}</footer>;
}
