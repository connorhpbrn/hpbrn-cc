"use client";

import { useRef, type ReactNode } from "react";
import { fireConfetti } from "./confetti";
import { TooltipAnchor } from "./tooltip-anchor";

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

export function Keyword({
  children,
  tooltip,
}: {
  children: ReactNode;
  tooltip: string;
}) {
  return (
    <TooltipAnchor className="keyword" tooltip={tooltip} tabIndex={0}>
      {children}
    </TooltipAnchor>
  );
}
