"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useT } from "@/lib/i18n";
import { normalizePhone } from "@/lib/phone";

export default function Login() {
  const router = useRouter();
  const { t } = useT();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setInfo("");
    setBusy(true);
    if (mode === "signup") {
      const p = pseudo.trim();
      if (p.length < 3 || p.length > 20) {
        setError(t("nick_len"));
        setBusy(false);
        return;
      }
      const ph = normalizePhone(phone);
      if (!ph) {
        setError(t("phone_invalid"));
        setBusy(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { pseudo: p, phone: ph } },
      });
      if (error) {
        setError(
          error.message.includes("Database error") ? t("nick_taken") : error.message
        );
      } else if (!data.session) {
        setInfo(t("check_email"));
      } else {
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else router.push("/");
    }
    setBusy(false);
  }

  return (
    <>
      <h1>{mode === "signup" ? t("login_title_signup") : t("login_title_login")}</h1>
      <p className="sub">{t("login_sub")}</p>
      <form onSubmit={submit}>
        {mode === "signup" && (
          <>
            <label>{t("nickname")}</label>
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder={t("nickname_ph")}
              required
            />
          </>
        )}
        {mode === "signup" && (
          <>
            <label>{t("phone_label")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phone_ph")}
              required
            />
            <p className="meta">{t("phone_hint")}</p>
          </>
        )}
        <label>{t("email")}</label>
        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <label>{t("password")}</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} minLength={6} required />
        {error && <p className="err">{error}</p>}
        {info && <p className="ok">{info}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn block" disabled={busy}>
            {mode === "signup" ? t("sign_up") : t("login")}
          </button>
        </div>
      </form>
      <p style={{ textAlign: "center" }}>
        <button className="link" onClick={() => setMode(mode === "signup" ? "login" : "signup")}>
          {mode === "signup" ? t("have_account") : t("new_here")}
        </button>
      </p>
    </>
  );
}
