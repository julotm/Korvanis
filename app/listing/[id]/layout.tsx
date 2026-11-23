import type { Metadata } from "next";
import { createClient } from "@supabase/supabase-js";

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://opiqfohikszbjxvuwaee.supabase.co";
const key =
  process.env.NEXT_PUBLIC_SUPABASE_KEY ||
  "sb_publishable_SWQvM1TYS4_4cdqYgQKsMQ_f6y-s7x7";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    const sb = createClient(url, key);
    const { data } = await sb
      .from("listings")
      .select("club, event_date, price_cents, kind")
      .eq("id", id)
      .maybeSingle();
    if (!data) return {};
    const price = (data.price_cents / 100).toLocaleString("en-GB", {
      style: "currency",
      currency: "EUR",
      maximumFractionDigits: 2,
    });
    const date = new Date(data.event_date + "T12:00:00").toLocaleDateString(
      "en-GB",
      { weekday: "short", day: "numeric", month: "short" }
    );
    const title = `${data.kind === "sell" ? "For sale" : "Wanted"}: ${data.club} · ${date} · ${price}`;
    const description = "Club tickets between students on Korvanis. No commission.";
    return {
      title,
      description,
      openGraph: { title, description, images: ["/og.png"] },
    };
  } catch {
    return {};
  }
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
