"use client";

import { useEffect, useState } from "react";

type Origin = { x: number; y: number };

function apply(nextDark: boolean) {
  document.documentElement.classList.toggle("dark", nextDark);
  try {
    localStorage.setItem("theme", nextDark ? "dark" : "light");
  } catch {}
  window.dispatchEvent(new Event("themechange"));
}

function startViewTransition() {
  return (
    document as Document & {
      startViewTransition?: (cb: () => void) => { ready: Promise<void> };
    }
  ).startViewTransition?.bind(document);
}

function flipTheme(origin?: Origin) {
  const nextDark = !document.documentElement.classList.contains("dark");
  const start = startViewTransition();
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const x = origin?.x ?? window.innerWidth / 2;
  const y = origin?.y ?? window.innerHeight / 2;

  if (!start || reduce) {
    apply(nextDark);
    return;
  }

  const endRadius = Math.hypot(
    Math.max(x, window.innerWidth - x),
    Math.max(y, window.innerHeight - y)
  );

  const transition = start(() => apply(nextDark));
  transition.ready.then(() => {
    document.documentElement.animate(
      {
        clipPath: [
          `circle(0px at ${x}px ${y}px)`,
          `circle(${endRadius}px at ${x}px ${y}px)`,
        ],
      },
      {
        duration: 520,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)",
        pseudoElement: "::view-transition-new(root)",
      }
    );
  });
}

/**
 * Hidden easter-egg theme toggle: press "m" anywhere to flip light/dark.
 * Visible control lives in the footer (ThemeToggle). Defaults to the system
 * theme (resolved by the boot script in the layout head); the choice persists
 * once toggled.
 *
 * The flip animates as a circular reveal expanding from the pointer or the
 * footer button (matching Creed) via the View Transitions API, falling back
 * to an instant switch where that API isn't available.
 */
export function ThemeKey() {
  useEffect(() => {
    let px = window.innerWidth / 2;
    let py = window.innerHeight / 2;
    function track(e: MouseEvent) {
      px = e.clientX;
      py = e.clientY;
    }
    window.addEventListener("mousemove", track);

    function onKey(e: KeyboardEvent) {
      if (e.key !== "m" && e.key !== "M") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName)))
        return;

      flipTheme({ x: px, y: py });
    }

    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousemove", track);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  return null;
}

export function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const sync = () =>
      setDark(document.documentElement.classList.contains("dark"));
    sync();
    window.addEventListener("themechange", sync);
    return () => window.removeEventListener("themechange", sync);
  }, []);

  const label = dark ? "Light mode" : "Dark mode";

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className="theme-toggle inline-flex h-5 w-5 items-center justify-center bg-transparent p-0 text-inherit transition-colors hover:text-[var(--text)]"
      onClick={(e) => {
        const box = e.currentTarget.getBoundingClientRect();
        flipTheme({
          x: box.left + box.width / 2,
          y: box.top + box.height / 2,
        });
      }}
    >
      <span className="inline-flex h-5 w-5 items-center justify-center">
        <svg
          fill="none"
          height={20}
          width={20}
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          aria-hidden="true"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 18a6 6 0 0 0 0-12v12z" fill="currentColor" />
        </svg>
      </span>
    </button>
  );
}
