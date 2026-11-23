"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LOCALES, useT } from "@/lib/i18n";

export default function PersonCard({
  userId,
  pseudo,
  label,
}: {
  userId: string;
  pseudo: string;
  label?: string;
}) {
  const { t, lang } = useT();
  const [avg, setAvg] = useState<number | null>(null);
  const [n, setN] = useState(0);
  const [since, setSince] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("reviews")
      .select("rating")
      .eq("target_id", userId)
      .then(({ data }) => {
        if (data && data.length) {
          setN(data.length);
          setAvg(data.reduce((s, r) => s + r.rating, 0) / data.length);
        }
      });
    supabase
      .from("profiles")
      .select("created_at")
      .eq("id", userId)
      .maybeSingle()
      .then(({ data }) => setSince(data?.created_at ?? null));
  }, [userId]);

  return (
    <div className="person">
      <div className="avatar">{pseudo.slice(0, 1).toUpperCase()}</div>
      <div>
        <div className="p-name">
          {label ? <span className="p-label">{label}</span> : null}
          {pseudo}
        </div>
        <div className="meta">
          {avg !== null
            ? `★ ${avg.toFixed(1)} · ${n === 1 ? t("one_review") : t("n_reviews", { n })}`
            : t("no_reviews")}
          {since
            ? ` · ${t("member_since", {
                date: new Date(since).toLocaleDateString(LOCALES[lang], {
                  month: "short",
                  year: "numeric",
                }),
              })}`
            : ""}
        </div>
      </div>
    </div>
  );
}
