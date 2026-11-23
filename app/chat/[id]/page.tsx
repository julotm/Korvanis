"use client";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";
import { eur, fmtDate } from "@/lib/util";
import { useT } from "@/lib/i18n";
import { normalizePhone } from "@/lib/phone";
import { notify } from "@/lib/notify";
import BigTicket from "@/components/BigTicket";
import PersonCard from "@/components/PersonCard";

type Conv = {
  id: string;
  listing_id: string;
  owner_id: string;
  other_id: string;
  owner_ok: boolean;
  other_ok: boolean;
  listing: { club: string; event_date: string; price_cents: number; face_cents: number | null; quantity: number; kind: "sell" | "want" } | null;
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
  const [myPhone, setMyPhone] = useState<string | null | undefined>(undefined);
  const [phoneInput, setPhoneInput] = useState("");
  const [theirPhone, setTheirPhone] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    const { data: c } = await supabase
      .from("conversations")
      .select(
        "*, listing:listings(club, event_date, price_cents, face_cents, quantity, kind), owner:profiles!conversations_owner_id_fkey(pseudo), other:profiles!conversations_other_id_fkey(pseudo)"
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
      const me = data.session.user.id;
      setUid(me);
      await load();
      const { data: r } = await supabase
        .from("reviews")
        .select("id")
        .eq("conversation_id", id)
        .eq("author_id", me)
        .maybeSingle();
      if (r) setReviewed(true);
      const { data: ph } = await supabase
        .from("contacts")
        .select("phone")
        .eq("user_id", me)
        .maybeSingle();
      setMyPhone(ph?.phone ?? null);
    });
    const t = setInterval(load, 4000);
    return () => clearInterval(t);
  }, [id, router, load]);

  const unlocked = !!conv && conv.owner_ok && conv.other_ok;

  // Une fois l'accord confirmé des deux côtés, on récupère le numéro de l'autre
  useEffect(() => {
    if (!unlocked) return;
    supabase.rpc("get_contact", { conv: id }).then(({ data }) => {
      if (typeof data === "string") setTheirPhone(data);
    });
  }, [unlocked, id]);

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
    else {
      notify(id, "message");
      load();
    }
  }

  async function savePhone() {
    setError("");
    const ph = normalizePhone(phoneInput);
    if (!ph || !uid) return setError(t("phone_invalid"));
    const { error } = await supabase
      .from("contacts")
      .upsert({ user_id: uid, phone: ph });
    if (error) setError(error.message);
    else setMyPhone(ph);
  }

  async function agree() {
    setError("");
    const { error } = await supabase.rpc("agree", { conv: id });
    if (error) {
      if (error.message.includes("phone_required")) setMyPhone(null);
      else setError(error.message);
    } else load();
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
  const step = unlocked ? (reviewed ? 5 : 3) : myOk || theirOk ? 2 : 1;
  const waDigits = theirPhone ? theirPhone.replace("+", "") : "";
  const waText = encodeURIComponent(
    t("wa_hello", { club: conv.listing?.club ?? "" })
  );

  return (
    <>
      <p>
        <Link href="/inbox">← {t("inbox")}</Link>
      </p>
      {conv.listing && (
        <BigTicket
          club={conv.listing.club}
          date={conv.listing.event_date}
          price_cents={conv.listing.price_cents}
          face_cents={conv.listing.face_cents}
          quantity={conv.listing.quantity}
          kind={conv.listing.kind}
        />
      )}

      <div className="stepper">
        {[1, 2, 3, 4].map((n) => (
          <div key={n} className={`s ${n < step ? "done" : n === step ? "now" : ""}`}>
            {n}. {t(`st${n}` as "st1")}
          </div>
        ))}
      </div>

      <PersonCard
        userId={iAmOwner ? conv.other_id : conv.owner_id}
        pseudo={otherPseudo ?? "—"}
      />

      {!unlocked && (
        <div className="notice">
          {t("chat_notice")}
          {theirOk && !myOk && (
            <b> {t("already_confirmed", { name: otherPseudo ?? "" })}</b>
          )}
        </div>
      )}

      <div className="chat">
        {msgs.length === 0 && (
          <p className="empty">
            {t("say_hi")}
            <br />
            <span className="hint">{t("chat_example")}</span>
          </p>
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

      {!myOk && myPhone === null && (
        <div className="notice">
          {t("phone_needed")}
          <input
            type="tel"
            style={{ marginTop: 8 }}
            value={phoneInput}
            onChange={(e) => setPhoneInput(e.target.value)}
            placeholder={t("phone_ph")}
          />
          <button className="btn small" style={{ marginTop: 8 }} onClick={savePhone}>
            {t("save_phone")}
          </button>
        </div>
      )}
      {!myOk && myPhone && (
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
          {theirPhone && (
            <p style={{ margin: "10px 0 4px" }}>
              {t("wa_contact")}: <b>{theirPhone}</b>
              <br />
              <a
                className="btn wa small"
                style={{ marginTop: 8 }}
                href={`https://wa.me/${waDigits}?text=${waText}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                {t("open_wa")}
              </a>
            </p>
          )}
          {!reviewed ? (
            <>
              <p style={{ margin: "12px 0 4px" }}>
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
              <button
                className="btn small"
                style={{ marginTop: 8 }}
                onClick={review}
                disabled={!rating}
              >
                {t("send_review")}
              </button>
            </>
          ) : (
            <p className="ok">{t("review_thanks")}</p>
          )}
        </div>
      )}

      <div className="safety">
        <h3>{t("safety_title")}</h3>
        <ul>
          <li>{t("safety1")}</li>
          <li>{t("safety2")}</li>
          <li>{t("safety3")}</li>
          <li>{t("safety4")}</li>
        </ul>
      </div>

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
