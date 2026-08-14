"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

/** Halo vocabulary for gravity pills. */
const LABELS = [
  "Tracker",
  "Wiki",
  "Встречи",
  "Задачи",
  "Решения",
  "halo.ask",
  "halo.search",
  "halo.neighborhood",
  "HRDS",
  "HRTECHDESIGN",
  "Staff",
  "Calendar",
  "Память",
  "Сценарии",
  "Explore",
  "Источники",
  "Спросить",
  "Контекст",
  "Люди",
  "Документы",
  "Статусы",
] as const;

/** Solid + outline styles — ReadyMag-like palette on dark. */
const PILL_STYLES: { bg: string; fg: string; border: string }[] = [
  { bg: "#FF7A3D", fg: "#111111", border: "#FF7A3D" },
  { bg: "#F5E642", fg: "#111111", border: "#F5E642" },
  { bg: "#F6F02A", fg: "#111111", border: "#F6F02A" },
  { bg: "#9B7BFF", fg: "#111111", border: "#9B7BFF" },
  { bg: "#7EC8FF", fg: "#111111", border: "#7EC8FF" },
  { bg: "#FF8FB8", fg: "#111111", border: "#FF8FB8" },
  { bg: "#3B82F6", fg: "#FFFFFF", border: "#3B82F6" },
  { bg: "#E8DE1C", fg: "#111111", border: "#E8DE1C" },
  { bg: "transparent", fg: "#C4B5FD", border: "#A78BFA" },
  { bg: "transparent", fg: "#FB923C", border: "#FB923C" },
  { bg: "transparent", fg: "#F6F02A", border: "#F6F02A" },
  { bg: "transparent", fg: "#60A5FA", border: "#3B82F6" },
  { bg: "#F472B6", fg: "#111111", border: "#F472B6" },
  { bg: "#FFF275", fg: "#111111", border: "#FFF275" },
  { bg: "#38BDF8", fg: "#111111", border: "#38BDF8" },
  { bg: "transparent", fg: "#FBBF24", border: "#FBBF24" },
  { bg: "#E879F9", fg: "#111111", border: "#E879F9" },
  { bg: "#F97316", fg: "#111111", border: "#F97316" },
  { bg: "transparent", fg: "#F9A8D4", border: "#F472B6" },
  { bg: "#818CF8", fg: "#FFFFFF", border: "#818CF8" },
];

type IconKind = "arrow-down" | "arrow-right" | "arrow-diag" | "plus" | "spark" | "dot";

const ICONS: { kind: IconKind; color: string; outline: boolean }[] = [
  { kind: "arrow-down", color: "#F5E642", outline: true },
  { kind: "arrow-diag", color: "#3B82F6", outline: true },
  { kind: "arrow-down", color: "#A3A3A3", outline: true },
  { kind: "arrow-right", color: "#3B82F6", outline: false },
  { kind: "plus", color: "#FF7A3D", outline: true },
  { kind: "spark", color: "#F5E642", outline: false },
  { kind: "dot", color: "#F6F02A", outline: true },
  { kind: "arrow-diag", color: "#FF8FB8", outline: false },
];

type Props = {
  count?: number;
  /** Pill height in px. */
  size?: number;
  className?: string;
  /** Wait until the playfield is in view, then drop from the top. */
  startWhenVisible?: boolean;
  /** How far below the fold the playfield may still be when the drop starts. */
  startRootMarginBottom?: string;
  labels?: readonly string[];
  palette?: "spectrum" | "coral";
  showIcons?: boolean;
  responsiveSize?: boolean;
  staggerMs?: number;
  startDelayMs?: number;
};

type Item = { el: HTMLDivElement; body: Matter.Body; w: number; h: number };

function iconSvg(kind: IconKind, color: string, boxPx: number): string {
  const s = Math.round(boxPx * 0.42);
  const common = `xmlns="http://www.w3.org/2000/svg" width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex-shrink:0"`;
  switch (kind) {
    case "arrow-down":
      return `<svg ${common}><path d="M12 5v14"/><path d="m19 12-7 7-7-7"/></svg>`;
    case "arrow-right":
      return `<svg ${common}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>`;
    case "arrow-diag":
      return `<svg ${common}><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg>`;
    case "plus":
      return `<svg ${common}><path d="M12 5v14"/><path d="M5 12h14"/></svg>`;
    case "spark":
      // 8 rays around (12,12) — visually centered in the viewBox.
      return `<svg ${common}><path d="M12 5v3.5"/><path d="M12 15.5V19"/><path d="M5 12h3.5"/><path d="M15.5 12H19"/><path d="m7.05 7.05 2.47 2.47"/><path d="m14.48 14.48 2.47 2.47"/><path d="m14.48 7.05-2.47 2.47"/><path d="m7.05 14.48 2.47-2.47"/></svg>`;
    case "dot": {
      const d = Math.round(boxPx * 0.28);
      return `<svg xmlns="http://www.w3.org/2000/svg" width="${d}" height="${d}" viewBox="0 0 24 24" style="display:block;flex-shrink:0"><circle cx="12" cy="12" r="6" fill="${color}"/></svg>`;
    }
  }
}

/**
 * Matter.js colorful text + icon pills as a section background.
 */
export default function GravityGallery({
  count = 20,
  size = 80,
  className = "",
  startWhenVisible = true,
  startRootMarginBottom = "25%",
  labels: customLabels,
  palette = "spectrum",
  showIcons = true,
  responsiveSize = false,
  staggerMs = 45,
  startDelayMs = 0,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const sourceLabels = customLabels?.length ? customLabels : LABELS;
    const allLabels = Array.from(
      { length: count },
      (_, i) => sourceLabels[i % sourceLabels.length]!,
    );
    const isNarrow = () =>
      (container.clientWidth || window.innerWidth) < 640;
    const activeLabels = () =>
      isNarrow() ? allLabels.slice(0, 7) : allLabels;
    const activeIcons = () =>
      showIcons ? (isNarrow() ? ICONS.slice(0, 2) : ICONS) : [];

    const applyStyle = (
      el: HTMLDivElement,
      style: { bg: string; fg: string; border: string },
    ) => {
      const outlined = style.bg === "transparent";
      el.style.backgroundColor = outlined ? "transparent" : style.bg;
      el.style.color = style.fg;
      el.style.borderColor = style.border;
      el.style.borderWidth = outlined || palette === "coral" ? "2.5px" : "0";
      el.style.borderStyle = "solid";
      el.style.boxShadow = "none";
    };

    const resolveSize = () =>
      responsiveSize
        ? Math.round(
            Math.max(
              size,
              Math.min(size * 1.45, container.clientWidth * 0.07),
            ),
          )
        : size;

    const makePillEl = (label: string, index: number, itemSize: number) => {
      const el = document.createElement("div");
      el.textContent = label;
      el.className =
        "absolute left-0 top-0 inline-flex items-center justify-center whitespace-nowrap rounded-full font-medium will-change-transform select-none";
      el.style.height = `${itemSize}px`;
      el.style.width = "max-content";
      el.style.paddingLeft = `${Math.round(itemSize * 0.42)}px`;
      el.style.paddingRight = `${Math.round(itemSize * 0.42)}px`;
      const fontPx = Math.round(itemSize * 0.38);
      el.style.fontFamily = "var(--font-display)";
      el.style.fontSize = `${fontPx}px`;
      el.style.fontWeight = "500";
      el.style.lineHeight = "1";
      el.style.letterSpacing = "-0.02em";
      el.style.pointerEvents = "none";
      applyStyle(
        el,
        palette === "coral"
          ? { bg: "#ff5c49", fg: "#ffffff", border: "#101010" }
          : PILL_STYLES[index % PILL_STYLES.length]!,
      );
      return el;
    };

    const makeIconEl = (
      icon: (typeof ICONS)[number],
      diameter: number,
    ) => {
      const el = document.createElement("div");
      el.className =
        "absolute left-0 top-0 flex items-center justify-center rounded-full will-change-transform select-none";
      el.style.width = `${diameter}px`;
      el.style.height = `${diameter}px`;
      el.style.lineHeight = "0";
      el.style.pointerEvents = "none";
      if (icon.outline) {
        el.style.backgroundColor = "transparent";
        el.style.border = `2.5px solid ${icon.color}`;
        el.style.boxSizing = "border-box";
      } else {
        el.style.backgroundColor = icon.color;
        el.style.border = "none";
      }
      el.style.boxShadow = "none";
      const stroke = icon.outline ? icon.color : "#111111";
      el.innerHTML = iconSvg(icon.kind, stroke, diameter);
      return el;
    };

    const physicsOpts = {
      restitution: 0.45,
      friction: 0.08,
      frictionStatic: 0.1,
      frictionAir: 0.02,
      density: 0.0024,
      slop: 0.03,
    };

    if (reduceMotion) {
      const itemSize = resolveSize();
      const labels = activeLabels();
      for (let i = 0; i < labels.length; i++) {
        const el = makePillEl(labels[i]!, i, itemSize);
        container.appendChild(el);
        const side = i % 2 === 0 ? "left" : "right";
        const stack = Math.floor(i / 2);
        el.style[side] = `${16 + (stack % 3) * 28}px`;
        el.style.bottom = `${16 + Math.floor(stack / 3) * 36 + (stack % 2) * 12}px`;
        el.style.transform = `rotate(${(i % 5) * 6 - 12}deg)`;
      }
      activeIcons().forEach((icon, i) => {
        const d = itemSize;
        const el = makeIconEl(icon, d);
        container.appendChild(el);
        el.style.left = `${40 + i * 56}px`;
        el.style.bottom = `${24 + (i % 2) * 40}px`;
      });
      return () => {
        container.replaceChildren();
      };
    }

    let disposed = false;
    let started = false;
    let engine: Matter.Engine | null = null;
    let runner: Matter.Runner | null = null;
    let raf = 0;
    let items: Item[] = [];
    let resizeTimer = 0;
    let startTimer = 0;
    let lastW = 0;
    let lastH = 0;
    let dragBody: Matter.Body | null = null;
    let dragOffset = { x: 0, y: 0 };
    const pointerTrail: { x: number; y: number; t: number }[] = [];
    const TRAIL_MS = 100;
    const releaseTimers: number[] = [];

    const localPoint = (e: PointerEvent) => {
      const rect = container.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const pushTrail = (x: number, y: number) => {
      const t = performance.now();
      pointerTrail.push({ x, y, t });
      while (pointerTrail.length > 1 && t - pointerTrail[0]!.t > TRAIL_MS) {
        pointerTrail.shift();
      }
    };

    const throwVelocity = () => {
      if (pointerTrail.length < 2) return { x: 0, y: 0 };
      const first = pointerTrail[0]!;
      const last = pointerTrail[pointerTrail.length - 1]!;
      const dt = Math.max(12, last.t - first.t);
      const scale = 18;
      return {
        x: Math.max(-48, Math.min(48, ((last.x - first.x) / dt) * scale)),
        y: Math.max(-48, Math.min(48, ((last.y - first.y) / dt) * scale)),
      };
    };

    const clearScene = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      for (const id of releaseTimers) window.clearTimeout(id);
      releaseTimers.length = 0;
      if (runner) Matter.Runner.stop(runner);
      if (engine) {
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      runner = null;
      engine = null;
      items = [];
      dragBody = null;
      pointerTrail.length = 0;
      container.replaceChildren();
      container.style.cursor = "grab";
    };

    const spawnBody = (
      el: HTMLDivElement,
      pw: number,
      ph: number,
      i: number,
      circle: boolean,
    ): Item => {
      container.appendChild(el);
      const x = pw / 2 + 28 + Math.random() * Math.max(1, lastW - pw - 56);
      const y = -ph / 2 - 24 - Math.random() * 160 - (i % 5) * 30;
      const body = circle
        ? Matter.Bodies.circle(x, y, pw / 2, physicsOpts)
        : Matter.Bodies.rectangle(x, y, pw, ph, {
            ...physicsOpts,
            chamfer: { radius: ph / 2 },
          });
      Matter.Body.setInertia(body, body.inertia * 2.8);
      Matter.Body.setAngle(body, (Math.random() - 0.5) * 0.35);
      Matter.Body.setStatic(body, true);
      return { el, body, w: pw, h: ph };
    };

    const build = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 40 || h < 40) return;
      const itemSize = resolveSize();

      clearScene();
      if (disposed) return;
      lastW = w;
      lastH = h;

      engine = Matter.Engine.create({
        gravity: { x: 0, y: 1, scale: 0.001 },
      });
      engine.positionIterations = 10;
      engine.velocityIterations = 8;

      const wallOpts: Matter.IChamferableBodyDefinition = {
        isStatic: true,
        friction: 0.85,
        restitution: 0.05,
      };
      const thickness = 240;
      const ground = Matter.Bodies.rectangle(
        w / 2,
        h + thickness / 2 - 2,
        w + thickness * 2,
        thickness,
        wallOpts,
      );
      const left = Matter.Bodies.rectangle(
        -thickness / 2,
        h / 2,
        thickness,
        h * 4,
        wallOpts,
      );
      const right = Matter.Bodies.rectangle(
        w + thickness / 2,
        h / 2,
        thickness,
        h * 4,
        wallOpts,
      );
      const ceiling = Matter.Bodies.rectangle(
        w / 2,
        -480,
        w + thickness * 2,
        thickness,
        wallOpts,
      );

      const labels = activeLabels();
      items = labels.map((label, i) => {
        const el = makePillEl(label, i, itemSize);
        const pw = Math.ceil(
          (() => {
            container.appendChild(el);
            const measured = el.getBoundingClientRect().width;
            el.remove();
            return measured;
          })(),
        );
        el.style.width = `${pw}px`;
        return spawnBody(el, pw, itemSize, i, false);
      });

      activeIcons().forEach((icon, i) => {
        const d = itemSize;
        const el = makeIconEl(icon, d);
        items.push(spawnBody(el, d, d, labels.length + i, true));
      });

      items.forEach((item, i) => {
        const delay = 60 + i * staggerMs;
        const id = window.setTimeout(() => {
          if (disposed || !engine) return;
          Matter.Body.setStatic(item.body, false);
          Matter.Body.setVelocity(item.body, {
            x: (Math.random() - 0.5) * 1.2,
            y: 1 + Math.random() * 2,
          });
        }, delay);
        releaseTimers.push(id);
      });

      Matter.Composite.add(engine.world, [
        ground,
        left,
        right,
        ceiling,
        ...items.map((item) => item.body),
      ]);

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      const sync = () => {
        for (const { el, body, w: bw, h: bh } of items) {
          const { x, y } = body.position;
          el.style.transform = `translate3d(${x - bw / 2}px, ${y - bh / 2}px, 0) rotate(${body.angle}rad)`;
        }
        raf = requestAnimationFrame(sync);
      };
      sync();
    };

    const start = () => {
      if (started || disposed || startTimer) return;
      if (startDelayMs > 0) {
        startTimer = window.setTimeout(() => {
          startTimer = 0;
          if (disposed) return;
          started = true;
          build();
        }, startDelayMs);
        return;
      }
      started = true;
      build();
    };

    const onPointerDown = (e: PointerEvent) => {
      if (e.button !== 0 || !engine) return;
      const p = localPoint(e);
      const hits = Matter.Query.point(
        items.map((item) => item.body),
        p,
      );
      if (!hits.length) return;
      e.preventDefault();
      dragBody = hits[0]!;
      dragOffset = {
        x: dragBody.position.x - p.x,
        y: dragBody.position.y - p.y,
      };
      pointerTrail.length = 0;
      pushTrail(p.x, p.y);
      Matter.Sleeping.set(dragBody, false);
      Matter.Body.setStatic(dragBody, false);
      Matter.Body.setAngularVelocity(dragBody, 0);
      container.style.cursor = "grabbing";
      container.setPointerCapture(e.pointerId);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragBody) return;
      const p = localPoint(e);
      const dx = p.x + dragOffset.x - dragBody.position.x;
      const dy = p.y + dragOffset.y - dragBody.position.y;
      const gain = 0.58;
      Matter.Body.setVelocity(dragBody, { x: dx * gain, y: dy * gain });
      Matter.Body.setAngularVelocity(dragBody, 0);
      pushTrail(p.x, p.y);
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!dragBody) return;
      const p = localPoint(e);
      pushTrail(p.x, p.y);
      const v = throwVelocity();
      const body = dragBody;
      Matter.Body.setStatic(body, false);
      Matter.Body.setVelocity(body, v);
      Matter.Body.setAngularVelocity(body, 0);
      dragBody = null;
      pointerTrail.length = 0;
      container.style.cursor = "grab";
      try {
        container.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    };

    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", onPointerUp);
    container.addEventListener("pointercancel", onPointerUp);
    container.style.cursor = "grab";

    let io: IntersectionObserver | null = null;
    if (startWhenVisible) {
      // Start while the playfield is still below the fold: the pills need a
      // full container height to fall, so they are settled on arrival.
      io = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) {
            start();
            io?.disconnect();
          }
        },
        { threshold: 0, rootMargin: `0px 0px ${startRootMarginBottom} 0px` },
      );
      io.observe(container);
    } else {
      requestAnimationFrame(() => start());
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (disposed || !started) return;
        const cw = container.clientWidth;
        const ch = container.clientHeight;
        if (Math.abs(cw - lastW) < 12 && Math.abs(ch - lastH) < 12) return;
        build();
      }, 220);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      window.clearTimeout(startTimer);
      window.clearTimeout(resizeTimer);
      io?.disconnect();
      resizeObserver.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", onPointerUp);
      container.removeEventListener("pointercancel", onPointerUp);
      clearScene();
    };
  }, [
    count,
    customLabels,
    palette,
    responsiveSize,
    showIcons,
    size,
    staggerMs,
    startDelayMs,
    startWhenVisible,
    startRootMarginBottom,
  ]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full touch-none ${className}`}
      aria-hidden
    />
  );
}
