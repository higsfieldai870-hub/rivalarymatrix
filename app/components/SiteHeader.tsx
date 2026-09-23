"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import styles from "./site.module.css";

const links = [{ href: "/compare", label: "Compare", more: " Players" }];

// Scroll distance that counts as a deliberate direction change, so small
// trackpad jitters don't flicker the header.
const THRESHOLD = 6;

export default function SiteHeader() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let frame = 0;

    const update = () => {
      frame = 0;
      const y = window.scrollY;
      const height = ref.current?.offsetHeight ?? 0;
      setScrolled(y > 4);
      if (y <= height) setHidden(false);
      else if (y > last + THRESHOLD) setHidden(true);
      else if (y < last - THRESHOLD) setHidden(false);
      else return;
      last = y;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Let other sticky bars sit just below the header while it is showing.
  useEffect(() => {
    const root = document.documentElement;
    const sync = () => {
      const height = hidden ? 0 : (ref.current?.offsetHeight ?? 0);
      root.style.setProperty("--header-offset", `${height}px`);
    };
    sync();
    const observer = new ResizeObserver(sync);
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [hidden]);

  return (
    <header
      ref={ref}
      className={styles.header}
      data-hidden={hidden || undefined}
      data-scrolled={scrolled || undefined}
      onFocus={() => setHidden(false)}
    >
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
              <span className={styles.navMore}>{link.more}</span>
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
