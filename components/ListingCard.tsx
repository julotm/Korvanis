"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { dayNum, eur, Listing, monthShort } from "@/lib/util";

export default function ListingCard({ l }: { l: Listing }) {
  const { t, lang } = useT();
  return (
    <Link href={`/listing/${l.id}`} className="ticket">
      <div className="stub">
        <b>{dayNum(l.event_date)}</b>
        <span>{monthShort(l.event_date, lang)}</span>
      </div>
      <div className="body">
        <div className="top">
          <span className="club">{l.club}</span>
          <span className="price">
            {l.kind === "want" ? t("upto") + " " : ""}
            {eur(l.price_cents)}
          </span>
        </div>
        <div className="meta">
          {t(l.quantity > 1 ? "tix_many" : "tix_one", { n: l.quantity })} ·{" "}
          {l.profiles?.pseudo ?? "—"}
        </div>
      </div>
    </Link>
  );
}
