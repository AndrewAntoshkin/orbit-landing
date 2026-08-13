"use client";

import { useEffect, useId, useRef, useState } from "react";
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
  const clipId = `halo-app-clip-${useId().replace(/:/g, "")}`;
  return (
    <svg
      viewBox="0 0 120.11 120.006"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      className={`shrink-0 text-[#111111] [[data-theme=dark]_&]:text-white ${className}`}
    >
      <defs>
        <clipPath id={clipId}>
          <rect width="120.11" height="120.006" rx="43" />
        </clipPath>
      </defs>
      <g clipPath={`url(#${clipId})`}>
        <rect
          x="1.03125"
          y="3"
          width="119"
          height="115"
          rx="57.5"
          className="fill-white [[data-theme=dark]_&]:fill-black"
        />
        <path
          d="M49.2592 0.149734C34.2706 0.760132 25.7929 2.90781 18.1743 8.01704C9.78698 13.6236 4.5195 21.8527 2.23618 32.9076C0.563243 40.9105 0.201528 45.025 0.0432776 58.1372C-0.114973 71.3624 0.133706 76.336 1.24146 82.8469C2.84657 92.4097 4.31604 96.5468 8.06883 102.221C9.76437 104.776 13.8337 109.003 16.3657 110.88C22.3566 115.288 30.563 118.227 39.5381 119.177C49.0105 120.194 69.4474 120.239 79.7789 119.267C88.0079 118.498 96.2595 115.853 102.047 112.101C110.163 106.856 115.566 98.6041 117.985 87.7526C119.568 80.654 120.11 73.7588 120.11 60.624C120.11 45.3415 119.025 34.4675 116.809 27.5044C113.757 17.9416 106.727 9.84822 97.5933 5.39461C92.258 2.79478 84.1195 1.0088 74.9183 0.375809C70.0578 0.0593033 54.7301 -0.0763397 49.2592 0.149734ZM51.6555 8.17529C62.2583 9.7578 74.3079 17.2408 87.9175 30.7147C108.467 51.0385 115.77 67.3835 110.706 81.7165C108.445 88.1143 104.421 93.6079 96.5082 101.046C88.2566 108.8 81.497 112.055 73.5845 112.055C70.1934 112.055 67.571 111.603 64.0669 110.45C53.9841 107.104 41.1884 97.5642 28.3927 83.8416C16.6144 71.2268 10.4426 61.4152 8.43055 52.1237C7.93319 49.7725 7.77494 45.1833 8.11405 42.8547C9.10876 35.8917 13.1781 29.2226 21.3393 21.084C29.0257 13.4202 35.6948 9.39608 42.477 8.28833C43.4039 8.15269 44.3308 7.99444 44.5116 7.94922C45.5516 7.74576 49.6209 7.88139 51.6555 8.17529Z"
          fill="currentColor"
        />
      </g>
    </svg>
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
      aria-label="Сходимость данных в Halo"
    >
      <div className="sticky top-[12svh] mx-auto flex h-[76svh] w-full max-w-[720px] items-center justify-center px-4">
        <motion.div
          style={{ opacity: stageOpacity, visibility: stageVisibility }}
          className="absolute inset-0 flex scale-[0.7] items-center justify-center sm:scale-[0.85] md:scale-100"
        >
          <motion.div
            aria-hidden
            style={{ opacity: logoGlow }}
            className="pointer-events-none absolute h-48 w-48 rounded-full bg-[radial-gradient(closest-side,rgba(17,17,17,0.16),transparent)] blur-2xl sm:h-64 sm:w-64 [[data-theme=dark]_&]:bg-[radial-gradient(closest-side,rgba(255,255,255,0.22),transparent)]"
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
            <LogoMark className="h-[72px] w-[72px] drop-shadow-[0_12px_28px_rgba(17,17,17,0.22)] sm:h-20 sm:w-20" />
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
