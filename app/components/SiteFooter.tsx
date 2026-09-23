import styles from "./site.module.css";

export default function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.footerInner}>
        <div className={styles.footerLogo}>
          RIVALRY<span>MATRIX</span>
        </div>

        <p>
          Football head-to-head analytics. Figures are compiled for comparison
          and may differ slightly from official sources.
        </p>
      </div>
    </footer>
  );
}
