"use client";

import { springValue, styleEffect } from "motion";
import {
  useId,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

let bubble: HTMLSpanElement | null = null;
let activeAnchor: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout> | undefined;
const tooltipX = springValue<number>(0, { stiffness: 500, damping: 42 });
const tooltipY = springValue<number>(0, { stiffness: 500, damping: 42 });
const pointer = { x: 0, y: 0 };
let listening = false;

function getBubble() {
  if (bubble) return bubble;
  const position = document.createElement("span");
  position.className = "tooltip-position";
  bubble = document.createElement("span");
  bubble.className = "tooltip-bubble";
  bubble.setAttribute("role", "tooltip");
  bubble.setAttribute("aria-hidden", "true");
  position.appendChild(bubble);
  document.body.appendChild(position);
  styleEffect(position, { x: tooltipX, y: tooltipY });
  return bubble;
}

function position(anchor: HTMLElement, bubble: HTMLSpanElement, smooth = false) {
  const anchorRect = anchor.getBoundingClientRect();
  const gutter = 12;
  const halfWidth = bubble.offsetWidth / 2;
  const x = Math.min(
    window.innerWidth - halfWidth - gutter,
    Math.max(halfWidth + gutter, anchorRect.left + anchorRect.width / 2),
  );
  const y = anchorRect.top - 10;

  if (smooth && Math.hypot(x - tooltipX.get(), y - tooltipY.get()) <= 180) {
    tooltipX.set(x);
    tooltipY.set(y);
    return true;
  } else {
    tooltipX.jump(x);
    tooltipY.jump(y);
    if (bubble.parentElement) {
      bubble.parentElement.style.transform = `translateX(${x}px) translateY(${y}px)`;
    }
    return false;
  }
}

function isPointerOver(anchor: HTMLElement) {
  const el = document.elementFromPoint(pointer.x, pointer.y);
  return !!el && (el === anchor || anchor.contains(el));
}

function dismissIfLeft(immediate = false) {
  if (!activeAnchor || !bubble) return;
  if (activeAnchor.matches(":focus-visible")) {
    position(activeAnchor, bubble);
    return;
  }
  if (!isPointerOver(activeAnchor)) hide(immediate ? 0 : 120);
}

function trackPointer(e: globalThis.PointerEvent) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  dismissIfLeft();
}

function trackScroll() {
  dismissIfLeft(true);
}

function bindPointerGuards() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("scroll", trackScroll, { capture: true, passive: true });
}

function show(anchor: HTMLElement, tooltip: string) {
  clearTimeout(hideTimer);
  hideTimer = undefined;
  const bubble = getBubble();
  if (activeAnchor === anchor && bubble.classList.contains("is-open")) {
    position(anchor, bubble);
    return;
  }
  const wasOpen = bubble.classList.contains("is-open");
  bubble.textContent = tooltip;
  activeAnchor = anchor;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const movedSmoothly = position(
    anchor,
    bubble,
    wasOpen && !reducedMotion,
  );
  if (wasOpen && !movedSmoothly && !reducedMotion) {
    bubble.style.transition = "none";
    bubble.classList.remove("is-open");
    void bubble.offsetWidth;
    bubble.style.removeProperty("transition");
  }
  bubble.classList.add("is-open");
  bindPointerGuards();
}

function hide(delay = 120) {
  if (hideTimer && delay > 0) return;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    hideTimer = undefined;
    bubble?.classList.remove("is-open");
    activeAnchor = null;
  }, delay);
}

function trackTouch(e: PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "touch") return;
  const anchor = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(".activity-day[data-tooltip]");
  if (anchor?.dataset.tooltip) show(anchor, anchor.dataset.tooltip);
}

export function TooltipRegion({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  return (
    <div
      className={className}
      onPointerDown={(e) => {
        if (e.pointerType !== "touch") return;
        e.currentTarget.setPointerCapture(e.pointerId);
        trackTouch(e);
      }}
      onPointerMove={trackTouch}
      onPointerUp={(e) => {
        if (e.pointerType === "touch") hide(400);
      }}
      onPointerCancel={(e) => {
        if (e.pointerType === "touch") hide();
      }}
    >
      {children}
    </div>
  );
}

export function TooltipAnchor({
  children,
  tooltip,
  className,
  ...props
}: {
  children?: ReactNode;
  tooltip: string;
  className: string;
} & Omit<HTMLAttributes<HTMLSpanElement>, "children">) {
  const tooltipId = useId();

  return (
    <span
      {...props}
      className={className}
      data-tooltip={tooltip}
      aria-describedby={props["aria-label"] ? undefined : tooltipId}
      onMouseEnter={(e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        show(e.currentTarget, tooltip);
      }}
      onMouseLeave={() => hide()}
      onFocus={(e) => show(e.currentTarget, tooltip)}
      onBlur={() => hide(0)}
    >
      {children}
      {!props["aria-label"] ? <span id={tooltipId} className="sr-only">{tooltip}</span> : null}
    </span>
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
