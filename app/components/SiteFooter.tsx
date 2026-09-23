import Link from "next/link";
import styles from "./site.module.css";

const explore = [
  { href: "/", label: "Home" },
  { href: "/compare", label: "Compare Players" },
];

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerGlow} aria-hidden />

      <div className={styles.footerInner}>
        <div className={styles.footerTop}>
          <div className={styles.footerBrand}>
            <Link href="/" className={styles.footerLogo}>
              <i className={styles.logoMark} aria-hidden />
              RIVALRY<span>MATRIX</span>
            </Link>
            <p>
              Football head-to-head analytics. Put any two players side by side and
              settle the debate with the numbers.
            </p>
            <Link href="/compare" className={styles.footerCta}>
              Start a comparison <span aria-hidden>→</span>
            </Link>
          </div>

          <nav className={styles.footerCol} aria-label="Footer">
            <h4>Explore</h4>
            {explore.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>

          <div className={styles.footerCol}>
            <h4>Data</h4>
            <p>
              Match data covers <strong>2011/12 onwards</strong>. Earlier seasons aren&apos;t
              included, so career totals can sit below official figures.
            </p>
          </div>
        </div>

        <div className={styles.footerBottom}>
          <span>© RivalryMatrix. Built for football fans.</span>
          <a href="#" className={styles.backToTop}>
            Back to top <span aria-hidden>↑</span>
          </a>
        </div>
      </div>
    </footer>
  );
}
