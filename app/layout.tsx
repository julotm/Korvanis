import "./globals.css";
import type { Metadata, Viewport } from "next";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import Marquee from "@/components/Marquee";
import { LangProvider } from "@/lib/i18n";

const SITE = "https://korvanis-delta.vercel.app";
const DESC =
  "Buy and sell nightclub entries between students in Barcelona. Anonymous, simple, no commission.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: "Korvanis — club tickets, student to student",
  description: DESC,
  openGraph: {
    title: "Korvanis — club tickets, student to student",
    description: DESC,
    url: SITE,
    siteName: "Korvanis",
    images: [{ url: "/og.png", width: 1080, height: 1080 }],
    type: "website",
  },
  twitter: { card: "summary", images: ["/og.png"] },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111111",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <LangProvider>
          <Nav />
          <Marquee />
          <main>{children}</main>
          <Footer />
        </LangProvider>
      </body>
    </html>
  );
}
