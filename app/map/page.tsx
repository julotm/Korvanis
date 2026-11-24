"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import { supabase } from "@/lib/supabase";
import { CLUBS, CLUB_COORDS } from "@/lib/clubs";
import { useT } from "@/lib/i18n";

export default function MapPage() {
  const { t } = useT();
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("listings")
      .select("club")
      .eq("status", "open")
      .eq("kind", "sell")
      .gte("event_date", today)
      .then(({ data }) => {
        const c: Record<string, number> = {};
        (data || []).forEach((r: { club: string }) => (c[r.club] = (c[r.club] || 0) + 1));
        setCounts(c);
      });
  }, []);

  useEffect(() => {
    if (!ref.current || counts === null) return;
    let map: import("leaflet").Map | null = null;
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !ref.current) return;
      map = L.map(ref.current, { scrollWheelZoom: false }).setView([41.3874, 2.1686], 13);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap contributors",
      }).addTo(map);
      for (const club of CLUBS) {
        const pos = CLUB_COORDS[club];
        if (!pos) continue;
        const n = counts[club] || 0;
        const icon = L.divIcon({
          className: "",
          html: `<div class="map-pin ${n ? "" : "zero"}"><span>${n}</span></div>`,
          iconSize: [34, 34],
          iconAnchor: [17, 17],
        });
        const el = document.createElement("div");
        const b = document.createElement("b");
        b.textContent = club;
        const p = document.createElement("div");
        p.textContent = n ? `${n}` : t("map_none");
        el.append(b, p);
        if (n) {
          const a = document.createElement("a");
          a.className = "btn small";
          a.href = `/?club=${encodeURIComponent(club)}`;
          a.textContent = t("map_see");
          el.append(a);
        }
        L.marker(pos, { icon }).addTo(map).bindPopup(el);
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [counts, t]);

  return (
    <>
      <div className="map-head">
        <h1>{t("map_title")}</h1>
        <p className="sub">{t("map_sub")}</p>
      </div>
      <div id="kmap" ref={ref} />
      <div className="map-list">
        {[...CLUBS]
          .sort((a, b) => (counts?.[b] || 0) - (counts?.[a] || 0))
          .map((c) => (
            <Link key={c} href={`/?club=${encodeURIComponent(c)}`}>
              {c}
              <span>{counts?.[c] || 0}</span>
            </Link>
          ))}
      </div>
    </>
  );
}
