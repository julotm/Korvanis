"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function Nav() {
  const [logged, setLogged] = useState<boolean | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setLogged(!!data.session));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) =>
      setLogged(!!s)
    );
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <header className="nav">
      <Link href="/" className="brand">
        <img src="/logo.svg" alt="" width={32} height={32} />
        <span>Korvanis</span>
      </Link>
      <nav>
        {logged ? (
          <>
            <Link href="/new" className="btn small">
              + Post
            </Link>
            <Link href="/inbox">Inbox</Link>
            <button
              className="link"
              onClick={() => supabase.auth.signOut()}
            >
              Log out
            </button>
          </>
        ) : logged === false ? (
          <Link href="/login" className="btn small">
            Log in
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
