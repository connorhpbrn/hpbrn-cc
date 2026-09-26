"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  type ReactNode,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { lucidityParagraphs, lucidityTitle } from "./lucidity";

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
          <h2 className="text-2xl font-medium tracking-tight text-(--text)">
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

function WritingPiece({
  open,
  onToggle,
}: {
  open: boolean;
  onToggle: () => void;
}) {
  const reduce = useReducedMotion();
  const transition = reduce ? { duration: 0 } : { duration, ease };

  return (
    <div>
      <motion.button
        type="button"
        aria-expanded={open}
        className="writing-toggle group flex items-center gap-2 text-left"
        onClick={onToggle}
        initial={false}
        animate={{ marginTop: open ? 64 : 24 }}
        transition={transition}
      >
        <span className="writing-toggle-title">{lucidityTitle}</span>
        <motion.span
          aria-hidden="true"
          className="writing-toggle-chevron"
          initial={false}
          animate={{ rotate: open ? 0 : -90 }}
          transition={
            reduce
              ? { duration: 0 }
              : { type: "spring", stiffness: 320, damping: 24 }
          }
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-4.5 w-4.5"
          >
            <path d="m6 9 6 6 6-6" />
          </svg>
        </motion.span>
      </motion.button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="writing-body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={transition}
            className="overflow-hidden"
          >
            <div className="writing-body">
              {lucidityParagraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
