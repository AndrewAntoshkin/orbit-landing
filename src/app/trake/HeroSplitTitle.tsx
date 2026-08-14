"use client";

import { motion, useReducedMotion } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

export default function HeroSplitTitle({ text }: { text: string }) {
  const reduceMotion = useReducedMotion();
  const words = text.split(" ");

  if (reduceMotion) {
    return <h1 className="hl-hero__title">{text}</h1>;
  }

  return (
    <h1 className="hl-hero__title" aria-label={text}>
      {words.map((word, wi) => (
        <span key={`${word}-${wi}`}>
          <span className="hl-word">
            {word.split("").map((char, ci) => (
              <motion.span
                key={`${wi}-${ci}`}
                className="hl-char"
                initial={{ y: "55%", opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{
                  duration: 0.9,
                  ease: EASE,
                  delay: 0.2 + wi * 0.08 + ci * 0.025,
                }}
              >
                {char}
              </motion.span>
            ))}
          </span>
          {/* A collapsible space, so wrapped lines stay optically centred. */}
          {wi < words.length - 1 ? " " : null}
        </span>
      ))}
    </h1>
  );
}
