import React, { useEffect, useRef, useState } from "react";

/** Parse values like 1200, "1,200", "1.2K", "3.5M+", "75%" into a number + suffix */
function parseValue(v) {
  if (typeof v === "number") return { num: v, suffix: "" };
  const str = String(v).trim();

  // Keep %-sign or plus if present at the end
  const hasPercent = str.endsWith("%");
  const hasPlus = str.endsWith("+");

  // Extract K/M/B suffix
  const suffixMatch = str.match(/([kKmMbB])\+?%?$/);
  const suffixLetter = suffixMatch ? suffixMatch[1].toUpperCase() : "";

  // Strip commas and non-numeric except dot and suffix
  const numericPart = parseFloat(str.replace(/[, %+kKmMbB]/g, "")) || 0;

  let multiplier = 1;
  if (suffixLetter === "K") multiplier = 1_000;
  if (suffixLetter === "M") multiplier = 1_000_000;
  if (suffixLetter === "B") multiplier = 1_000_000_000;

  const num = numericPart * multiplier;
  const suffix =
    (suffixLetter ? suffixLetter : "") + (hasPlus ? "+" : "") + (hasPercent ? "%" : "");
  return { num, suffix };
}

/** Format with commas (1,234,567). Keeps decimals if needed. */
function formatWithCommas(n) {
  return n.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

/** Simple visibility hook (triggers once when element enters viewport) */
function useOnScreenOnce(ref, rootMargin = "0px") {
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current || seen) return;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSeen(true);
          obs.disconnect();
        }
      },
      { root: null, rootMargin, threshold: 0.2 }
    );
    obs.observe(ref.current);
    return () => obs.disconnect();
  }, [ref, rootMargin, seen]);
  return seen;
}

/** CountUp: animates 0 → end (number or "1.2K+", "75%", etc.) when visible */
export function CountUp({ end, duration = 1200, easeOut = true, className = "" }) {
  const { num, suffix } = parseValue(end);
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const elRef = useRef(null);
  const seen = useOnScreenOnce(elRef);
  const [display, setDisplay] = useState(prefersReduced ? formatWithCommas(num) : "0");

  useEffect(() => {
    if (prefersReduced || !seen) return;

    let rafId;
    const start = performance.now();
    const startVal = 0;
    const endVal = num;

    const animate = (t) => {
      const elapsed = t - start;
      let p = Math.min(1, elapsed / duration);
      if (easeOut) {
        // Ease out cubic
        p = 1 - Math.pow(1 - p, 3);
      }
      const current = startVal + (endVal - startVal) * p;
      setDisplay(formatWithCommas(Math.round(current)));
      if (p < 1) {
        rafId = requestAnimationFrame(animate);
      }
    };

    rafId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafId);
  }, [seen, prefersReduced, duration, num, easeOut]);

  return (
    <span ref={elRef} className={className}>
      {display}
      {suffix}
    </span>
  );
}

/* ===================== Example usage with ABOUT_STATS ===================== */
/* Provide your ABOUT_STATS from elsewhere or use this example: */
export const ABOUT_STATS = [
  {
    label: "Years in Business",
    value: 12,
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s",
  },
  {
    label: "Projects Delivered",
    value: "1.5K+",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s",
  },
  {
    label: "Client Satisfaction",
    value: "98%",
    img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s",
  },
];

export default function AboutStatsSection({ items = ABOUT_STATS }) {
  return (
    <section>
      <div className="stats-grid" data-slot="about-stats">
        {items.map((s) => (
          <div
            className="stat flex flex-col items-center text-center"
            key={s.label}
          >
            <img
              src={
                s.img ||
                "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRjuyF_XlkJc7N12XmYWdvJYL9I1sKtNvcapw&s"
              }
              alt={s.alt || s.label}
              className="pb-4 w-20 h-20 rounded-full object-cover"
            />
            <strong className="text-2xl">
              <CountUp end={s.value} />
            </strong>
            <span className="opacity-80">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
