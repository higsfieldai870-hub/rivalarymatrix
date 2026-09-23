import type { ReactNode } from "react";
import api from "./api.module.css";
import styles from "./comparison.module.css";

export function Notice({
  title,
  children,
  error = false,
}: {
  title: string;
  children: ReactNode;
  error?: boolean;
}) {
  return (
    <div className={`${api.notice} ${error ? api.noticeError : ""}`} role={error ? "alert" : "status"}>
      <span className={api.noticeIcon} aria-hidden>
        {error ? "⚠️" : "⚽"}
      </span>
      <div>
        <strong>{title}</strong>
        {children}
      </div>
    </div>
  );
}

export function NoticeBlock({ children }: { children: ReactNode }) {
  return (
    <section className={styles.container}>
      <div className={api.noticeBlock}>{children}</div>
    </section>
  );
}

export function MissingKeyNotice() {
  return (
    <Notice title="API key needed" error>
      Add <code>STATS_A_KEY=your_key</code> to <code>.env</code> in the project root, then restart
      the dev server.
    </Notice>
  );
}

export function ComparisonSkeleton() {
  return (
    <section className={styles.container} aria-busy="true">
      <p className={api.loadingText}>
        <span className={api.spinner} aria-hidden />
        Loading live data. The first load of a player gathers every season and can take a few
        seconds; after that it&apos;s cached.
      </p>
      <div className={`${api.skeleton} ${api.skeletonShowcase}`} />
      <div className={`${api.skeleton} ${api.skeletonBlock}`} />
      <div className={`${api.skeleton} ${api.skeletonBlock}`} />
    </section>
  );
}
