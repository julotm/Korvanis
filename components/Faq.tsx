"use client";
import { useT } from "@/lib/i18n";
import { CONTACT_EMAIL } from "@/lib/config";

export default function Faq() {
  const { t } = useT();
  return (
    <section className="faq">
      <h2>{t("faq_title")}</h2>
      {[1, 2, 3, 4, 5, 6].map((n) => (
        <div className="faq-item" key={n}>
          <h3>{t(`faq${n}_q` as "faq1_q")}</h3>
          <p>{t(`faq${n}_a` as "faq1_a")}</p>
        </div>
      ))}
      <p className="faq-contact">
        {t("faq_contact")}{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
      </p>
    </section>
  );
}
