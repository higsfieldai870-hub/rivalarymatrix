import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import JsonLd from "./components/JsonLd";
import FootballCursor from "./components/FootballCursor";
import RevealObserver from "./components/RevealObserver";
import SiteFooter from "./components/SiteFooter";
import SiteHeader from "./components/SiteHeader";
import styles from "./components/site.module.css";
import "./globals.css";
import { openGraph, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";

const barlow = Barlow_Condensed({
  variable: "--font-barlow",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const DEFAULT_TITLE = "Rivalry Matrix — Football Head-to-Head Comparisons";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | Rivalry Matrix",
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  keywords: [
    "football player comparison",
    "compare footballers",
    "player vs player stats",
    "head to head football stats",
    "Messi vs Ronaldo",
    "Haaland vs Mbappé",
    "football rivalries",
    "xG comparison",
  ],
  category: "sports",
  other: { "google-adsense-account": "ca-pub-4600349869609580" },
  openGraph: openGraph("/", DEFAULT_TITLE, SITE_DESCRIPTION),
  twitter: { card: "summary_large_image" },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
  },
};

// Tells search engines what the site is, for richer results.
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: "en",
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
    },
  ],
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${barlow.variable} ${inter.variable}`}>
      <body>
        <JsonLd data={jsonLd} />
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
