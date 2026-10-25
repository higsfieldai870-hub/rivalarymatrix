import type { Metadata } from "next";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import prose from "@/app/components/prose.module.css";
import { CONTACT_EMAIL, openGraph } from "@/lib/site";

const title = "About Us";
const description =
  "Rivalry Matrix is an independent football statistics site that puts any two players side by side: career numbers, per 90 output, season-by-season form and scouting reports.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/about" },
  openGraph: openGraph("/about", title, description),
};

export default function AboutPage() {
  return (
    <>
      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            ABOUT US
          </div>
          <h1 className={compare.heroTitle}>
            ABOUT <span>RIVALRY MATRIX</span>
          </h1>
          <p className={compare.heroText}>
            An independent football statistics site for settling the debates fans have every
            week: who is better, by the numbers.
          </p>
        </div>
      </section>

      <div className={prose.container}>
        <section>
          <h2>What we do</h2>
          <p>
            Rivalry Matrix puts two footballers side by side. Every comparison lines up both
            players&apos; careers on the same scale: goals and assists, appearances and minutes,
            per 90 numbers, season-by-season charts, shooting, passing, dribbling and defensive
            stats, scouting ratings, transfers and international records.
          </p>
          <p>
            Start with the <Link href="/rivalries">most popular football rivalries</Link>, from
            Messi vs Ronaldo to the new generation, or{" "}
            <Link href="/compare">compare any two players</Link> you like. If a number is new to
            you, the <Link href="/stats-guide">football stats guide</Link> explains what each one
            means and how to read it.
          </p>
        </section>

        <section>
          <h2>Where the data comes from</h2>
          <p>
            Player statistics, profiles and photos come from BSD (Bzzoiro Sports Data), a football
            data provider. Match data covers the 2011/12 season onwards, so career totals for
            players who started earlier can sit below their official figures. Detailed per-match
            stats such as shots, passes and duels are available for most matches from the
            mid-2010s on.
          </p>
          <p>
            Stats are refreshed daily. Data from any provider can contain gaps or mistakes; if you
            spot one, <Link href="/contact">let us know</Link> and we&apos;ll look into it.
          </p>
        </section>

        <section>
          <h2>Independent</h2>
          <p>
            Rivalry Matrix is not affiliated with, or endorsed by, any club, league, federation or
            player. Club names, competition names and player names belong to their owners and are
            used only to identify who is being compared.
          </p>
        </section>

        <section>
          <h2>Get in touch</h2>
          <p>
            Questions, corrections or ideas for a rivalry we should add: email{" "}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> or visit the{" "}
            <Link href="/contact">contact page</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
