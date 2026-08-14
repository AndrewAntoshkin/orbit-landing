"use client";

import { useEffect, useState } from "react";

const PHRASES = [
  "halo.ask",
  "halo.search",
  "halo.neighborhood",
  "Tracker · Wiki · Встречи",
  "Рабочая память команды",
];

const LONGEST = PHRASES.reduce((a, b) => (b.length > a.length ? b : a));

export default function TypewriterBadge() {
  const [text, setText] = useState("");
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [typing, setTyping] = useState(true);

  useEffect(() => {
    const phrase = PHRASES[phraseIndex]!;
    let i = 0;
    let eraseTimer = 0;
    let pauseTimer = 0;
    let typeTimer = 0;

    const type = () => {
      if (i <= phrase.length) {
        setText(phrase.slice(0, i));
        i += 1;
        typeTimer = window.setTimeout(type, 55);
      } else {
        pauseTimer = window.setTimeout(() => {
          setTyping(false);
          erase();
        }, 1600);
      }
    };

    const erase = () => {
      if (i >= 0) {
        setText(phrase.slice(0, i));
        i -= 1;
        eraseTimer = window.setTimeout(erase, 30);
      } else {
        setTyping(true);
        setPhraseIndex((p) => (p + 1) % PHRASES.length);
      }
    };

    typeTimer = window.setTimeout(type, 200);

    return () => {
      window.clearTimeout(typeTimer);
      window.clearTimeout(eraseTimer);
      window.clearTimeout(pauseTimer);
    };
  }, [phraseIndex]);

  return (
    <p className="hl-hero__badge">
      {/* Reserves the width of the longest phrase so the pill never resizes. */}
      <span className="hl-hero__badge-sizer" aria-hidden>
        {LONGEST}_
      </span>
      <span className="hl-hero__badge-text">
        {text}
        {typing ? (
          <span className="hl-hero__caret" aria-hidden>
            _
          </span>
        ) : null}
      </span>
    </p>
  );
}
