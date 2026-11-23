"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Listing } from "@/lib/util";
import { CLUBS, OTHER } from "@/lib/clubs";
import { useT } from "@/lib/i18n";
import ListingCard from "@/components/ListingCard";

export default function Home() {
  const { t } = useT();
  const [kind, setKind] = useState<"sell" | "want">("sell");
  const [items, setItems] = useState<Listing[] | null>(null);
  const [club, setClub] = useState<string>(""); // "" = toutes
  const [q, setQ] = useState("");
  const [focus, setFocus] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("listings")
      .select("*, profiles(pseudo)")
      .eq("status", "open")
      .gte("event_date", today)
      .order("event_date", { ascending: true })
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setItems(data as unknown as Listing[]);
      });
  }, []);

  const ofKind = useMemo(
    () => (items || []).filter((l) => l.kind === kind),
    [items, kind]
  );
  const bucket = (l: Listing) => (CLUBS.includes(l.club) ? l.club : OTHER);
  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    ofKind.forEach((l) => (c[bucket(l)] = (c[bucket(l)] || 0) + 1));
    return c;
  }, [ofKind]);

  const shown = ofKind.filter((l) => !club || bucket(l) === club);
  const sorted = [...CLUBS].sort((a, b) => (counts[b] || 0) - (counts[a] || 0));
  const suggestions = CLUBS.filter((c) =>
    c.toLowerCase().includes(q.trim().toLowerCase())
  );

  function pick(c: string) {
    setClub(c);
    setQ("");
    setFocus(false);
  }

  const clubLabel = club === OTHER ? t("other") : club;

  return (
    <>
      <div className="hero">
        <h1>{t("hero_title")}</h1>
        <p>{t("hero_sub")}</p>
        <Link href="/new" className="btn">
          {t("hero_cta")}
        </Link>
      </div>

      <div className="steps">
        {[1, 2, 3].map((n) => (
          <div className="step" key={n}>
            <b>
              <i>{n}</i>
              {t(`step${n}_t` as "step1_t")}
            </b>
            {t(`step${n}_d` as "step1_d")}
          </div>
        ))}
      </div>

      <div className="tabs">
        <button className={kind === "sell" ? "on" : ""} onClick={() => setKind("sell")}>
          {t("tab_sell")}
        </button>
        <button className={kind === "want" ? "on" : ""} onClick={() => setKind("want")}>
          {t("tab_want")}
        </button>
      </div>

      <div className="searchwrap">
        <input
          placeholder={t("search_ph")}
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => setFocus(true)}
          onBlur={() => setTimeout(() => setFocus(false), 150)}
        />
        {focus && suggestions.length > 0 && (
          <div className="suggest">
            {suggestions.map((c) => (
              <button key={c} onMouseDown={() => pick(c)}>
                {c}
                <span>{counts[c] || 0}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="chips">
        <button className={`chip ${club === "" ? "on" : ""}`} onClick={() => setClub("")}>
          {t("all")}
          <em>{ofKind.length}</em>
        </button>
        {sorted.map((c) => (
          <button
            key={c}
            className={`chip ${club === c ? "on" : ""} ${counts[c] ? "" : "zero"}`}
            onClick={() => setClub(c)}
          >
            {c}
            <em>{counts[c] || 0}</em>
          </button>
        ))}
        {counts[OTHER] ? (
          <button
            className={`chip ${club === OTHER ? "on" : ""}`}
            onClick={() => setClub(OTHER)}
          >
            {t("other")}
            <em>{counts[OTHER]}</em>
          </button>
        ) : null}
      </div>

      <div>
        {error && <p className="err">{error}</p>}
        {items === null && !error && <p className="empty">{t("loading")}</p>}
        {items && shown.length === 0 && (
          <div className="emptybox">
            <p>
              {club ? t("empty_club", { club: clubLabel }) : t("empty_all")}
              <br />
              {t("empty_sub")}
            </p>
            <div className="row">
              <Link href={`/new?kind=sell${club && club !== OTHER ? `&club=${encodeURIComponent(club)}` : ""}`} className="btn small">
                {t("empty_cta_sell")}
              </Link>
              <Link href={`/new?kind=want${club && club !== OTHER ? `&club=${encodeURIComponent(club)}` : ""}`} className="btn small ghost">
                {t("empty_cta_want")}
              </Link>
            </div>
          </div>
        )}
        {shown.map((l) => (
          <ListingCard key={l.id} l={l} />
        ))}
      </div>
    </>
  );
}
