"use client";

import { useRef, type ReactNode } from "react";
import { fireConfetti } from "./confetti";

/**
 * Renders text twice: a secondary-grey base and a primary-colour overlay
 * masked to a soft circle that follows the cursor — so the text under the
 * pointer brightens, making it easier to read.
 */
export function SpotlightText({
  children,
  className,
  glow,
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    el.style.setProperty("--glow-o", "1");
  }

  function onLeave() {
    ref.current?.style.setProperty("--glow-o", "0");
  }

  function onClick(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    // Fire from the cursor in the text's hover colour.
    const glowEl = el.querySelector(".spotlight-glow");
    const color = getComputedStyle(glowEl ?? el).color;
    fireConfetti(e.clientX, e.clientY, color);
  }

  return (
    <p
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      onClick={onClick}
      style={glow ? ({ "--glow-color": glow } as React.CSSProperties) : undefined}
      className={`spotlight ${className ?? ""}`}
    >
      <span className="spotlight-base">{children}</span>
      <span aria-hidden className="spotlight-glow">
        {children}
      </span>
    </p>
  );
}

type Product = {
  name: string;
  blurb: string;
  href?: string;
  accent: string;
};

// Every brandmark renders inside the same square box (mask `contain`, centred),
// so the box-edge-to-text gap is identical for all of them and no glyph touches
// the word regardless of its intrinsic aspect ratio.
const ICON_BOX = 18;

export function ProductCard({ p }: { p: Product }) {
  const titleClass =
    "product-title group inline-flex items-center text-[17px] font-semibold tracking-tight";

  const key = p.name.toLowerCase();
  const icon = (
    <span
      className="product-icon"
      aria-hidden
      style={{
        width: `${ICON_BOX}px`,
        height: `${ICON_BOX}px`,
        backgroundColor: p.accent,
        WebkitMaskImage: `url(/icons/${key}.svg)`,
        maskImage: `url(/icons/${key}.svg)`,
      }}
    />
  );

  function shake(e: React.MouseEvent<HTMLSpanElement>) {
    const el = e.currentTarget;
    // Don't restart while a shake is mid-flight — let it finish.
    if (el.classList.contains("shaking")) return;
    el.classList.add("shaking");
  }
  function clearShake(e: React.AnimationEvent<HTMLSpanElement>) {
    e.currentTarget.classList.remove("shaking");
  }

  const title = p.href ? (
    <a
      href={p.href}
      target="_blank"
      rel="noreferrer"
      className={titleClass}
      style={{ color: p.accent }}
    >
      {icon}
      {p.name}
    </a>
  ) : (
    <span
      className={titleClass}
      style={{ color: p.accent }}
      onMouseEnter={shake}
      onAnimationEnd={clearShake}
    >
      {icon}
      {p.name}
    </span>
  );

  return (
    <div>
      {title}
      <SpotlightText className="mt-3 text-[15px] font-medium leading-relaxed" glow={p.accent}>
        {p.blurb}
      </SpotlightText>
    </div>
  );
}
