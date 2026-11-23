"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function Login() {
  const router = useRouter();
  const [mode, setMode] = useState<"signup" | "login">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pseudo, setPseudo] = useState("");
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
        setError("Pick a nickname between 3 and 20 characters.");
        setBusy(false);
        return;
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { pseudo: p } },
      });
      if (error) {
        setError(
          error.message.includes("Database error")
            ? "That nickname is already taken."
            : error.message
        );
      } else if (!data.session) {
        setInfo("Check your inbox to confirm your email, then log in.");
      } else {
        router.push("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) setError(error.message);
      else router.push("/");
    }
    setBusy(false);
  }

  return (
    <>
      <h1>{mode === "signup" ? "Create your account" : "Log in"}</h1>
      <p className="sub">
        Other users only ever see your nickname, never your name or email.
      </p>
      <form onSubmit={submit}>
        {mode === "signup" && (
          <>
            <label>Nickname</label>
            <input
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              placeholder="e.g. nightowl42"
              required
            />
          </>
        )}
        <label>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={6}
          required
        />
        {error && <p className="err">{error}</p>}
        {info && <p className="ok">{info}</p>}
        <div style={{ marginTop: 16 }}>
          <button className="btn block" disabled={busy}>
            {mode === "signup" ? "Sign up" : "Log in"}
          </button>
        </div>
      </form>
      <p style={{ textAlign: "center" }}>
        <button
          className="link"
          onClick={() => setMode(mode === "signup" ? "login" : "signup")}
        >
          {mode === "signup"
            ? "Already have an account? Log in"
            : "New here? Sign up"}
        </button>
      </p>
    </>
  );
}
