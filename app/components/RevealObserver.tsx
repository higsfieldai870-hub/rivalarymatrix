"use client";

import { useEffect } from "react";

// Fades in every [data-reveal] element as it scrolls into view. A mutation
// observer picks up elements added later: new pages, streamed Suspense
// content and "show more" toggles.
export default function RevealObserver() {
  useEffect(() => {
    const reveal = (el: Element) => el.setAttribute("data-visible", "");

    if (!("IntersectionObserver" in window)) {
      document.querySelectorAll("[data-reveal]").forEach(reveal);
      return;
    }

    document.documentElement.classList.add("reveal-ready");

    const seen = new WeakSet<Element>();
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          reveal(entry.target);
          observer.unobserve(entry.target);
        }
      },
      // Trigger on the first visible pixel: a ratio threshold never fires for
      // elements taller than the viewport (the full stat battle is ~7,500px).
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    const scan = () => {
      document.querySelectorAll("[data-reveal]:not([data-visible])").forEach((el) => {
        if (seen.has(el)) return;
        seen.add(el);
        observer.observe(el);
      });
    };

    let frame = 0;
    const mutations = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(scan);
    });

    scan();
    mutations.observe(document.body, { childList: true, subtree: true });

    return () => {
      cancelAnimationFrame(frame);
      mutations.disconnect();
      observer.disconnect();
    };
  }, []);

  return null;
}
