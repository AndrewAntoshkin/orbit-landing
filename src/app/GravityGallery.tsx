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
  "https://images.unsplash.com/photo-1552058544-f2b08422138a?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=160&h=160&fit=crop&crop=faces",
  "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=160&h=160&fit=crop&crop=faces",
];

type Props = {
  count?: number;
  size?: number;
  className?: string;
};

type Item = { el: HTMLImageElement; body: Matter.Body };

/**
 * Footer gravity pile — Matter.js circles with portrait fills,
 * inspired by Originkit Gravity Gallery.
 */
export default function GravityGallery({
  count = 18,
  size = 72,
  className = "",
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (reduceMotion) {
      const staticCount = Math.min(count, 12);
      for (let i = 0; i < staticCount; i++) {
        const el = document.createElement("img");
        el.src = PORTRAITS[i % PORTRAITS.length]!;
        el.alt = "";
        el.decoding = "async";
        el.className =
          "absolute rounded-full object-cover shadow-md ring-1 ring-black/10";
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
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
    let mouseConstraint: Matter.MouseConstraint | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let started = false;

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
      mouseConstraint = null;
      items = [];
      container.replaceChildren();
    };

    const build = () => {
      clearScene();
      if (disposed) return;

      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w < 40 || h < 40) return;

      engine = Matter.Engine.create({
        gravity: { x: 0, y: 1.05, scale: 0.001 },
      });

      const wallOpts: Matter.IChamferableBodyDefinition = {
        isStatic: true,
        friction: 0.8,
        restitution: 0.1,
      };
      const thickness = 80;
      const ground = Matter.Bodies.rectangle(
        w / 2,
        h + thickness / 2,
        w + thickness * 2,
        thickness,
        wallOpts,
      );
      const left = Matter.Bodies.rectangle(
        -thickness / 2,
        h / 2,
        thickness,
        h * 2,
        wallOpts,
      );
      const right = Matter.Bodies.rectangle(
        w + thickness / 2,
        h / 2,
        thickness,
        h * 2,
        wallOpts,
      );

      const r = size / 2;
      items = Array.from({ length: count }, (_, i) => {
        const el = document.createElement("img");
        el.src = PORTRAITS[i % PORTRAITS.length]!;
        el.alt = "";
        el.draggable = false;
        el.decoding = "async";
        el.className =
          "absolute left-0 top-0 rounded-full object-cover shadow-md ring-1 ring-black/10 dark:ring-white/10 will-change-transform select-none";
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.pointerEvents = "none";
        container.appendChild(el);

        const half = Math.floor(count / 2);
        const x =
          i < half
            ? r + Math.random() * Math.max(1, w * 0.38 - size)
            : w * 0.62 + Math.random() * Math.max(1, w * 0.38 - size);
        const y = -r - Math.random() * (h * 0.85 + 160);
        const body = Matter.Bodies.circle(x, y, r, {
          restitution: 0.28,
          friction: 0.35,
          frictionAir: 0.018,
          density: 0.002,
          chamfer: undefined,
        });
        Matter.Body.setAngle(body, (Math.random() - 0.5) * 1.2);
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
      mouseConstraint = Matter.MouseConstraint.create(engine, {
        mouse,
        constraint: {
          stiffness: 0.18,
          damping: 0.1,
          render: { visible: false },
        },
      });
      Matter.Composite.add(engine.world, mouseConstraint);

      // Keep wheel scroll on the page (Matter steals it by default).
      // @ts-expect-error matter mousewheel is not in public types
      mouse.element.removeEventListener("mousewheel", mouse.mousewheel);
      // @ts-expect-error DOMMouseScroll
      mouse.element.removeEventListener("DOMMouseScroll", mouse.mousewheel);

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

    const startWhenVisible = () => {
      if (started || disposed) return;
      started = true;
      build();
      resizeObserver = new ResizeObserver(() => {
        if (!started || disposed) return;
        build();
      });
      resizeObserver.observe(container);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          startWhenVisible();
          io.disconnect();
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(container);

    return () => {
      disposed = true;
      io.disconnect();
      resizeObserver?.disconnect();
      clearScene();
    };
  }, [count, size]);

  return (
    <div
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden ${className}`}
      aria-hidden
    />
  );
}
