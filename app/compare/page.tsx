import type { Metadata } from "next";
import Link from "next/link";
import api from "@/app/components/comparison/api.module.css";
import styles from "@/app/components/comparison/comparison.module.css";
import { MissingKeyNotice } from "@/app/components/comparison/Notices";
import PickerRow from "@/app/components/comparison/PickerRow";
import { hasApiKey } from "@/lib/bsd/client";

export const metadata: Metadata = {
  title: "Compare Any Two Players",
  description:
    "Search any two footballers and compare their live stats side by side: goals, assists, xG, ratings, scouting reports, transfers and more.",
};

const quickPicks = [
  { label: "Messi vs Ronaldo", href: "/compare/lionel-messi-vs-cristiano-ronaldo" },
  { label: "Haaland vs Mbappé", href: "/compare/erling-haaland-vs-kylian-mbappe" },
];

export default function ComparePage() {
  return (
    <section className={styles.hero}>
      <div className={styles.container}>
        <div className={styles.eyebrow}>
          <i className={styles.eyebrowDot} />
          BUILD YOUR OWN • LIVE API DATA
        </div>

        <h1 className={styles.heroTitle}>
          PLAYER <span>VS</span> PLAYER
        </h1>

        <p className={styles.heroText}>
          Type the names of any two players, then open the full comparison: match stats, xG,
          scouting reports, contracts, transfers and more.
        </p>

        {hasApiKey() ? (
          <PickerRow />
        ) : (
          <div className={api.pickerNotice}>
            <MissingKeyNotice />
          </div>
        )}

        <div className={api.quickPicks}>
          <span>TRY</span>
          {quickPicks.map((pick) => (
            <Link key={pick.label} className={api.quickPick} href={pick.href}>
              {pick.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
