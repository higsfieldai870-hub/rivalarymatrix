"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import logo from "@/public/logo.png";
import styles from "./site.module.css";

const links = [
  { href: "/compare", label: "Compare", more: " Players" },
  { href: "/rivalries", label: "Rivalries", more: "" },
  { href: "/live", label: "Watch", more: " Live" },
];

// Scroll distance that counts as a deliberate direction change, so small
// trackpad jitters don't flicker the header.
const THRESHOLD = 6;

export default function SiteHeader() {
  const pathname = usePathname();
  const ref = useRef<HTMLElement>(null);
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // The mobile menu; on wider screens the links are always showing.
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

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

  // Escape or a tap outside the header closes the mobile menu.
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    const onPointer = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointer);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointer);
    };
  }, [open]);

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
      data-hidden={(hidden && !open) || undefined}
      data-scrolled={scrolled || undefined}
      data-open={open || undefined}
      onFocus={() => setHidden(false)}
    >
      <div className={styles.headerInner}>
        <Link href="/" className={styles.logo} onClick={close}>
          <Image
            src={logo}
            alt=""
            width={40}
            height={40}
            priority
            className={styles.logoImage}
          />
          RIVALRY<span>MATRIX</span>
        </Link>

        <button
          type="button"
          className={styles.menuButton}
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-nav"
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
          <span />
        </button>

        <nav id="site-nav" className={styles.nav} aria-label="Main">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={styles.navLink}
              aria-current={pathname === link.href ? "page" : undefined}
              onClick={close}
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
