"use client";
import { useT } from "@/lib/i18n";
import { daysUntil, dayNum, eur, monthShort } from "@/lib/util";

export default function BigTicket({
  club,
  date,
  price_cents,
  face_cents,
  quantity,
  kind,
}: {
  club: string;
  date: string;
  price_cents: number;
  face_cents: number | null;
  quantity: number;
  kind: "sell" | "want";
}) {
  const { t, lang } = useT();
  const d = daysUntil(date);
  const when =
    d < 0 ? t("tk_past") : d === 0 ? t("tk_tonight") : d === 1 ? t("tk_tomorrow") : t("tk_days", { n: d });
  return (
    <div className="bigticket">
      <div className="bt-stub">
        <b>{dayNum(date)}</b>
        <span>{monthShort(date, lang)}</span>
      </div>
      <div className="bt-body">
        <div className="bt-when">{when}</div>
        <div className="bt-club">{club}</div>
        <div className="bt-row">
          <span className="bt-price">
            {kind === "want" ? t("upto") + " " : ""}
            {eur(price_cents)}
          </span>
          <span className="bt-meta">
            {t(quantity > 1 ? "tix_many" : "tix_one", { n: quantity })}
            {face_cents !== null ? ` · ${t("face_value")} ${eur(face_cents)}` : ""}
          </span>
        </div>
      </div>
    </div>
  );
}
