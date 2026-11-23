import { CLUBS } from "@/lib/clubs";

export default function Marquee() {
  const row = CLUBS.map((c) => c.toUpperCase()).join("  ★  ") + "  ★  ";
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{row}</span>
        <span>{row}</span>
      </div>
    </div>
  );
}
