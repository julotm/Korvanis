"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { eur, fmtDate, Listing } from "@/lib/util";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [l, setL] = useState<Listing | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [rating, setRating] = useState<{ avg: number; n: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
    supabase
      .from("listings")
      .select("*, profiles(pseudo)")
      .eq("id", id)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setError("Listing not found.");
          return;
        }
        const listing = data as unknown as Listing;
        setL(listing);
        const { data: rv } = await supabase
          .from("reviews")
          .select("rating")
          .eq("target_id", listing.user_id);
        if (rv && rv.length)
          setRating({
            avg: rv.reduce((s, r) => s + r.rating, 0) / rv.length,
            n: rv.length,
          });
      });
  }, [id]);

  async function contact() {
    if (!uid) return router.push("/login");
    if (!l) return;
    setBusy(true);
    setError("");
    const { data: existing } = await supabase
      .from("conversations")
      .select("id")
      .eq("listing_id", l.id)
      .eq("other_id", uid)
      .maybeSingle();
    if (existing) return router.push(`/chat/${existing.id}`);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ listing_id: l.id, owner_id: l.user_id, other_id: uid })
      .select("id")
      .single();
    setBusy(false);
    if (error) setError(error.message);
    else router.push(`/chat/${data.id}`);
  }

  async function close() {
    if (!l) return;
    await supabase.from("listings").update({ status: "closed" }).eq("id", l.id);
    setL({ ...l, status: "closed" });
  }

  async function sendReport() {
    if (!uid || !l) return;
    const { error } = await supabase
      .from("reports")
      .insert({ reporter_id: uid, listing_id: l.id, reason });
    if (error) setError(error.message);
    else {
      setReported(true);
      setReporting(false);
    }
  }

  if (!l) return <p className="empty">{error || "Loading…"}</p>;
  const mine = uid === l.user_id;

  return (
    <>
      <p>
        <Link href="/">← Back</Link>
      </p>
      <span className={`tag ${l.kind}`}>{l.kind === "sell" ? "FOR SALE" : "WANTED"}</span>
      <h1>{l.club}</h1>
      <p className="sub">
        {fmtDate(l.event_date)} · {l.quantity} ticket{l.quantity > 1 ? "s" : ""}
      </p>
      <p className="price" style={{ fontSize: 28, margin: "8px 0" }}>
        {l.kind === "want" ? "up to " : ""}
        {eur(l.price_cents)}
      </p>
      {l.face_cents !== null && (
        <p className="meta">Face value {eur(l.face_cents)}</p>
      )}
      {l.note && <p>{l.note}</p>}
      <p className="meta">
        Posted by <b>{l.profiles?.pseudo}</b>
        {rating
          ? ` · ★ ${rating.avg.toFixed(1)} (${rating.n})`
          : " · no reviews yet"}
      </p>

      {l.status === "closed" && <p className="notice">This listing is closed.</p>}
      {error && <p className="err">{error}</p>}

      {l.status === "open" && !mine && (
        <button className="btn block" onClick={contact} disabled={busy}>
          {l.kind === "sell" ? "I'm interested" : "I have one"}
        </button>
      )}
      {mine && l.status === "open" && (
        <button className="btn ghost block" onClick={close}>
          Close this listing (sold / no longer needed)
        </button>
      )}

      {!mine && uid && (
        <p style={{ marginTop: 24 }}>
          {reported ? (
            <span className="ok">Thanks, we&apos;ll look into it.</span>
          ) : reporting ? (
            <>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="What's wrong with this listing?"
              />
              <button className="btn small" onClick={sendReport} disabled={reason.trim().length < 3}>
                Send report
              </button>
            </>
          ) : (
            <button className="link" onClick={() => setReporting(true)}>
              Report this listing
            </button>
          )}
        </p>
      )}
    </>
  );
}
