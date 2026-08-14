"use client";

import Image from "next/image";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef } from "react";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

type Props = {
  title: string;
  body: string;
  image?: string;
  alt: string;
  index: number;
  placeholderClass: string;
};

export default function PerspectiveCard({
  title,
  body,
  image,
  alt,
  index,
  placeholderClass,
}: Props) {
  const ref = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();
  const col = index % 3;
  const isLeft = col === 0;
  const isRight = col === 2;

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });

  const rotateX = useTransform(scrollYProgress, [0, 0.5, 1], [70, 0, -50]);
  const rotateZ = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [isLeft ? 5 : isRight ? -5 : 0, 0, isLeft ? -1 : isRight ? 1 : 0],
  );
  const x = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [isLeft ? "-40%" : isRight ? "40%" : "0%", "0%", isLeft ? "-20%" : isRight ? "20%" : "0%"],
  );
  const skewX = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [isLeft ? -20 : isRight ? 20 : 0, 0, isLeft ? 10 : isRight ? -10 : 0],
  );
  const y = useTransform(scrollYProgress, [0, 0.5, 1], ["100%", "0%", "-20%"]);
  const filter = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    [
      "blur(7px) brightness(40%)",
      "blur(0px) brightness(100%)",
      "blur(4px) brightness(30%)",
    ],
  );
  const imgScaleY = useTransform(scrollYProgress, [0, 0.5, 1], [1.8, 1, 1.8]);

  const wrapStyle = reduceMotion
    ? undefined
    : {
        rotateX,
        rotateZ,
        x,
        skewX,
        y,
        filter,
        transformPerspective: 1200,
      };

  const imgStyle = reduceMotion ? undefined : { scaleY: imgScaleY };

  return (
    <figure className="hl-grid__item" ref={ref}>
      <motion.div className="hl-grid__imgwrap" style={wrapStyle}>
        <motion.div className="relative h-full w-full" style={imgStyle}>
          {image ? (
            <Image
              src={`${BASE}${image}`}
              alt={alt}
              fill
              unoptimized
              sizes="(min-width: 768px) 220px, 50vw"
              className="hl-grid__img"
            />
          ) : (
            <div className={`hl-grid__ph ${placeholderClass}`} aria-hidden />
          )}
          <div className="hl-grid__caption">
            <h3>{title}</h3>
            <p>{body}</p>
          </div>
        </motion.div>
      </motion.div>
    </figure>
  );
}
