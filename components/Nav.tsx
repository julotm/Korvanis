"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { LANGS, Lang, useT } from "@/lib/i18n";

export default function Nav() {
  const [logged, setLogged] = useState<boolean | null>(null);
  const { t, lang, setLang } = useT();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setLogged(!!s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="masthead">
      <div className="nav-in">
        <Link href="/" className="nav-logo" aria-label="Korvanis">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Korvanis" />
        </Link>
        <nav className="nav-links">
          <Link href="/">Tickets</Link>
          <Link href="/map">{t("nav_map")}</Link>
          {logged ? (
            <>
              <Link href="/new">{t("post")}</Link>
              <Link href="/inbox">{t("inbox")}</Link>
              <button className="link" onClick={() => supabase.auth.signOut()}>
                {t("logout")}
              </button>
            </>
          ) : logged === false ? (
            <Link href="/login">{t("login")}</Link>
          ) : null}
          <select
            className="langsel"
            value={lang}
            onChange={(e) => setLang(e.target.value as Lang)}
            aria-label="Language"
          >
            {LANGS.map((l) => (
              <option key={l} value={l}>
                {l.toUpperCase()}
              </option>
            ))}
          </select>
        </nav>
      </div>
    </header>
  );
}
