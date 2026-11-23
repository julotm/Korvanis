import { LOCALES, Lang } from "./i18n";

export const eur = (cents: number) =>
  (cents / 100).toLocaleString("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

export const fmtDate = (d: string, lang: Lang = "en") =>
  new Date(d + "T12:00:00").toLocaleDateString(LOCALES[lang], {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

export const dayNum = (d: string) => new Date(d + "T12:00:00").getDate();
export const monthShort = (d: string, lang: Lang = "en") =>
  new Date(d + "T12:00:00").toLocaleDateString(LOCALES[lang], { month: "short" });

export type Listing = {
  id: string;
  user_id: string;
  kind: "sell" | "want";
  club: string;
  event_date: string;
  price_cents: number;
  face_cents: number | null;
  quantity: number;
  note: string | null;
  status: "open" | "closed";
  created_at: string;
  profiles?: { pseudo: string } | null;
};
