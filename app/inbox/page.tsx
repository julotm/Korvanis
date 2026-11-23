"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { fmtDate } from "@/lib/util";

type Conv = {
  id: string;
  owner_id: string;
  other_id: string;
  listing: { club: string; event_date: string; kind: string } | null;
  owner: { pseudo: string } | null;
  other: { pseudo: string } | null;
};

export default function Inbox() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [items, setItems] = useState<Conv[] | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      if (!data.session) return router.replace("/login");
      setUid(data.session.user.id);
      const { data: rows } = await supabase
        .from("conversations")
        .select(
          "id, owner_id, other_id, listing:listings(club, event_date, kind), owner:profiles!conversations_owner_id_fkey(pseudo), other:profiles!conversations_other_id_fkey(pseudo)"
        )
        .order("created_at", { ascending: false });
      setItems((rows as unknown as Conv[]) || []);
    });
  }, [router]);

  return (
    <>
      <h1>Inbox</h1>
      {items === null && <p className="empty">Loading…</p>}
      {items && items.length === 0 && (
        <p className="empty">No conversations yet.</p>
      )}
      {items?.map((c) => (
        <Link key={c.id} href={`/chat/${c.id}`} className="card">
          <div className="top">
            <span className="club">{c.listing?.club}</span>
            <span className="meta">{c.listing && fmtDate(c.listing.event_date)}</span>
          </div>
          <div className="meta">
            with {uid === c.owner_id ? c.other?.pseudo : c.owner?.pseudo}
          </div>
        </Link>
      ))}
    </>
  );
}
