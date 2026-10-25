import type { Metadata } from "next";
import Link from "next/link";
import compare from "@/app/components/comparison/comparison.module.css";
import prose from "@/app/components/prose.module.css";
import { CONTACT_EMAIL, openGraph } from "@/lib/site";

const title = "Contact Us";
const description =
  "Contact Rivalry Matrix about a stats correction, a player you can't find, a rivalry to add, or anything else.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/contact" },
  openGraph: openGraph("/contact", title, description),
};

export default function ContactPage() {
  return (
    <>
      <section className={compare.hero}>
        <div className={compare.container}>
          <div className={compare.eyebrow}>
            <i className={compare.eyebrowDot} />
            CONTACT
          </div>
          <h1 className={compare.heroTitle}>
            GET IN <span>TOUCH</span>
          </h1>
          <p className={compare.heroText}>
            Found a wrong number, a missing season or a player we can&apos;t find? Tell us.
          </p>
        </div>
      </section>

      <div className={prose.container}>
        <section>
          <h2>Email</h2>
          <a className={prose.email} href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <p>We reply as soon as we can.</p>
        </section>

        <section>
          <h2>What to write about</h2>
          <ul>
            <li>
              <strong>Stats corrections:</strong> include the comparison link, the number that
              looks wrong and, if you can, where the right figure comes from.
            </li>
            <li>
              <strong>Players you can&apos;t find:</strong> tell us the player&apos;s full name and
              current club.
            </li>
            <li>
              <strong>Rivalries to add:</strong> the head-to-heads you&apos;d like to see on the{" "}
              <Link href="/rivalries">rivalries page</Link>.
            </li>
            <li>
              <strong>Feedback, partnerships and anything else.</strong>
            </li>
          </ul>
        </section>

        <section>
          <h2>Your privacy</h2>
          <p>
            There are no contact forms on this site. If you email us, we use your message and
            address only to reply to you. See the <Link href="/privacy-policy">privacy policy</Link>{" "}
            for details.
          </p>
        </section>
      </div>
    </>
  );
}
