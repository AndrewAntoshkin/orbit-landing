"use client";

import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark, typo } from "../LandingMockups";

const WORDS_SOURCE: { label: string; stroke: string }[] = [
  { label: "Задачи", stroke: "#F6F02A" },
  { label: "Встречи", stroke: "#FF7A3D" },
  { label: "Решения", stroke: "#9B7BFF" },
  { label: "Люди", stroke: "#7EC8FF" },
  { label: "Wiki", stroke: "#FF8FB8" },
  { label: "Проекты", stroke: "#E8DE1C" },
  { label: "Ссылки", stroke: "#3B82F6" },
  { label: "Шаги", stroke: "#FFF275" },
];

/** Старт сверху (−90°), равный шаг — точки на одной окружности. */
const WORDS = WORDS_SOURCE.map((word, i) => ({
  ...word,
  angle: -90 + i * (360 / WORDS_SOURCE.length),
}));

const RING_RADIUS = 210;

const FIRST = "Задачи, встречи и решения — в едином контексте.";
const SECOND = "Один вопрос — и весь рабочий контекст в ответе.";

/**
 * Motion конвертирует массивные useTransform для opacity в нативные
 * scroll-timeline анимации, и их прогресс расходится с JS-значениями.
 * Функция-трансформ остаётся в общем JS-цикле, поэтому сцена не рассинхронится.
 */
function ramp(value: number, stops: number[], values: number[]) {
  if (value <= stops[0]!) return values[0]!;
  const last = stops.length - 1;
  if (value >= stops[last]!) return values[last]!;
  for (let i = 0; i < last; i += 1) {
    const from = stops[i]!;
    const to = stops[i + 1]!;
    if (value <= to) {
      const t = (value - from) / (to - from);
      return values[i]! + (values[i + 1]! - values[i]!) * t;
    }
  }
  return values[last]!;
}

function ConvergeWord({
  label,
  stroke,
  angle,
  progress,
}: {
  label: string;
  stroke: string;
  angle: number;
  progress: MotionValue<number>;
}) {
  const rad = (angle * Math.PI) / 180;
  const startX = Math.cos(rad) * RING_RADIUS;
  const startY = Math.sin(rad) * RING_RADIUS;

  const x = useTransform(progress, [0, 0.5], [startX, 0]);
  const y = useTransform(progress, [0, 0.5], [startY, 0]);
  const scale = useTransform(progress, [0, 0.4, 0.52], [1, 0.55, 0.12]);
  const opacity = useTransform(progress, (v) =>
    ramp(v, [0, 0.38, 0.52], [1, 0.9, 0]),
  );

  return (
    <motion.div
      className="hl-converge__word"
      // Масштаб от точки на окружности: иначе широкие пиллы съезжают с радиуса.
      style={{ x, y, scale, opacity, transformOrigin: "0px 0px" }}
    >
      <span className="hl-converge__pill" style={{ borderColor: stroke }}>
        {label}
      </span>
    </motion.div>
  );
}

function StaticFallback() {
  return (
    <section className="hl-converge hl-converge--static">
      <LogoMark className="hl-converge__logomark" />
      <div className="hl-converge__row">
        {WORDS.map((word) => (
          <span
            key={word.label}
            className="hl-converge__pill hl-converge__pill--static"
            style={{ borderColor: word.stroke }}
          >
            {word.label}
          </span>
        ))}
      </div>
      <h2 className="hl-converge__statement hl-converge__statement--static">
        {typo(FIRST)}
      </h2>
    </section>
  );
}

export default function ConvergeSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const logoScale = useTransform(scrollYProgress, [0.28, 0.48, 0.56], [1, 1.14, 0.9]);
  const glowOpacity = useTransform(scrollYProgress, (v) =>
    ramp(v, [0.2, 0.45, 0.56], [0.15, 0.8, 0]),
  );

  const stageOpacity = useTransform(scrollYProgress, (v) =>
    ramp(v, [0.48, 0.58], [1, 0]),
  );
  const stageVisibility = useTransform(scrollYProgress, (v) =>
    v >= 0.58 ? "hidden" : "visible",
  );

  const firstOpacity = useTransform(scrollYProgress, (v) =>
    ramp(v, [0.56, 0.66, 0.76, 0.84], [0, 1, 1, 0]),
  );
  const firstY = useTransform(scrollYProgress, [0.56, 0.68], [26, 0]);
  const firstFilter = useTransform(
    useTransform(scrollYProgress, [0.56, 0.68], [10, 0]),
    (v) => `blur(${v}px)`,
  );

  const secondOpacity = useTransform(scrollYProgress, (v) =>
    ramp(v, [0.82, 0.92], [0, 1]),
  );
  const secondY = useTransform(scrollYProgress, [0.82, 0.94], [26, 0]);
  const secondFilter = useTransform(
    useTransform(scrollYProgress, [0.82, 0.94], [10, 0]),
    (v) => `blur(${v}px)`,
  );

  if (!mounted || reduceMotion) {
    return <StaticFallback />;
  }

  return (
    <section
      ref={sectionRef}
      className="hl-converge"
      aria-label="Как Halo сводит рабочий контекст"
    >
      <div className="hl-converge__sticky">
        <motion.div
          className="hl-converge__stage"
          style={{ opacity: stageOpacity, visibility: stageVisibility }}
        >
          <motion.div
            aria-hidden
            className="hl-converge__glow"
            style={{ opacity: glowOpacity }}
          />

          {WORDS.map((word) => (
            <ConvergeWord
              key={word.label}
              label={word.label}
              stroke={word.stroke}
              angle={word.angle}
              progress={scrollYProgress}
            />
          ))}

          <motion.div className="hl-converge__logo" style={{ scale: logoScale }}>
            <LogoMark className="hl-converge__logomark" />
          </motion.div>
        </motion.div>

        <motion.h2
          className="hl-converge__statement"
          style={{ opacity: firstOpacity, y: firstY, filter: firstFilter }}
        >
          {typo(FIRST)}
        </motion.h2>
        <motion.p
          className="hl-converge__statement hl-converge__statement--second"
          style={{ opacity: secondOpacity, y: secondY, filter: secondFilter }}
        >
          {typo(SECOND)}
        </motion.p>
      </div>
    </section>
  );
}
