"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/config";

export default function Footer() {
  const { t } = useT();
  return (
    <footer>
      <div className="foot-in">
        <div>
          <div className="foot-logo">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.svg" alt="Korvanis" />
          </div>
          <p>{t("footer")}</p>
        </div>
        <div className="foot-links">
          <Link href="/map">{t("nav_map")}</Link>
          <Link href="/faq">{t("footer_faq")}</Link>
          <a href={`mailto:${CONTACT_EMAIL}`}>{t("footer_contact")}</a>
        </div>
        <p className="colophon">{t("colophon")}</p>
      </div>
    </footer>
  );
}
