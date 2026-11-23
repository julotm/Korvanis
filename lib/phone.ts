// Normalise un numéro tapé par l'utilisateur. Retourne "+34600000000" ou null si invalide.
export function normalizePhone(raw: string): string | null {
  let s = raw.trim().replace(/[\s.\-()]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  return /^\+[0-9]{8,15}$/.test(s) ? s : null;
}
