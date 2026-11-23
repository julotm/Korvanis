export const eur = (cents: number) =>
  (cents / 100).toLocaleString("en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  });

export const fmtDate = (d: string) =>
  new Date(d + "T12:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

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
