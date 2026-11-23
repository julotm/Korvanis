"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { eur, fmtDate, Listing } from "@/lib/util";

export default function Home() {
  const [kind, setKind] = useState<"sell" | "want">("sell");
  const [items, setItems] = useState<Listing[] | null>(null);
  const [q, setQ] = useState("");
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

  const shown = (items || []).filter(
    (l) =>
      l.kind === kind &&
      (!q || l.club.toLowerCase().includes(q.toLowerCase()))
  );

  return (
    <>
      <div className="hero">
        <h1>Club tickets, student to student.</h1>
        <p>
          Post a ticket you can&apos;t use, or ask for one. No commission, no
          names shown.
        </p>
        <Link href="/new" className="btn">
          Post a ticket or a request
        </Link>
      </div>

      <div className="tabs">
        <button className={kind === "sell" ? "on" : ""} onClick={() => setKind("sell")}>
          For sale
        </button>
        <button className={kind === "want" ? "on" : ""} onClick={() => setKind("want")}>
          Wanted
        </button>
      </div>

      <input
        placeholder="Search a club"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />

      <div style={{ marginTop: 12 }}>
        {error && <p className="err">{error}</p>}
        {items === null && !error && <p className="empty">Loading…</p>}
        {items && shown.length === 0 && (
          <p className="empty">
            Nothing here yet.
            <br />
            Be the first to post!
          </p>
        )}
        {shown.map((l) => (
          <Link key={l.id} href={`/listing/${l.id}`} className="card">
            <div className="top">
              <span className="club">{l.club}</span>
              <span className="price">
                {l.kind === "want" ? "up to " : ""}
                {eur(l.price_cents)}
              </span>
            </div>
            <div className="meta">
              {fmtDate(l.event_date)} · {l.quantity} ticket
              {l.quantity > 1 ? "s" : ""} · {l.profiles?.pseudo ?? "—"}
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}
