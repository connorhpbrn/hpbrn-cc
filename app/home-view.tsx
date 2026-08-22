"use client";

import { motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { WritingPiece } from "./writing-piece";

const ease = [0.22, 1, 0.36, 1] as const;
const duration = 0.48;

function Chrome({
  reading,
  spaceAfter,
  from = "start",
  extendToTop,
  children,
}: {
  reading: boolean;
  spaceAfter?: boolean;
  from?: "start" | "end";
  extendToTop?: boolean;
  children: ReactNode;
}) {
  const reduce = useReducedMotion();
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  useLayoutEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    const measure = () => setContentHeight(el.scrollHeight);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [children]);

  return (
    <motion.div
      initial={false}
      animate={{
        height: reading ? 0 : contentHeight || "auto",
        opacity: reading ? 0 : 1,
        marginBottom: reading ? 0 : spaceAfter ? 48 : 0,
      }}
      transition={reduce ? { duration: 0 } : { duration, ease }}
      className={`overflow-hidden ${extendToTop ? "-mt-12 md:-mt-16" : ""}`}
      aria-hidden={reading}
      style={{ pointerEvents: reading ? "none" : "auto" }}
    >
      <div
        className={`flex h-full flex-col ${from === "end" ? "justify-end" : "justify-start"}`}
      >
        <div ref={contentRef}>
          {extendToTop ? (
            <div className="h-12 md:h-16" aria-hidden="true" />
          ) : null}
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function HomeView({
  intro,
  projects,
  activity,
  connect,
}: {
  intro: ReactNode;
  projects: ReactNode;
  activity: ReactNode;
  connect: ReactNode;
}) {
  const [reading, setReading] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (!reading) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setReading(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [reading]);

  return (
    <main className="mx-auto flex max-w-xl flex-col px-6 py-12 md:py-16">
      <Chrome reading={reading} spaceAfter from="end" extendToTop>
        {intro}
      </Chrome>

      <motion.section
        initial={false}
        animate={{ marginBottom: reading ? 0 : 48 }}
        transition={reduce ? { duration: 0 } : { duration, ease }}
      >
        <Chrome reading={reading} from="end">
          <h2 className="text-2xl font-medium tracking-tight text-[var(--text)]">
            Writing
          </h2>
        </Chrome>
        <WritingPiece
          open={reading}
          onToggle={() => setReading((value) => !value)}
        />
      </motion.section>

      <Chrome reading={reading} spaceAfter>
        {projects}
      </Chrome>
      <Chrome reading={reading} spaceAfter>
        {activity}
      </Chrome>
      <Chrome reading={reading}>{connect}</Chrome>
    </main>
  );
}
