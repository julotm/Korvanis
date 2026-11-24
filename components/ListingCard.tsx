"use client";
import Link from "next/link";
import { useT } from "@/lib/i18n";
import { dayNum, eur, monthShort, Listing } from "@/lib/util";

export default function ListingCard({ l, i = 0 }: { l: Listing; i?: number }) {
  const { t, lang } = useT();
  return (
    <Link
      href={`/listing/${l.id}`}
      className="strip"
      style={{ ["--i" as string]: i }}
    >
      <div className="strip-date">
        <small>{monthShort(l.event_date, lang)}</small>
        <b>{dayNum(l.event_date)}</b>
      </div>
      <div className="strip-main">
        <div className="strip-title">{l.event_name || l.club}</div>
        <div className="strip-meta">
          {l.event_name ? `${l.club} · ` : ""}
          {t(l.quantity > 1 ? "tix_many" : "tix_one", { n: l.quantity })} ·{" "}
          {l.profiles?.pseudo ?? "—"}
        </div>
      </div>
      <div className="strip-stub">
        <span>{l.kind === "want" ? t("upto") : ""}</span>
        <b>{eur(l.price_cents)}</b>
      </div>
    </Link>
  );
}
