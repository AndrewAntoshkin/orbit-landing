"use client";

import { useEffect, useRef, type RefObject } from "react";

/** Шаг растровой сетки в CSS-пикселях. */
const STEP = 7;
/** Сколько градаций размера точки — растр как в полутоновой печати. */
const LEVELS = 4;
/** Порог: ниже него точка не рисуется, поэтому облака имеют рваный край. */
const THRESHOLD = 0.5;
/** Насколько узкая полоса шума раскладывается на градации — чем меньше, тем резче край. */
const RAMP = 0.22;
/** Мягкий зазор между текстом и облаками, CSS-пиксели: уже на узких экранах. */
const FEATHER_MIN = 26;
const FEATHER_MAX = 56;
const FPS = 30;

function hash(x: number, y: number) {
  const n = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return n - Math.floor(n);
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function valueNoise(x: number, y: number) {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const xf = x - xi;
  const yf = y - yi;
  const u = xf * xf * (3 - 2 * xf);
  const v = yf * yf * (3 - 2 * yf);
  const a = hash(xi, yi);
  const b = hash(xi + 1, yi);
  const c = hash(xi, yi + 1);
  const d = hash(xi + 1, yi + 1);
  return a * (1 - u) * (1 - v) + b * u * (1 - v) + c * (1 - u) * v + d * u * v;
}

function fbm(x: number, y: number) {
  let sum = 0;
  let amp = 0.55;
  let freq = 1;
  for (let octave = 0; octave < 4; octave += 1) {
    sum += amp * valueNoise(x * freq, y * freq);
    amp *= 0.5;
    freq *= 2.1;
  }
  return sum;
}

function readDotRgb(el: HTMLElement): [number, number, number] {
  const raw = getComputedStyle(el).getPropertyValue("--cloud-dot").trim();
  const hex = raw.replace("#", "");
  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16),
      parseInt(hex.slice(2, 4), 16),
      parseInt(hex.slice(4, 6), 16),
    ];
  }
  const rgb = raw.match(/\d+/g);
  if (rgb && rgb.length >= 3) {
    return [Number(rgb[0]), Number(rgb[1]), Number(rgb[2])];
  }
  return [95, 127, 212];
}

export default function PixelClouds({
  className,
  holeRef,
}: {
  className?: string;
  /** Область (обычно текст героя), которую облака обтекают. */
  holeRef?: RefObject<HTMLElement | null>;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let dotRgb = readDotRgb(canvas);
    let raf = 0;
    let lastFrame = 0;
    let phase = 0;
    let holes: { left: number; top: number; right: number; bottom: number }[] = [];
    let feather = FEATHER_MAX;

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    // Точки одного размера рисуем одной пачкой — так fillStyle меняется 4 раза за кадр.
    const buckets: number[][] = Array.from({ length: LEVELS }, () => []);

    function measure() {
      const rect = canvas!.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      width = rect.width;
      height = rect.height;
      canvas!.width = Math.round(width * dpr);
      canvas!.height = Math.round(height * dpr);
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      dotRgb = readDotRgb(canvas!);
      feather = Math.max(FEATHER_MIN, Math.min(FEATHER_MAX, width * 0.06));

      const holeEl = holeRef?.current;
      if (!holeEl) {
        holes = [];
        return;
      }
      // Обтекаем каждую строку текста отдельно, а не общую колонку —
      // иначе вырез получается во всю ширину блока.
      const marked = holeEl.querySelectorAll<HTMLElement>("[data-cloud-hole]");
      const targets = marked.length > 0 ? Array.from(marked) : [holeEl];
      holes = targets.map((el) => {
        const box = el.getBoundingClientRect();
        return {
          left: box.left - rect.left,
          top: box.top - rect.top,
          right: box.right - rect.left,
          bottom: box.bottom - rect.top,
        };
      });
    }

    /** 0 внутри текста, плавно выходит в 1 на расстоянии FEATHER от него. */
    function holeFalloff(x: number, y: number) {
      let min = 1;
      for (const hole of holes) {
        const dx = Math.max(hole.left - x, 0, x - hole.right);
        const dy = Math.max(hole.top - y, 0, y - hole.bottom);
        const f = smoothstep(0, feather, Math.sqrt(dx * dx + dy * dy));
        if (f < min) min = f;
        if (min <= 0.001) break;
      }
      return min;
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const bucket of buckets) bucket.length = 0;

      const cols = Math.ceil(width / STEP);
      const rows = Math.ceil(height / STEP);
      // Частота привязана к ширине блока: на любом экране в кадр попадает
      // пара облачных «горбов», а не однородное поле.
      const freqX = 2.6 / Math.max(cols, 1);
      const freqY = freqX * 3.1;

      for (let row = 0; row <= rows; row += 1) {
        const y = row * STEP;
        // У краёв блока облака растворяются, чтобы скругления не срезали их ровно.
        const edgeY = smoothstep(0, 0.06, row / rows) * smoothstep(1, 0.94, row / rows);
        if (edgeY <= 0.001) continue;

        for (let col = 0; col <= cols; col += 1) {
          const x = col * STEP;
          const edgeX = smoothstep(0, 0.05, col / cols) * smoothstep(1, 0.95, col / cols);
          const density = edgeY * edgeX * holeFalloff(x, y);
          if (density <= 0.001) continue;

          // Низкочастотный шум задаёт форму облака (растянут по горизонтали),
          // высокочастотный проедает внутри прорехи — фактура растровой печати.
          const shape = fbm(col * freqX + phase, row * freqY - phase * 0.3);
          const detail = valueNoise(col * 0.14 - phase * 2, row * 0.2);
          // Лёгкий уклон вниз: у нижнего края блока облака гуще, чем у верхнего.
          const bias = 0.86 + 0.28 * (row / rows);
          const coverage =
            (shape * 0.82 + detail * 0.22) * (0.3 + 0.7 * density) * bias;
          if (coverage < THRESHOLD) continue;

          const level = Math.min(
            LEVELS - 1,
            Math.floor(((coverage - THRESHOLD) / RAMP) * LEVELS),
          );
          // Самый слабый уровень идёт шахматкой — край облака рассыпается в пыль.
          if (level === 0 && (col + row) % 2 === 1) continue;
          buckets[level].push(col * STEP, row * STEP);
        }
      }

      const [r, g, b] = dotRgb;
      for (let level = 0; level < LEVELS; level += 1) {
        const points = buckets[level];
        if (points.length === 0) continue;
        const size = level + 1;
        const offset = (STEP - size) / 2;
        ctx!.fillStyle = `rgba(${r}, ${g}, ${b}, ${0.2 + level * 0.19})`;
        for (let i = 0; i < points.length; i += 2) {
          ctx!.fillRect(points[i] + offset, points[i + 1] + offset, size, size);
        }
      }
    }

    function loop(now: number) {
      raf = requestAnimationFrame(loop);
      if (now - lastFrame < 1000 / FPS) return;
      lastFrame = now;
      phase += 0.0022;
      draw();
    }

    function start() {
      cancelAnimationFrame(raf);
      if (reduceMotion.matches) {
        draw();
        return;
      }
      raf = requestAnimationFrame(loop);
    }

    measure();
    start();

    const observer = new ResizeObserver(() => {
      measure();
      draw();
    });
    observer.observe(canvas);
    if (holeRef?.current) observer.observe(holeRef.current);

    // Вступительная анимация героя сдвигает текст — пересчитываем вырез, когда она стихла.
    const settle = window.setTimeout(() => {
      measure();
      draw();
    }, 1600);

    const themeObserver = new MutationObserver(() => {
      dotRgb = readDotRgb(canvas);
      draw();
    });
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    reduceMotion.addEventListener("change", start);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(settle);
      observer.disconnect();
      themeObserver.disconnect();
      reduceMotion.removeEventListener("change", start);
    };
  }, [holeRef]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
