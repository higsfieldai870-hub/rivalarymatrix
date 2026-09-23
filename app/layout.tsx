import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import FootballCursor from "./components/FootballCursor";
import RevealObserver from "./components/RevealObserver";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import styles from "./components/site.module.css";
import "./globals.css";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Rivalry Matrix — Football Head-to-Head Comparisons",
    template: "%s | Rivalry Matrix",
  },
  description:
    "Football's biggest rivalries settled with data: career numbers, season-by-season charts, per-90 efficiency and trophy cabinets, side by side.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body>
        <div className={styles.pitchBg} aria-hidden />
        <div className={styles.pitchCircle} aria-hidden />

        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />

        <FootballCursor />
        <RevealObserver />
      </body>
    </html>
  );
}
