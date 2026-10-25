import type { Metadata } from "next";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import prose from "@/app/components/prose.module.css";
import { CONTACT_EMAIL, openGraph } from "@/lib/site";

const title = "Privacy Policy";
const description =
  "Rivalry Matrix doesn't ask for, collect or sell personal information: no accounts, no forms, no cookies of our own and no tracking.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/privacy-policy" },
  openGraph: openGraph("/privacy-policy", title, description),
};

// Keep this accurate to what the site actually does. If analytics, forms,
// accounts or ads are added, this page has to change with them.
const UPDATED = "25 October 2026";

const external = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function PrivacyPolicyPage() {
  const email = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

  return (
    <>
      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            LEGAL
          </div>
          <h1 className={compare.heroTitle}>
            PRIVACY <span>POLICY</span>
          </h1>
          <p className={compare.heroText}>
            The short version: we don&apos;t collect, store or sell personal information about you.
          </p>
        </div>
      </section>

      <div className={prose.container}>
        <p className={prose.updated}>Last updated: {UPDATED}</p>

        <section>
          <h2>The short version</h2>
          <p>
            Rivalry Matrix has no accounts, no sign-ups and no forms. We don&apos;t ask for your
            name, email address or any other personal information, the site sets no cookies of its
            own, and we don&apos;t use analytics or tracking tools. We never sell or share data
            about our visitors.
          </p>
        </section>

        <section>
          <h2>Who we are</h2>
          <p>
            This policy covers rivalrymetrics.com (&quot;Rivalry Matrix&quot;, &quot;we&quot;,
            &quot;us&quot;), a football statistics site. You can reach us at {email}.
          </p>
        </section>

        <section>
          <h2>What we don&apos;t collect</h2>
          <ul>
            <li>Names, email addresses or phone numbers (unless you choose to email us)</li>
            <li>Passwords or account details: there are no accounts</li>
            <li>Payment details: the site is free</li>
            <li>Your location, contacts or anything else from your device</li>
          </ul>
        </section>

        <section>
          <h2>Server logs</h2>
          <p>
            Like almost every website, the server that hosts this site automatically records
            standard technical information about each request: the IP address, browser and device
            type, the page requested, the referring page and the time. We use these logs only to
            keep the site running and secure, for example to find faults or block abusive traffic.
            We don&apos;t use them to identify you or build a profile of you, we don&apos;t sell or
            share them unless the law requires it, and we keep them only as long as we need them
            for those purposes.
          </p>
          <p>
            For visitors in the UK and the European Union, the legal basis for these logs is our
            legitimate interest in running a secure, working website.
          </p>
        </section>

        <section>
          <h2>Player searches</h2>
          <p>
            When you search for a player, the name you type is sent from our server to our football
            data provider, BSD (Bzzoiro Sports Data), to find matching players. Nothing else about
            you is sent with it. Results are cached on our server by the search text, for up to a
            day, so repeat searches load faster; the cache doesn&apos;t record who searched.
          </p>
        </section>

        <section>
          <h2>Player data and images</h2>
          <p>
            Stats and player photos are loaded through our own server, so your browser doesn&apos;t
            connect to our data provider while you use the site.
          </p>
        </section>

        <section>
          <h2>Cookies and advertising</h2>
          <p>
            Our site doesn&apos;t set cookies or store anything in your browser.
          </p>
          <p>
            This site may show ads served by Google AdSense. When ads are shown, third-party
            vendors, including Google, use cookies to serve ads based on your previous visits to
            this website or other websites. Google&apos;s use of advertising cookies enables it and
            its partners to serve ads to you based on your visits to this site and/or other sites
            on the internet.
          </p>
          <ul>
            <li>
              You can opt out of personalised advertising in{" "}
              <a href="https://adssettings.google.com" {...external}>
                Google&apos;s Ads Settings
              </a>
              .
            </li>
            <li>
              You can opt out of some third-party vendors&apos; use of cookies for personalised
              advertising at{" "}
              <a href="https://www.aboutads.info/choices" {...external}>
                aboutads.info
              </a>{" "}
              (or{" "}
              <a href="https://www.youronlinechoices.eu" {...external}>
                youronlinechoices.eu
              </a>{" "}
              in Europe).
            </li>
            <li>
              Read{" "}
              <a href="https://policies.google.com/technologies/partner-sites" {...external}>
                how Google uses information from sites that use its services
              </a>
              .
            </li>
          </ul>
        </section>

        <section>
          <h2>Links to other sites</h2>
          <p>
            Comparisons can link to posts on X (Twitter) and other websites. Those sites have their
            own privacy policies, which apply once you leave Rivalry Matrix.
          </p>
        </section>

        <section>
          <h2>Children</h2>
          <p>
            This site is for a general audience and isn&apos;t directed at children under 13. We
            don&apos;t knowingly collect personal information from anyone, including children.
          </p>
        </section>

        <section>
          <h2>Your rights</h2>
          <p>
            Because we don&apos;t hold personal information about you, there is normally nothing to
            access, correct or delete. If you have emailed us and want that email deleted, or you
            have any question about your data, contact us at {email}.
          </p>
        </section>

        <section>
          <h2>Changes to this policy</h2>
          <p>
            If this policy changes, we&apos;ll update this page and the date at the top. See also
            our <Link href="/terms">terms of use</Link>.
          </p>
        </section>
      </div>
    </>
  );
}
