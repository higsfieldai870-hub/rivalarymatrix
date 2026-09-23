"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./site.module.css";

const links = [{ href: "/compare", label: "Compare Players" }];

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo}>
          <i className={styles.logoMark} aria-hidden />
          RIVALRY<span>MATRIX</span>
        </Link>

        <nav className={styles.nav} aria-label="Rivalries">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLink}
              aria-current={pathname === link.href ? "page" : undefined}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
