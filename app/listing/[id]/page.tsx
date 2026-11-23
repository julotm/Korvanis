"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { eur, fmtDate, Listing } from "@/lib/util";
import { useT } from "@/lib/i18n";
import { notify } from "@/lib/notify";
import BigTicket from "@/components/BigTicket";
import PersonCard from "@/components/PersonCard";
import ListingCard from "@/components/ListingCard";

export default function ListingPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useT();
  const [l, setL] = useState<Listing | null>(null);
  const [uid, setUid] = useState<string | null>(null);
  const [rating, setRating] = useState<{ avg: number; n: number } | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);
  const [copied, setCopied] = useState(false);
  const [more, setMore] = useState<Listing[]>([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setUid(data.session?.user.id ?? null));
    supabase
      .from("listings")
      .select("*, profiles(pseudo)")
      .eq("id", id)
      .single()
      .then(async ({ data, error }) => {
        if (error || !data) {
          setError("notfound");
          return;
        }
        const listing = data as unknown as Listing;
        setL(listing);
        const today = new Date().toISOString().slice(0, 10);
        supabase
          .from("listings")
          .select("*, profiles(pseudo)")
          .eq("status", "open")
          .eq("club", listing.club)
          .gte("event_date", today)
          .neq("id", listing.id)
          .order("event_date", { ascending: true })
          .limit(3)
          .then(({ data: m }) => setMore((m as unknown as Listing[]) || []));
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
    else {
      notify(data.id, "new_conversation");
      router.push(`/chat/${data.id}`);
    }
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

  if (!l) return <p className="empty">{error ? t("not_found") : t("loading")}</p>;
  const mine = uid === l.user_id;
  const past = l.event_date < new Date().toISOString().slice(0, 10);
  const isOpen = l.status === "open" && !past;

  const link = typeof window !== "undefined" ? window.location.href : "";
  const shareText =
    t("share_text", {
      club: l.club,
      date: fmtDate(l.event_date, lang),
      price: eur(l.price_cents),
    }) +
    "\n" +
    link;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  }

  return (
    <>
      <p>
        <Link href="/">{t("back")}</Link>
      </p>
      <span className={`tag ${l.kind}`}>
        {l.kind === "sell" ? t("for_sale_tag") : t("wanted_tag")}
      </span>
      <BigTicket
        club={l.club}
        date={l.event_date}
        price_cents={l.price_cents}
        face_cents={l.face_cents}
        quantity={l.quantity}
        kind={l.kind}
      />
      {l.note && <p style={{ fontWeight: 600 }}>{l.note}</p>}
      <PersonCard
        userId={l.user_id}
        pseudo={l.profiles?.pseudo ?? "—"}
        label={l.kind === "sell" ? t("seller_label") : t("buyer_label")}
      />

      {!isOpen && <p className="notice">{t("closed_notice")}</p>}
      {error && error !== "notfound" && <p className="err">{error}</p>}

      {isOpen && !mine && (
        <button className="btn block" onClick={contact} disabled={busy}>
          {l.kind === "sell" ? t("interested") : t("i_have_one")}
        </button>
      )}
      {mine && isOpen && (
        <button className="btn ghost block" onClick={close}>
          {t("close_listing")}
        </button>
      )}

      {isOpen && (
        <div className="sharebar">
          <a
            className="btn wa"
            href={`https://wa.me/?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("share_wa")}
          </a>
          <button className="btn ghost" onClick={copy}>
            {copied ? t("copied") : t("copy_link")}
          </button>
        </div>
      )}

      {!mine && uid && (
        <p style={{ marginTop: 24 }}>
          {reported ? (
            <span className="ok">{t("report_thanks")}</span>
          ) : reporting ? (
            <>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder={t("report_ph")}
              />
              <button className="btn small" onClick={sendReport} disabled={reason.trim().length < 3}>
                {t("send_report")}
              </button>
            </>
          ) : (
            <button className="link" onClick={() => setReporting(true)}>
              {t("report_listing")}
            </button>
          )}
        </p>
      )}
    
      {more.length > 0 && (
        <>
          <h2>{t("more_club", { club: l.club })}</h2>
          {more.map((m) => (
            <ListingCard key={m.id} l={m} />
          ))}
        </>
      )}

      <div className="rules">
        <h3>{t("rules_title")}</h3>
        <ul>
          <li>{t("rule1")}</li>
          <li>{t("rule2")}</li>
          <li>{t("rule3")}</li>
        </ul>
      </div>
    </>
  );
}
