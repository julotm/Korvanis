import { supabase } from "./supabase";

// Demande au serveur d'envoyer un email à l'autre personne (sans bloquer l'interface).
export async function notify(
  conversationId: string,
  kind: "new_conversation" | "message"
) {
  try {
    const { data } = await supabase.auth.getSession();
    const token = data.session?.access_token;
    if (!token) return;
    await fetch("/api/notify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ conversationId, kind }),
    });
  } catch {
    /* pas grave */
  }
}
