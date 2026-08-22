"use client";

import { useRef } from "react";
import { CompassIcon, type CompassIconHandle } from "./compass-icon";

export function ViewSiteButton() {
  const iconRef = useRef<CompassIconHandle>(null);

  return (
    <a
      href="https://creed.md"
      target="_blank"
      rel="noreferrer"
      className="project-preview-cta"
      onMouseEnter={() => iconRef.current?.startAnimation()}
      onMouseLeave={() => iconRef.current?.stopAnimation()}
    >
      <CompassIcon
        ref={iconRef}
        size={14}
        className="pointer-events-none"
        aria-hidden="true"
      />
      View site
    </a>
  );
}
