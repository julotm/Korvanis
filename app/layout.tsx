import "./globals.css";
import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";

export const metadata: Metadata = {
  title: "Korvanis — club tickets, student to student",
  description:
    "Buy and sell nightclub entries between students. Anonymous, simple, no commission (for now).",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#14122B",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Nav />
        <main>{children}</main>
        <footer>
          Korvanis is a meeting place between students. We don&apos;t sell
          tickets and we don&apos;t take any commission. Resell at face value
          at most.
        </footer>
      </body>
    </html>
  );
}
