"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { eur, fmtDate } from "@/lib/util";
import { useT } from "@/lib/i18n";

type Conv = {
  id: string;
  listing_id: string;
  owner_id: string;
  other_id: string;
  owner_ok: boolean;
  other_ok: boolean;
  listing: { club: string; event_date: string; price_cents: number; kind: string } | null;
  owner: { pseudo: string } | null;
  other: { pseudo: string } | null;
};
type Msg = { id: string; sender_id: string; body: string; created_at: string };

export default function Chat() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { t, lang } = useT();
  const [uid, setUid] = useState<string | null>(null);
  const [conv, setConv] = useState<Conv | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState("");
  const [reported, setReported] = useState(false);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data: c } = await supabase
      .from("conversations")
      .select(
        "*, listing:listings(club, event_date, price_cents, kind), owner:profiles!conversations_owner_id_fkey(pseudo), other:profiles!conversations_other_id_fkey(pseudo)"
      )
      .eq("id", id)
      .single();
    if (c) setConv(c as unknown as Conv);
    const { data: m } = await supabase
      .from("messages")
      .select("id, sender_id, body, created_at")
      .eq("conversation_id", id)
      .order("created_at", { ascending: true });
    if (m) setMsgs(m);
  }, [id]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      setUid(data.session.user.id);
      await load();
      const { data: r } = await supabase
        .from("reviews")
        .select("id")
        .eq("conversation_id", id)
        .eq("author_id", data.session.user.id)
        .maybeSingle();
      if (r) setReviewed(true);
    });
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [id, router, load]);

  useEffect(() => {
    bottom.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgs.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const body = text.trim();
    if (!body || !uid) return;
    setText("");
    const { error } = await supabase
      .from("messages")
      .insert({ conversation_id: id, sender_id: uid, body });
    if (error) setError(error.message);
    else load();
  }

  async function agree() {
    const { error } = await supabase.rpc("agree", { conv: id });
    if (error) setError(error.message);
    else load();
  }

  async function review() {
    if (!conv || !uid || !rating) return;
    const target = uid === conv.owner_id ? conv.other_id : conv.owner_id;
    const { error } = await supabase.from("reviews").insert({
      conversation_id: id,
      author_id: uid,
      target_id: target,
      rating,
      comment: comment.trim() || null,
    });
    if (error) setError(error.message);
    else setReviewed(true);
  }

  async function sendReport() {
    if (!uid || !conv) return;
    const { error } = await supabase.from("reports").insert({
      reporter_id: uid,
      conversation_id: conv.id,
      listing_id: conv.listing_id,
      reason,
    });
    if (error) setError(error.message);
    else {
      setReported(true);
      setReporting(false);
    }
  }

  if (!conv || !uid) return <p className="empty">{t("loading")}</p>;
  const iAmOwner = uid === conv.owner_id;
  const otherPseudo = iAmOwner ? conv.other?.pseudo : conv.owner?.pseudo;
  const myOk = iAmOwner ? conv.owner_ok : conv.other_ok;
  const theirOk = iAmOwner ? conv.other_ok : conv.owner_ok;
  const unlocked = conv.owner_ok && conv.other_ok;

  return (
    <>
      <p>
        <Link href="/inbox">← {t("inbox")}</Link>
      </p>
      <h1>{conv.listing?.club}</h1>
      <p className="sub">
        {conv.listing && fmtDate(conv.listing.event_date, lang)} ·{" "}
        {conv.listing && eur(conv.listing.price_cents)} · {t("with")}{" "}
        <b>{otherPseudo}</b>
      </p>

      {!unlocked && (
        <div className="notice">
          {t("chat_notice")}
          {theirOk && !myOk && <b> {t("already_confirmed", { name: otherPseudo ?? "" })}</b>}
        </div>
      )}

      <div className="chat">
        {msgs.length === 0 && (
          <p className="empty">{t("say_hi")}</p>
        )}
        {msgs.map((m) => (
          <div key={m.id} className={`msg ${m.sender_id === uid ? "me" : ""}`}>
            {m.body}
          </div>
        ))}
        <div ref={bottom} />
      </div>

      {error && <p className="err">{error}</p>}

      <form className="sendbar" onSubmit={send}>
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t("message_ph")}
          maxLength={1000}
        />
        <button className="btn">{t("send")}</button>
      </form>

      {!myOk && (
        <button className="btn ghost block" style={{ marginTop: 8 }} onClick={agree}>
          {t("agreed_btn")}
        </button>
      )}
      {myOk && !theirOk && (
        <p className="meta">{t("waiting", { name: otherPseudo ?? "" })}</p>
      )}

      {unlocked && (
        <div className="notice">
          <b>{t("deal_confirmed")}</b> {t("contacts_visible")}
          {!reviewed ? (
            <>
              <p style={{ margin: "8px 0 4px" }}>
                {t("rate", { name: otherPseudo ?? "" })}
              </p>
              <div className="stars">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={n <= rating ? "on" : ""}
                    onClick={() => setRating(n)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder={t("comment_ph")}
                maxLength={300}
              />
              <button className="btn small" style={{ marginTop: 8 }} onClick={review} disabled={!rating}>
                {t("send_review")}
              </button>
            </>
          ) : (
            <p className="ok">{t("review_thanks")}</p>
          )}
        </div>
      )}

      <p style={{ marginTop: 24 }}>
        {reported ? (
          <span className="ok">{t("report_thanks")}</span>
        ) : reporting ? (
          <>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t("report_what")}
            />
            <button className="btn small" onClick={sendReport} disabled={reason.trim().length < 3}>
              {t("send_report")}
            </button>
          </>
        ) : (
          <button className="link" onClick={() => setReporting(true)}>
            {t("report_problem")}
          </button>
        )}
      </p>
    </>
  );
}
