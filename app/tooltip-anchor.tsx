"use client";

import {
  useRef,
  type HTMLAttributes,
  type PointerEvent,
  type ReactNode,
} from "react";

let activeTooltip: HTMLSpanElement | null = null;
let activeAnchor: HTMLElement | null = null;
let hideTimer: ReturnType<typeof setTimeout>;
const pointer = { x: 0, y: 0 };
let listening = false;

function position(anchor: HTMLElement, bubble: HTMLSpanElement) {
  const anchorRect = anchor.getBoundingClientRect();
  const gutter = 12;
  const left = Math.min(
    window.innerWidth - bubble.offsetWidth - gutter,
    Math.max(gutter, anchorRect.left + anchorRect.width / 2 - bubble.offsetWidth / 2),
  );

  bubble.style.left = `${left}px`;
  bubble.style.top = `${anchorRect.top - 10}px`;
}

function isPointerOver(anchor: HTMLElement) {
  const el = document.elementFromPoint(pointer.x, pointer.y);
  return !!el && (el === anchor || anchor.contains(el));
}

function dismissIfLeft() {
  if (!activeAnchor || !activeTooltip) return;
  if (activeAnchor.matches(":focus-visible")) {
    position(activeAnchor, activeTooltip);
    return;
  }
  if (!isPointerOver(activeAnchor)) hide(0);
  else position(activeAnchor, activeTooltip);
}

function trackPointer(e: globalThis.PointerEvent) {
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  dismissIfLeft();
}

function bindPointerGuards() {
  if (listening) return;
  listening = true;
  window.addEventListener("pointermove", trackPointer, { passive: true });
  window.addEventListener("scroll", dismissIfLeft, { capture: true, passive: true });
}

function show(anchor: HTMLElement, bubble: HTMLSpanElement) {
  clearTimeout(hideTimer);
  if (activeTooltip === bubble) {
    activeAnchor = anchor;
    position(anchor, bubble);
    return;
  }
  activeTooltip?.classList.remove("is-open");
  activeTooltip = bubble;
  activeAnchor = anchor;
  position(anchor, bubble);
  bubble.classList.add("is-open");
  bindPointerGuards();
}

function hide(delay = 120) {
  const bubble = activeTooltip;
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    bubble?.classList.remove("is-open");
    if (activeTooltip === bubble) {
      activeTooltip = null;
      activeAnchor = null;
    }
  }, delay);
}

function trackTouch(e: PointerEvent<HTMLDivElement>) {
  if (e.pointerType !== "touch") return;
  const anchor = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>(".activity-day");
  const bubble = anchor?.querySelector<HTMLSpanElement>(".tooltip-bubble");
  if (anchor && bubble) show(anchor, bubble);
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
  const anchorRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLSpanElement>(null);

  function positionTooltip() {
    const anchor = anchorRef.current;
    const bubble = tooltipRef.current;
    if (!anchor || !bubble) return;
    position(anchor, bubble);
  }

  return (
    <span
      {...props}
      ref={anchorRef}
      className={className}
      onMouseEnter={(e) => {
        pointer.x = e.clientX;
        pointer.y = e.clientY;
        const anchor = anchorRef.current;
        const bubble = tooltipRef.current;
        if (anchor && bubble) show(anchor, bubble);
      }}
      onMouseLeave={() => hide()}
      onFocus={positionTooltip}
    >
      {children}
      <span ref={tooltipRef} className="tooltip-bubble" role="tooltip">
        {tooltip}
      </span>
    </span>
  );
}
