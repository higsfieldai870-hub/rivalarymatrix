import type { Metadata } from "next";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import prose from "@/app/components/prose.module.css";
import { CONTACT_EMAIL, openGraph } from "@/lib/site";

const title = "Terms of Use";
const description =
  "The terms for using Rivalry Matrix: free football statistics for information and entertainment, with data from a third-party provider.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/terms" },
  openGraph: openGraph("/terms", title, description),
};

const UPDATED = "25 October 2026";

export default function TermsPage() {
  return (
    <>
      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            LEGAL
          </div>
          <h1 className={compare.heroTitle}>
            TERMS OF <span>USE</span>
          </h1>
          <p className={compare.heroText}>
            The ground rules for using Rivalry Matrix, in plain English.
          </p>
        </div>
      </section>

      <div className={prose.container}>
        <p className={prose.updated}>Last updated: {UPDATED}</p>

        <section>
          <h2>Using this site</h2>
          <p>
            By using rivalrymetrics.com (&quot;Rivalry Matrix&quot;, &quot;we&quot;,
            &quot;us&quot;) you agree to these terms. If you don&apos;t agree, please don&apos;t use
            the site.
          </p>
        </section>

        <section>
          <h2>What we provide</h2>
          <p>
            Rivalry Matrix is a free football statistics site that compares players side by side.
            It&apos;s provided for information and entertainment.
          </p>
        </section>

        <section>
          <h2>Accuracy of the data</h2>
          <p>
            Statistics, profiles and photos come from a third-party data provider, BSD (Bzzoiro
            Sports Data). We work to present them correctly, but the data can contain errors, gaps
            or delays. Match data covers the 2011/12 season onwards, so career totals for some
            players sit below their official figures.
          </p>
          <p>
            The site and its data are provided &quot;as is&quot;, without any warranty. Don&apos;t
            rely on them for betting, financial or other decisions. If you find a mistake, please{" "}
            <Link href="/contact">tell us</Link>.
          </p>
        </section>

        <section>
          <h2>No affiliation</h2>
          <p>
            Rivalry Matrix is independent. It isn&apos;t affiliated with, or endorsed by, any club,
            league, federation or player. Names, logos, trademarks and images belong to their
            respective owners and are used only to identify the players and teams being compared.
          </p>
        </section>

        <section>
          <h2>Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>try to disrupt, overload or break the site or the servers it runs on</li>
            <li>
              collect data from the site with automated tools at a volume that affects other
              visitors
            </li>
            <li>use the site for anything unlawful</li>
          </ul>
        </section>

        <section>
          <h2>Links to other sites</h2>
          <p>
            Some pages link to other websites, such as posts on X (Twitter). We don&apos;t control
            those sites and aren&apos;t responsible for their content.
          </p>
        </section>

        <section>
          <h2>Changes and availability</h2>
          <p>
            We may change, pause or remove any part of the site at any time, and we may update
            these terms. The date at the top shows when they last changed.
          </p>
        </section>

        <section>
          <h2>Limitation of liability</h2>
          <p>
            To the fullest extent the law allows, Rivalry Matrix isn&apos;t liable for any loss or
            damage arising from your use of the site or your reliance on its data.
          </p>
        </section>

        <section>
          <h2>Contact</h2>
          <p>
            Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
            See also our <Link href="/privacy-policy">privacy policy</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
