"use client";

import { useEffect, useRef } from "react";
import Matter from "matter-js";

/** Stock portraits — same vibe as Originkit Gravity Gallery demo. */
const PORTRAITS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1488161628813-04466f872be2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1547425260-76bcad1672c4?w=160&h=160&fit=crop&crop=faces",
];

type Props = {
  count?: number;
  size?: number;
  className?: string;
};

type Item = { el: HTMLDivElement; body: Matter.Body };

/**
 * Footer gravity pile — Matter.js circles with portrait fills,
 * tuned to Originkit Gravity Gallery defaults (count 20, size ~81, drag).
 */
export default function GravityGallery({
  count = 20,
  size = 81,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const makeBallEl = (src: string) => {
      const el = document.createElement("div");
      el.className =
        "absolute left-0 top-0 rounded-full shadow-md ring-1 ring-black/10 dark:ring-white/10 will-change-transform select-none";
      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.backgroundColor = "#fff";
      el.style.backgroundImage = `url("${src}")`;
      el.style.backgroundSize = "cover";
      el.style.backgroundPosition = "center";
      el.style.pointerEvents = "none";
      return el;
    };

    if (reduceMotion) {
      const staticCount = Math.min(count, 14);
      for (let i = 0; i < staticCount; i++) {
        const el = makeBallEl(PORTRAITS[i % PORTRAITS.length]!);
        const side = i % 2 === 0 ? "left" : "right";
        const stack = Math.floor(i / 2);
        el.style[side] = `${8 + (stack % 4) * 18}px`;
        el.style.bottom = `${8 + Math.floor(stack / 4) * 22 + (stack % 3) * 8}px`;
        el.style.transform = `rotate(${(i % 5) * 8 - 16}deg)`;
        container.appendChild(el);
      }
      return () => {
        container.replaceChildren();
      };
    }

    let disposed = false;
    let engine: Matter.Engine | null = null;
    let runner: Matter.Runner | null = null;
    let raf = 0;
    let items: Item[] = [];
    let resizeTimer = 0;
    let lastW = 0;
    let lastH = 0;

    const clearScene = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
      if (runner) Matter.Runner.stop(runner);
      if (engine) {
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      }
      runner = null;
      engine = null;
      items = [];
      container.replaceChildren();
      container.style.cursor = "";
    };

    const build = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 40 || h < 40) return;

      clearScene();
      if (disposed) return;
      lastW = w;
      lastH = h;

      // Originkit: Gravity Y ≈ 0.5
      engine = Matter.Engine.create({
        gravity: { x: 0, y: 0.5, scale: 0.001 },
      });

      const wallOpts: Matter.IChamferableBodyDefinition = {
        isStatic: true,
        friction: 0.9,
        restitution: 0.05,
      };
      const thickness = 120;
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
        h * 3,
        wallOpts,
      );
      const right = Matter.Bodies.rectangle(
        w + thickness / 2,
        h / 2,
        thickness,
        h * 3,
        wallOpts,
      );

      const r = size / 2;
      items = Array.from({ length: count }, (_, i) => {
        const el = makeBallEl(PORTRAITS[i % PORTRAITS.length]!);
        container.appendChild(el);

        const x = r + 8 + Math.random() * Math.max(1, w - size - 16);
        const y = -r - 40 - Math.random() * (h * 0.7 + 200);
        const body = Matter.Bodies.circle(x, y, r, {
          restitution: 0.22,
          // Originkit Friction 8 → strong surface grip
          friction: 0.8,
          frictionAir: 0.02,
          density: 0.002,
        });
        Matter.Body.setAngle(body, (Math.random() - 0.5) * 1.4);
        return { el, body };
      });

      Matter.Composite.add(engine.world, [
        ground,
        left,
        right,
        ...items.map((item) => item.body),
      ]);

      const mouse = Matter.Mouse.create(container);
      mouse.pixelRatio = window.devicePixelRatio || 1;
      const mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          // Originkit Stiffness 62% / Angular 20%
          stiffness: 0.62,
          angularStiffness: 0.2,
          damping: 0.08,
          render: { visible: false },
        },
      });
      Matter.Composite.add(engine.world, mouseConstraint);

      // Keep page scroll; Matter attaches wheel handlers by default.
      // @ts-expect-error matter internal mousewheel
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      // @ts-expect-error DOMMouseScroll
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

      Matter.Events.on(mouseConstraint, "startdrag", () => {
        container.style.cursor = "grabbing";
      });
      Matter.Events.on(mouseConstraint, "enddrag", () => {
        container.style.cursor = "grab";
      });
      container.style.cursor = "grab";

      runner = Matter.Runner.create();
      Matter.Runner.run(runner, engine);

      const sync = () => {
        for (const { el, body } of items) {
          const { x, y } = body.position;
          el.style.transform = `translate3d(${x - r}px, ${y - r}px, 0) rotate(${body.angle}rad)`;
        }
        raf = requestAnimationFrame(sync);
      };
      sync();
    };

    // Start ASAP — footer may already be in view, and IO alone can miss.
    const tryStart = () => {
      if (disposed) return;
      if (container.clientWidth >= 40 && container.clientHeight >= 40) {
        build();
        return true;
      }
      return false;
    };

    if (!tryStart()) {
      requestAnimationFrame(() => {
        if (!tryStart()) setTimeout(tryStart, 50);
      });
    }

    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        if (disposed) return;
        const w = container.clientWidth;
        const h = container.clientHeight;
        if (Math.abs(w - lastW) < 8 && Math.abs(h - lastH) < 8) return;
        build();
      }, 180);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(container);

    return () => {
      disposed = true;
      window.clearTimeout(resizeTimer);
      resizeObserver.disconnect();
      clearScene();
    };
  }, [count, size]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden touch-none ${className}`}
      aria-hidden
    />
  );
}
