"use client";

import { useEffect, useRef } from "react";
import styles from "./site.module.css";

const HOVER_TARGETS = "a, button, [data-cursor-hover]";

export default function FootballCursor() {
  const ballRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ball = ballRef.current;
    const ring = ringRef.current;
    if (!ball || !ring) return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    root.classList.add("ball-cursor");

    let x = 0;
    let y = 0;
    let ringX = 0;
    let ringY = 0;
    let visible = false;
    let frame = 0;

    const place = (el: HTMLElement, px: number, py: number) => {
      el.style.transform = `translate3d(${px}px, ${py}px, 0) translate(-50%, -50%)`;
    };

    const setVisible = (value: boolean) => {
      visible = value;
      ball.toggleAttribute("data-visible", value);
      ring.toggleAttribute("data-visible", value);
    };

    const onMove = (event: PointerEvent) => {
      x = event.clientX;
      y = event.clientY;
      if (!visible) {
        ringX = x;
        ringY = y;
        setVisible(true);
      }
      place(ball, x, y);
    };

    const onOver = (event: PointerEvent) => {
      const target = event.target instanceof Element ? event.target : null;
      ring.toggleAttribute("data-hover", Boolean(target?.closest(HOVER_TARGETS)));
    };

    const onLeave = () => setVisible(false);

    // The ring trails the ball slightly.
    const tick = () => {
      ringX += (x - ringX) * 0.2;
      ringY += (y - ringY) * 0.2;
      place(ring, ringX, ringY);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver);
    root.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerover", onOver);
      root.removeEventListener("pointerleave", onLeave);
      root.classList.remove("ball-cursor");
    };
  }, []);

  return (
    <>
      <div ref={ballRef} className={styles.cursorBall} aria-hidden>
        ⚽
      </div>
      <div ref={ringRef} className={styles.cursorRing} aria-hidden />
    </>
  );
}
