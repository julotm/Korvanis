"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function NewListing() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [kind, setKind] = useState<"sell" | "want">("sell");
  const [club, setClub] = useState("");
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
  }, [router]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const priceC = Math.round(parseFloat(price.replace(",", ".")) * 100);
    const faceC =
      kind === "sell" ? Math.round(parseFloat(face.replace(",", ".")) * 100) : null;
    if (isNaN(priceC) || (kind === "sell" && (faceC === null || isNaN(faceC)))) {
      setError("Please enter valid prices.");
      return;
    }
    if (kind === "sell" && faceC !== null && priceC > faceC) {
      setError("Your price can't be higher than what you paid (face value).");
      return;
    }
    setBusy(true);
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id: uid,
        kind,
        club: club.trim(),
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
      <h1>Post</h1>
      <div className="tabs">
        <button className={kind === "sell" ? "on" : ""} onClick={() => setKind("sell")} type="button">
          I sell a ticket
        </button>
        <button className={kind === "want" ? "on" : ""} onClick={() => setKind("want")} type="button">
          I&apos;m looking for one
        </button>
      </div>
      <form onSubmit={submit}>
        <label>Club</label>
        <input
          list="clubs"
          value={club}
          onChange={(e) => setClub(e.target.value)}
          placeholder="Club name"
          required
        />
        <datalist id="clubs">
          <option value="Opium" />
          <option value="Pacha" />
          <option value="Razzmatazz" />
          <option value="Shôko" />
          <option value="Carpe Diem" />
        </datalist>

        <label>Date of the night</label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

        <div className="row">
          {kind === "sell" && (
            <div>
              <label>Face value (€)</label>
              <input inputMode="decimal" value={face} onChange={(e) => setFace(e.target.value)} placeholder="15" required />
            </div>
          )}
          <div>
            <label>{kind === "sell" ? "Your price (€)" : "Max price (€)"}</label>
            <input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="15" required />
          </div>
          <div>
            <label>Tickets</label>
            <input type="number" min={1} max={10} value={qty} onChange={(e) => setQty(e.target.value)} required />
          </div>
        </div>
        {kind === "sell" && (
          <p className="meta">
            Face value is what you paid. You can sell at that price or lower,
            not higher.
          </p>
        )}

        <label>Note (optional)</label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={300}
          placeholder={kind === "sell" ? "QR code, entry before 2am, …" : "Any detail that helps"}
        />
        {error && <p className="err">{error}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn block" disabled={busy}>
            Publish
          </button>
        </div>
      </form>
    </>
  );
}
