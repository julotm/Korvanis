import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://opiqfohikszbjxvuwaee.supabase.co";
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const GMAIL_USER = process.env.GMAIL_USER;
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;
const SITE = process.env.SITE_URL || "https://korvanis-delta.vercel.app";

export async function POST(req: Request) {
  // Pas configuré : on ne fait rien (le site marche quand même).
  if (!SERVICE_KEY || !GMAIL_USER || !GMAIL_PASS) {
    return NextResponse.json({ ok: false, skipped: "not_configured" });
  }
  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    const { conversationId, kind } = await req.json();
    if (!token || !conversationId) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
      auth: { persistSession: false },
    });

    // 1. Qui appelle ? (on vérifie le token, on ne fait pas confiance au navigateur)
    const { data: u } = await admin.auth.getUser(token);
    const callerId = u.user?.id;
    if (!callerId) return NextResponse.json({ ok: false }, { status: 401 });

    // 2. L'appelant fait-il partie de la conversation ?
    const { data: conv } = await admin
      .from("conversations")
      .select("id, owner_id, other_id, last_notified_at, listings(club)")
      .eq("id", conversationId)
      .maybeSingle();
    if (!conv || ![conv.owner_id, conv.other_id].includes(callerId)) {
      return NextResponse.json({ ok: false }, { status: 403 });
    }

    // 3. Anti-spam : pour les messages, 1 email max toutes les 30 min par conversation
    if (kind === "message" && conv.last_notified_at) {
      const ageMin = (Date.now() - new Date(conv.last_notified_at).getTime()) / 60000;
      if (ageMin < 30) return NextResponse.json({ ok: true, skipped: "throttled" });
    }

    const recipientId = callerId === conv.owner_id ? conv.other_id : conv.owner_id;
    const { data: r } = await admin.auth.admin.getUserById(recipientId);
    const to = r.user?.email;
    if (!to) return NextResponse.json({ ok: false }, { status: 404 });

    const { data: sender } = await admin
      .from("profiles")
      .select("pseudo")
      .eq("id", callerId)
      .maybeSingle();
    const listing = conv.listings as unknown as { club: string } | { club: string }[] | null;
    const club = (Array.isArray(listing) ? listing[0]?.club : listing?.club) || "your listing";
    const who = sender?.pseudo || "Someone";
    const link = `${SITE}/chat/${conv.id}`;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
    await transporter.sendMail({
      from: `Korvanis <${GMAIL_USER}>`,
      to,
      subject:
        kind === "new_conversation"
          ? `${who} is interested — ${club} · Korvanis`
          : `New message from ${who} — ${club} · Korvanis`,
      text: [
        `${who} wrote to you about ${club}.`,
        `${who} t'a écrit à propos de ${club}.`,
        `${who} te ha escrito sobre ${club}.`,
        "",
        link,
        "",
        "Korvanis",
      ].join("\n"),
    });

    await admin
      .from("conversations")
      .update({ last_notified_at: new Date().toISOString() })
      .eq("id", conv.id);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
