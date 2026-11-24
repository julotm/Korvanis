"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { CLUBS, OTHER } from "@/lib/clubs";
import { useT } from "@/lib/i18n";

export default function NewListing() {
  const router = useRouter();
  const { t } = useT();
  const [uid, setUid] = useState<string | null>(null);
  const [kind, setKind] = useState<"sell" | "want">("sell");
  const [clubSel, setClubSel] = useState("");
  const [clubOther, setClubOther] = useState("");
  const [eventSuggestions, setEventSuggestions] = useState<string[]>([]);
  const [eventName, setEventName] = useState("");
  const [date, setDate] = useState("");
  const [face, setFace] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("1");
  const [note, setNote] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) router.replace("/login");
      else setUid(data.session.user.id);
    });
    const p = new URLSearchParams(window.location.search);
    if (p.get("kind") === "want") setKind("want");
    const c = p.get("club");
    if (c && CLUBS.includes(c)) setClubSel(c);
  }, [router]);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    supabase
      .from("listings")
      .select("event_name")
      .eq("status", "open")
      .gte("event_date", today)
      .not("event_name", "is", null)
      .limit(100)
      .then(({ data }) => {
        const names = Array.from(
          new Set((data || []).map((r: { event_name: string | null }) => r.event_name as string))
        );
        setEventSuggestions(names);
      });
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const club = clubSel === OTHER ? clubOther.trim() : clubSel;
    if (!club || club.length < 2) return setError(t("need_club"));
    const priceC = Math.round(parseFloat(price.replace(",", ".")) * 100);
    const faceC =
      kind === "sell" ? Math.round(parseFloat(face.replace(",", ".")) * 100) : null;
    if (isNaN(priceC) || (kind === "sell" && (faceC === null || isNaN(faceC)))) {
      return setError(t("bad_prices"));
    }
    if (kind === "sell" && faceC !== null && priceC > faceC) {
      return setError(t("price_above_face"));
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id: uid,
        kind,
        club,
        event_name: eventName.trim() || null,
        event_date: date,
        price_cents: priceC,
        face_cents: faceC,
        quantity: parseInt(qty) || 1,
        note: note.trim() || null,
      })
      .select("id")
      .single();
    setBusy(false);
    if (error) setError(error.message);
    else router.push(`/listing/${data.id}`);
  }

  return (
    <>
      <h1>{t("new_title")}</h1>
      <div className="tabs">
        <button className={kind === "sell" ? "on" : ""} onClick={() => setKind("sell")} type="button">
          {t("i_sell")}
        </button>
        <button className={kind === "want" ? "on" : ""} onClick={() => setKind("want")} type="button">
          {t("i_look")}
        </button>
      </div>
      <form onSubmit={submit}>
        <label>{t("club")}</label>
        <select value={clubSel} onChange={(e) => setClubSel(e.target.value)} required>
          <option value="">{t("club_choose")}</option>
          {CLUBS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={OTHER}>{t("other")}…</option>
        </select>
        {clubSel === OTHER && (
          <input
            style={{ marginTop: 8 }}
            value={clubOther}
            onChange={(e) => setClubOther(e.target.value)}
            placeholder={t("club_other_ph")}
            required
          />
        )}

        <label>{t("event_label")}</label>
        <input
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder={t("event_ph")}
          maxLength={80}
          list="event-names"
        />
        <datalist id="event-names">
          {eventSuggestions.map((n) => (
            <option key={n} value={n} />
          ))}
        </datalist>
        <p className="meta">{t("event_hint")}</p>

        <label>{t("night_date")}</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <div className="row">
          {kind === "sell" && (
            <div>
              <label>{t("face_label")}</label>
              <input inputMode="decimal" value={face} onChange={(e) => setFace(e.target.value)} placeholder="15" required />
            </div>
          )}
          <div>
            <label>{kind === "sell" ? t("your_price") : t("max_price")}</label>
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15" required />
          </div>
          <div>
            <label>{t("tickets")}</label>
            <input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(e.target.value)} required />
          </div>
        </div>
        {kind === "sell" && <p className="meta">{t("face_hint")}</p>}

        <label>{t("note")}</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          placeholder={kind === "sell" ? t("note_sell_ph") : t("note_want_ph")}
        />
        {error && <p className="err">{error}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn block" disabled={busy}>
            {t("publish")}
          </button>
        </div>
      </form>
    </>
  );
}
