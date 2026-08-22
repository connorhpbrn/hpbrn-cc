"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { lucidityParagraphs, lucidityTitle } from "./lucidity-content";

const ease = [0.22, 1, 0.36, 1] as const;
const duration = 0.48;

export function WritingPiece({
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
            className="h-[18px] w-[18px]"
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
