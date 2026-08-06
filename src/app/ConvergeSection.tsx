"use client";

import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

/** Слова из табов Explore — равномерно по кругу, одинаковый радиус. */
const WORD_LABELS = [
  "Задачи",
  "Встречи",
  "Решения",
  "Люди",
  "Wiki",
  "Проекты",
  "Ссылки",
  "Шаги",
] as const;

const WORD_STROKES = [
  "#FF7A3D",
  "#F5E642",
  "#7CDB6A",
  "#9B7BFF",
  "#7EC8FF",
  "#FF8FB8",
  "#3B82F6",
  "#A3E635",
] as const;

/** Старт сверху (−90°), шаг 45° — 8 точек на равном расстоянии. */
const WORDS = WORD_LABELS.map((label, i) => ({
  label,
  stroke: WORD_STROKES[i % WORD_STROKES.length]!,
  angle: -90 + i * (360 / WORD_LABELS.length),
}));

const RING_RADIUS = 200;

const PILL_CLASS =
  "block -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full border-[2.5px] bg-transparent px-3.5 py-1.5 text-[13px] font-medium text-[#111111] [[data-theme=dark]_&]:text-white sm:px-4 sm:py-2 sm:text-[15px]";

function LogoMark({ className = "h-16 w-16" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/orbit-logo.svg`}
      alt=""
      aria-hidden
      className={`shrink-0 rounded-[28%] object-cover ${className}`}
      width={72}
      height={72}
    />
  );
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

  // 0→0.5: слова летят к центру по радиусу и исчезают до появления заголовка
  const x = useTransform(progress, [0, 0.5], [startX, 0]);
  const y = useTransform(progress, [0, 0.5], [startY, 0]);
  const scale = useTransform(progress, [0, 0.4, 0.52], [1, 0.55, 0.12]);
  const opacity = useTransform(progress, [0, 0.38, 0.52], [1, 0.9, 0]);

  return (
    <motion.div
      style={{
        x,
        y,
        scale,
        opacity,
        // Масштаб от точки на окружности — иначе широкие пилюли («Проекты»)
        // съезжают с радиуса из‑за origin по центру бокса разной ширины.
        transformOrigin: "0px 0px",
      }}
      className="pointer-events-none absolute left-1/2 top-1/2"
    >
      <span className={PILL_CLASS} style={{ borderColor: stroke }}>
        {label}
      </span>
    </motion.div>
  );
}

function StaticFallback() {
  return (
    <section className="relative bg-[var(--app-bg)] px-6 py-24">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <LogoMark className="mb-8 h-16 w-16" />
        <div className="mb-8 flex flex-wrap justify-center gap-2">
          {WORDS.map((w) => (
            <span
              key={w.label}
              className="rounded-full border-[2.5px] bg-transparent px-3 py-1.5 text-[13px] font-medium text-[#111111] [[data-theme=dark]_&]:text-white"
              style={{ borderColor: w.stroke }}
            >
              {w.label}
            </span>
          ))}
        </div>
        <h2 className="font-display text-2xl font-medium tracking-tight text-balance text-[var(--text)] sm:text-[2rem]">
          Задачи, встречи и&nbsp;решения — в&nbsp;едином контексте
        </h2>
      </div>
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

  const logoScale = useTransform(
    scrollYProgress,
    [0.28, 0.48, 0.55],
    [1, 1.12, 0.9],
  );
  const logoGlow = useTransform(
    scrollYProgress,
    [0.2, 0.45, 0.55],
    [0.2, 0.7, 0],
  );

  // Сцена (лого + слова) полностью гаснет до появления текста
  const stageOpacity = useTransform(scrollYProgress, [0.48, 0.58], [1, 0]);
  const stageVisibility = useTransform(scrollYProgress, (v) =>
    v >= 0.58 ? "hidden" : "visible",
  );

  const statementOpacity = useTransform(
    scrollYProgress,
    [0.58, 0.7, 1],
    [0, 1, 1],
  );
  const statementY = useTransform(scrollYProgress, [0.58, 0.72], [24, 0]);
  const statementBlur = useTransform(scrollYProgress, [0.58, 0.7], [10, 0]);
  const statementFilter = useTransform(statementBlur, (v) => `blur(${v}px)`);

  if (!mounted || reduceMotion) {
    return <StaticFallback />;
  }

  return (
    <section
      ref={sectionRef}
      className="relative h-[200svh] bg-[var(--app-bg)]"
      aria-label="Сходимость данных в Орбит"
    >
      <div className="sticky top-[12svh] mx-auto flex h-[76svh] w-full max-w-[720px] items-center justify-center px-4">
        <motion.div
          style={{ opacity: stageOpacity, visibility: stageVisibility }}
          className="absolute inset-0 flex scale-[0.7] items-center justify-center sm:scale-[0.85] md:scale-100"
        >
          <motion.div
            aria-hidden
            style={{ opacity: logoGlow }}
            className="pointer-events-none absolute h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(81,79,238,0.28),transparent)] blur-2xl sm:h-64 sm:w-64"
          />

          {WORDS.map((w) => (
            <ConvergeWord
              key={w.label}
              label={w.label}
              stroke={w.stroke}
              angle={w.angle}
              progress={scrollYProgress}
            />
          ))}

          <motion.div style={{ scale: logoScale }} className="relative z-10">
            <LogoMark className="h-[72px] w-[72px] shadow-[0_12px_40px_-12px_rgba(81,79,238,0.45)] sm:h-20 sm:w-20" />
          </motion.div>
        </motion.div>

        <motion.h2
          style={{
            opacity: statementOpacity,
            y: statementY,
            filter: statementFilter,
          }}
          className="absolute inset-x-0 z-20 mx-auto max-w-[800px] px-4 text-center font-display text-[1.65rem] font-medium leading-tight tracking-tight text-balance text-[var(--text)] sm:text-[2.25rem]"
        >
          Задачи, встречи и&nbsp;решения — в&nbsp;едином контексте
        </motion.h2>
      </div>
    </section>
  );
}
