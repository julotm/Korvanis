"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/config";

export default function Footer() {
  const { t } = useT();
  return (
    <footer>
      <div className="foot-links">
        <Link href="/faq">{t("footer_faq")}</Link>
        <a href={`mailto:${CONTACT_EMAIL}`}>{t("footer_contact")}</a>
      </div>
      <p>{t("footer")}</p>
      <p>{t("footer_made")}</p>
    </footer>
  );
}
