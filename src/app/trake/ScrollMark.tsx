"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import type { RefObject } from "react";

export default function ScrollMark({
  containerRef,
  words,
}: {
  containerRef: RefObject<HTMLElement | null>;
  words: readonly string[];
}) {
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });
  const x = useTransform(scrollYProgress, [0, 1], ["100vw", "-100%"]);

  return (
    <div className="hl-mark" aria-hidden>
      <motion.div
        className="hl-mark__inner"
        style={reduceMotion ? undefined : { x }}
      >
        {words.map((word) => (
          <span key={word}>{word}</span>
        ))}
      </motion.div>
    </div>
  );
}
