"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MotionConfig, motion, type Variants } from "motion/react";
import {
  ArrowUpRight,
  BookOpen,
  GitFork,
  Moon,
  Sun,
  Ticket,
  Video,
  Zap,
} from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import ClarasightHeroBackground from "./ClarasightHeroBackground";
import ConvergeSection from "./ConvergeSection";
import GravityGallery from "./GravityGallery";
import "./clarasight-hero.css";

/** Inline SVG (not <img>) so the mark inherits the current text colour. */
function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32.048 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      focusable="false"
      className={`shrink-0 ${className}`}
    >
      <path
        d="M13.1433 0.0299511C9.14406 0.192816 6.88204 0.76586 4.84924 2.1291C2.61136 3.62505 1.20589 5.82071 0.596655 8.77038C0.150284 10.9057 0.0537716 12.0036 0.0115473 15.5021C-0.030677 19.0309 0.0356755 20.3579 0.331245 22.0952C0.75952 24.6467 1.1516 25.7506 2.15292 27.2646C2.60532 27.9462 3.69109 29.0742 4.36668 29.5749C5.96517 30.7511 8.1548 31.5353 10.5495 31.7886C13.0769 32.0601 18.5299 32.0722 21.2866 31.8128C23.4822 31.6077 25.6839 30.9019 27.2281 29.9006C29.3936 28.5012 30.8353 26.2995 31.4807 23.4041C31.9029 21.51 32.0477 19.6703 32.0477 16.1657C32.0477 12.088 31.7582 9.18659 31.167 7.32872C30.3527 4.77717 28.4767 2.6177 26.0398 1.42938C24.6162 0.735701 22.4447 0.259169 19.9897 0.090271C18.6928 0.00582314 14.6031 -0.0303688 13.1433 0.0299511ZM13.7827 2.17133C16.6117 2.59357 19.8268 4.59018 23.4581 8.18527C28.9412 13.6081 30.8896 17.9692 29.5384 21.7936C28.9352 23.5006 27.8615 24.9664 25.7503 26.951C23.5486 29.0199 21.745 29.8886 19.6338 29.8886C18.729 29.8886 18.0293 29.7679 17.0943 29.4603C14.404 28.5675 10.9899 26.022 7.57573 22.3606C4.43303 18.9947 2.78629 16.3768 2.24943 13.8976C2.11673 13.2703 2.07451 12.0458 2.16499 11.4245C2.4304 9.56661 3.51616 7.78716 5.69373 5.61562C7.74462 3.57076 9.52408 2.49706 11.3337 2.20149C11.581 2.16529 11.8283 2.12307 11.8766 2.11101C12.154 2.05672 13.2398 2.09291 13.7827 2.17133Z"
        fill="currentColor"
      />
    </svg>
  );
}

const NAV_ITEMS = [
  { href: "#ask", label: "Спросить" },
  { href: "#workflows", label: "Сценарии" },
  { href: "#sources", label: "Источники" },
  { href: "#explore", label: "Исследовать" },
  { href: "#memory", label: "Память" },
];

/** Источники, на которых работает Halo — строка внизу героя как у Clarasight. */
const HERO_SOURCES = [
  "Tracker",
  "Wiki",
  "Мои встречи",
  "Staff",
  "Calendar",
];

/** Короткие предлоги и союзы не должны висеть в конце строки. */
const SHORT_WORD =
  "(?:[а-яёa-z]{1,2}|для|при|над|под|без|про|как|или|что|чем|это)";
const HANGING = new RegExp(`(^|[\\s(«„"])(${SHORT_WORD})[ \\t]+`, "giu");

function typo(input: string): string {
  let out = input.replace(/[ \t]+—/g, "\u00a0—");
  for (let pass = 0; pass < 3; pass += 1) {
    out = out.replace(
      HANGING,
      (_m, pre: string, word: string) => `${pre}${word}\u00a0`,
    );
  }
  return out;
}

const EASE_OUT = [0.22, 1, 0.36, 1] as const;
const EASE_SOFT = [0.16, 1, 0.3, 1] as const;

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.08 * i, duration: 0.45, ease: EASE_OUT },
  }),
};

/** Заголовки проявляются из размытия — дольше и мягче, чем остальной текст. */
const blurIn: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(14px)" },
  show: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: 0.08 * i, duration: 0.9, ease: EASE_SOFT },
  }),
};

function ThemeToggle() {
  const { preference, setTheme } = useTheme();
  const [resolved, setResolved] = useState<"light" | "dark">("light");

  useEffect(() => {
    const read = () => {
      const fromDom = document.documentElement.dataset.theme;
      if (fromDom === "dark" || fromDom === "light") {
        setResolved(fromDom);
        return;
      }
      if (preference === "dark" || preference === "light") {
        setResolved(preference);
        return;
      }
      setResolved(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light",
      );
    };
    read();
  }, [preference]);

  const dark = resolved === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
      aria-label={dark ? "Включить светлую тему" : "Включить тёмную тему"}
      title={dark ? "Светлая тема" : "Тёмная тема"}
    >
      {dark ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
    </button>
  );
}

/** Sticky-панель меню — как утром: плавающая пилюля поверх страницы. */
function TopNav() {
  return (
    <motion.header
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="mx-auto flex w-full max-w-fit items-center gap-1 rounded-full bg-[var(--raised)]/85 px-2 py-1.5 shadow-[var(--shadow-raised)] ring-1 ring-[var(--line)] backdrop-blur"
    >
      <Link
        href="/"
        className="flex items-center gap-1.5 rounded-full px-2 py-1 text-[13px] font-medium text-[var(--text)]"
      >
        <LogoMark className="h-6 w-6" />
        Halo
      </Link>
      <nav className="hidden items-center gap-0.5 sm:flex">
        {NAV_ITEMS.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="rounded-full px-3 py-1.5 text-[13px] text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
          >
            {item.label}
          </a>
        ))}
      </nav>
      <ThemeToggle />
      <Link
        href="/"
        className="ml-0.5 rounded-full bg-[var(--accent)] px-3.5 py-1.5 text-[13px] font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
      >
        Открыть
      </Link>
    </motion.header>
  );
}

function ProductShell({
  children,
  chrome,
}: {
  children: React.ReactNode;
  chrome?: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-md overflow-hidden rounded-[22px] bg-[var(--raised)] shadow-[var(--shadow-raised)] ring-1 ring-[var(--line)]">
      {chrome}
      <div className="p-4">{children}</div>
    </div>
  );
}

function AskMockup() {
  return (
    <ProductShell
      chrome={
        <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2.5">
          <LogoMark className="h-5 w-5" />
          <span className="text-[12px] text-[var(--text-muted)]">
            Рабочая память отдела дизайна
          </span>
        </div>
      }
    >
      <div className="mb-4 flex justify-end">
        <div className="max-w-[88%] rounded-[18px] bg-[var(--chip)] px-3.5 py-2 text-[13px] leading-snug text-pretty text-[var(--text)]">
          {typo(
            "Я вернулся из отпуска. Что произошло? Собери план на сегодня.",
          )}
        </div>
      </div>
      <div className="space-y-4">
        <p className="text-[13.5px] leading-relaxed text-pretty text-[var(--text)]">
          {typo(
            "Пока тебя не было, закрыли OverlayManager и зафиксировали решение по статусам. Ниже — срез из рабочей памяти за неделю.",
          )}
        </p>
        <div>
          <div className="font-display text-[14px] font-medium tracking-tight text-[var(--text)]">
            {typo("В работе")}
          </div>
          <div className="mt-2 divide-y divide-[var(--line-soft)]">
            {[
              {
                key: "HRDS-2147",
                status: "inProgress",
                title: "Правила применения кнопок",
                who: "andrewaitken",
              },
              {
                key: "HRDS-2150",
                status: "inProgress",
                title: "Лейаут: 4 колонки слева",
                who: "andrewaitken",
              },
            ].map((row) => (
              <div key={row.key} className="flex items-start gap-2 py-2.5">
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[11.5px] font-medium text-[var(--text-soft)]">
                      {row.key}
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-[var(--chip)] text-[var(--icon)]">
                      {row.status}
                    </span>
                  </div>
                  <div className="text-[13.5px] leading-snug text-pretty text-[var(--text)]">
                    {typo(row.title)}
                  </div>
                  <div className="mt-1 text-[11.5px] text-[var(--text-muted)]">
                    {row.who}
                  </div>
                </div>
                <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" />
              </div>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 pt-1 text-[12px] text-[var(--text-muted)]">
          <span className="rounded-lg bg-[var(--chip)] px-2 py-1">
            Источники ответа
          </span>
          <span>Как собран ответ →</span>
        </div>
      </div>
    </ProductShell>
  );
}

function SourcesMockup() {
  const links = [
    { Icon: Ticket, title: "HRDS-2171 · OverlayManager", meta: "Tracker" },
    { Icon: BookOpen, title: "Цели ДС 2026", meta: "Wiki" },
    { Icon: Video, title: "Синк дизайн-системы", meta: "Встреча · 01 авг" },
  ];
  const why = [
    {
      title: "HRDS-2171: open → closed",
      meta: "04 авг · Tracker · 100%",
    },
    {
      title: "Решили: убрать статус «на паузе»",
      meta: "01 авг · Встреча · 94%",
    },
  ];
  return (
    <ProductShell>
      <div className="mb-4 flex items-center justify-between">
        <div className="text-[13px] font-medium text-[var(--text)]">
          Источники
        </div>
        <div className="text-[11px] text-[var(--text-muted)]">
          {typo("к ответу")}
        </div>
      </div>
      <div className="mb-5">
        <div className="mb-2 text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
          Ссылки
        </div>
        <ul className="space-y-0.5">
          {links.map((s) => (
            <li
              key={s.title}
              className="flex items-center gap-2.5 rounded-xl px-2 py-2"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--chip)] text-[var(--text-soft)]">
                <s.Icon className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13px] text-[var(--text)]">
                  {typo(s.title)}
                </span>
                <span className="block truncate text-[11px] text-[var(--text-muted)]">
                  {s.meta}
                </span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div className="mb-2 text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
          Как собран ответ
        </div>
        <ul className="space-y-1">
          {why.map((row) => (
            <li key={row.title} className="rounded-lg px-2 py-1.5">
              <span className="block text-pretty text-[13px] text-[var(--text)]">
                {typo(row.title)}
              </span>
              <span className="block text-[11px] text-[var(--text-muted)]">
                {row.meta}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ProductShell>
  );
}

function ExploreMockup() {
  return (
    <ProductShell
      chrome={
        <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2.5">
          <GitFork className="h-3.5 w-3.5 text-[var(--icon)]" />
          <span className="text-[12px] text-[var(--text-muted)]">
            Исследование связей
          </span>
        </div>
      }
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <div className="font-mono text-[12px] font-medium text-[var(--text-soft)]">
            HRDS-2171
          </div>
          <div className="text-[14px] font-medium text-[var(--text)]">
            OverlayManager
          </div>
        </div>
        <span className="rounded px-1.5 py-0.5 text-[10px] font-medium bg-[var(--ok-bg)] text-[var(--ok-fg)]">
          closed
        </span>
      </div>
      <div className="mb-4 rounded-xl bg-[var(--panel-bg)] px-3 py-2.5">
        <div className="mb-1.5 text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
          История изменений
        </div>
        <div className="space-y-2">
          {["04 авг · open → closed", "29 июл · inProgress → open"].map(
            (line) => (
              <div
                key={line}
                className="flex gap-2 text-[12px] text-[var(--text)]"
              >
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--text)]" />
                {line}
              </div>
            ),
          )}
        </div>
      </div>
      <div className="space-y-3">
        {[
          {
            label: "Люди",
            items: ["author · andrewaitken", "follower · tannygl"],
          },
          {
            label: "Рядом",
            items: ["HRTECHDESIGN-4282", "Цели ДС 2026"],
          },
        ].map((g) => (
          <div key={g.label}>
            <div className="mb-1.5 text-[11px] text-[var(--text-muted)]">
              {g.label}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {g.items.map((item) => (
                <span
                  key={item}
                  className="rounded-lg bg-[var(--chip)] px-2 py-1 text-[11.5px] whitespace-nowrap text-[var(--text-soft)]"
                >
                  {typo(item)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </ProductShell>
  );
}

function WorkflowsMockup() {
  const cards = [
    {
      title: "Недельный апдейт для руководителя",
      desc: "Сделал · в работе · риски · план",
    },
    {
      title: "Подготовка к 1:1",
      desc: "Прогресс, вопросы и решения со встреч",
    },
    {
      title: "После отпуска",
      desc: "Что изменилось и с чего начать сегодня",
    },
  ];
  return (
    <ProductShell
      chrome={
        <div className="flex items-center gap-2 border-b border-[var(--line-soft)] px-4 py-2.5">
          <Zap className="h-4 w-4 text-[var(--text-soft)]" />
          <span className="text-[12px] text-[var(--text-muted)]">
            Все сценарии
          </span>
        </div>
      }
    >
      <div className="space-y-2">
        {cards.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-[var(--line-soft)] bg-[var(--chip)]/40 px-3 py-2.5"
          >
            <div className="flex items-start gap-2.5">
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[var(--chip)] text-[var(--text-soft)]">
                <Zap className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[13px] font-medium leading-snug text-[var(--text)]">
                  {typo(c.title)}
                </span>
                <span className="mt-0.5 block text-[11.5px] text-[var(--text-muted)]">
                  {typo(c.desc)}
                </span>
              </span>
            </div>
          </div>
        ))}
      </div>
    </ProductShell>
  );
}

function MemoryMockup() {
  return (
    <ProductShell>
      <div className="mb-3 text-[11px] font-medium tracking-wide text-[var(--text-muted)]">
        Рабочая память
      </div>
      <div className="mb-4">
        <div className="font-display text-[14px] font-medium tracking-tight text-[var(--text)]">
          {typo("Решения со встреч")}
        </div>
        <p className="mt-1 text-[12.5px] leading-relaxed text-pretty text-[var(--text-muted)]">
          {typo(
            "Halo сохраняет только явно зафиксированные решения и не придумывает новые действия.",
          )}
        </p>
      </div>
      <div className="space-y-3">
        {[
          {
            title: "Убрать статус «на паузе» из процесса",
            meta: "зафиксировано на встрече · 01 авг",
          },
          {
            title: "HRDS-2171: inProgress → closed",
            meta: "изменение в Tracker · 04 авг",
          },
          {
            title: "Оунер сменился на tannygl",
            meta: "смена ответственного · Tracker",
          },
        ].map((e, i, arr) => (
          <div key={e.title} className="flex gap-3">
            <div className="flex flex-col items-center pt-1">
              <span className="h-2 w-2 rounded-full bg-[var(--text)]" />
              {i < arr.length - 1 ? (
                <span className="mt-1 h-9 w-px bg-[var(--line)]" />
              ) : null}
            </div>
            <div className="min-w-0 pb-1">
              <div className="text-pretty text-[13px] text-[var(--text)]">
                {typo(e.title)}
              </div>
              <div className="text-[11px] text-[var(--text-muted)]">
                {typo(e.meta)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </ProductShell>
  );
}

function Section({
  id,
  kicker,
  title,
  body,
  mockup,
  reverse,
  index,
}: {
  id: string;
  kicker: string;
  title: string;
  body: string;
  mockup: React.ReactNode;
  reverse?: boolean;
  index: number;
}) {
  return (
    <motion.section
      id={id}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      className={`mx-auto flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-16 sm:py-20 lg:flex-row lg:gap-16 ${
        reverse ? "lg:flex-row-reverse" : ""
      }`}
    >
      <div className="flex-1 text-center lg:text-left">
        <motion.div
          custom={0}
          variants={fadeUp}
          className="text-[12px] font-medium tracking-wide text-[var(--text-faint)]"
        >
          {kicker}
        </motion.div>
        <motion.h2
          custom={1}
          variants={blurIn}
          className="mt-3 font-display text-2xl font-medium tracking-tight text-balance text-[var(--text)] sm:text-[1.85rem]"
        >
          {typo(title)}
        </motion.h2>
        <motion.p
          custom={2}
          variants={fadeUp}
          className="mx-auto mt-3 max-w-md text-[15px] leading-relaxed text-pretty text-[var(--text-muted)] lg:mx-0"
        >
          {typo(body)}
        </motion.p>
      </div>
      <motion.div
        custom={index % 2 === 0 ? 3 : 2}
        variants={fadeUp}
        className="flex flex-1 justify-center"
      >
        <div className="relative w-full max-w-md">
          <div
            aria-hidden
            className="pointer-events-none absolute -inset-10 -z-10 bg-[radial-gradient(closest-side,rgba(0,0,0,0.045),transparent)] blur-[28px]"
          />
          {mockup}
        </div>
      </motion.div>
    </motion.section>
  );
}

export default function LandingView() {
  return (
    <MotionConfig reducedMotion="user">
      <div className="min-h-dvh bg-[var(--app-bg)] text-[var(--text)]">
        <div className="sticky top-4 z-40 -mb-14 flex justify-center px-4">
          <TopNav />
        </div>
        <section className="cs-hero">
          <div className="cs-hero__inner">
            <ClarasightHeroBackground className="cs-hero__background" />
            <div className="cs-hero__gutter">
              <div className="cs-hero__container">
                <motion.div
                  initial="hidden"
                  animate="show"
                  className="cs-hero__header"
                >
                  <div className="cs-hero__header-container">
                    <motion.h1 custom={0} variants={blurIn} className="cs-hero__title">
                      {typo("Halo связывает задачи, встречи и решения")}
                    </motion.h1>
                    <motion.p custom={1} variants={fadeUp} className="cs-hero__subtitle">
                      {typo(
                        "Спросите, что изменилось, — и получите ответ по рабочему контексту со ссылками на источники и датами.",
                      )}
                    </motion.p>
                  </div>
                  <motion.div
                    custom={2}
                    variants={fadeUp}
                    className="cs-hero__buttons"
                  >
                    <a href="#ask" className="cs-hero__btn-primary">
                      {typo("Как это работает")}
                    </a>
                    <a href="#sources" className="cs-hero__btn-secondary">
                      {typo("Источники")}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden
                      >
                        <path
                          d="M10.2002 8.23951C10.4821 7.93608 10.9573 7.91863 11.2607 8.20045L14.7607 11.4504C14.9135 11.5923 15 11.7918 15 12.0003C15 12.2088 14.9135 12.4082 14.7607 12.5501L11.2607 15.8001C10.9573 16.0819 10.4821 16.0644 10.2002 15.761C9.91838 15.4575 9.93584 14.9823 10.2393 14.7004L13.1465 12.0003L10.2393 9.30006C9.93584 9.01819 9.91838 8.543 10.2002 8.23951Z"
                          fill="currentColor"
                        />
                      </svg>
                    </a>
                  </motion.div>
                </motion.div>

                <motion.div
                  custom={3}
                  variants={fadeUp}
                  initial="hidden"
                  animate="show"
                  className="cs-hero__sources"
                >
                  <p className="cs-hero__sources-title">
                    {typo(
                      "Собирает контекст из знакомых инструментов",
                    )}
                  </p>
                  <ul className="cs-hero__sources-row">
                    {HERO_SOURCES.map((label) => (
                      <li key={label} className="cs-hero__source">
                        {label}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </div>
          </div>
        </section>

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="cs-why"
          aria-label="Зачем нужен Halo"
        >
          <div className="cs-why__inner">
            <motion.div custom={0} variants={fadeUp} className="cs-why__badge">
              Зачем нужен Halo
            </motion.div>
            <motion.h2 custom={1} variants={blurIn} className="cs-why__statement">
              {typo(
                "Рабочий контекст хранится в разных системах и быстро теряется. Halo объединяет его, сохраняет историю изменений и помогает найти ответ со ссылками на источники.",
              )}
            </motion.h2>
          </div>
        </motion.section>

        <ConvergeSection />

        <Section
          id="ask"
          index={0}
          kicker="Спросить"
          title="Задайте вопрос — Halo соберёт ответ по источникам"
          body="Узнайте, что произошло за время отпуска, подготовьте недельный апдейт руководителю или разберитесь в целях проекта. Halo отличает текущее состояние от подтверждённых изменений."
          mockup={<AskMockup />}
        />

        <Section
          id="workflows"
          index={1}
          kicker="Сценарии"
          title="Готовые рецепты поверх рабочей памяти"
          body="Недельный апдейт, 1:1, после отпуска, блокеры. Заполни поля в модалке и запусти — Halo соберёт ответ из задач, встреч и решений."
          mockup={<WorkflowsMockup />}
          reverse
        />

        <Section
          id="sources"
          index={2}
          kicker="Источники"
          title="Ответ можно проверить по источникам"
          body="Рядом с ответом Halo показывает ссылки на Tracker, Wiki и встречи, даты и оценку достоверности. Если данных недостаточно, он прямо об этом скажет."
          mockup={<SourcesMockup />}
        />

        <Section
          id="explore"
          index={3}
          kicker="Исследовать"
          title="Из ответа — к задаче, человеку или решению"
          body="Посмотрите историю изменений, связанные документы, участников и соседние задачи."
          mockup={<ExploreMockup />}
          reverse
        />

        <Section
          id="memory"
          index={4}
          kicker="Память"
          title="Сохраняет подтверждённые решения и изменения"
          body="Halo сохраняет явно зафиксированные решения, смены статусов и ответственных. AI формулирует ответ на основе найденных источников."
          mockup={<MemoryMockup />}
        />

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-40px" }}
          className="relative isolate min-h-[100svh] w-full overflow-hidden"
        >
          <div className="absolute inset-0 z-0">
            <GravityGallery count={20} size={80} startWhenVisible />
          </div>

          <div className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-2xl -translate-y-14 flex-col items-center justify-center px-6 py-24 text-center">
            <motion.p
              custom={0}
              variants={fadeUp}
              className="text-[12px] font-medium tracking-wide text-[var(--text-faint)]"
            >
              Сейчас
            </motion.p>
            <motion.h3
              custom={1}
              variants={blurIn}
              className="mt-3 font-display text-2xl font-medium tracking-tight text-balance text-[var(--text)] sm:text-[1.85rem]"
            >
              {typo("Halo работает с контекстом HRTECHDESIGN и HRDS")}
            </motion.h3>
            <motion.p
              custom={2}
              variants={fadeUp}
              className="mt-3 max-w-md text-[15px] leading-relaxed text-pretty text-[var(--text-muted)]"
            >
              {typo(
                "Эту же проверяемую информацию могут использовать AI-агенты через",
              )}
              {"\u00a0"}
              <code className="rounded-md bg-[var(--chip)]/90 px-1.5 py-0.5 text-[13px] text-[var(--text-soft)] backdrop-blur-sm">
                halo.ask
              </code>
              ,{" "}
              <code className="rounded-md bg-[var(--chip)]/90 px-1.5 py-0.5 text-[13px] text-[var(--text-soft)] backdrop-blur-sm">
                halo.neighborhood
              </code>{" "}
              и{"\u00a0"}
              <code className="rounded-md bg-[var(--chip)]/90 px-1.5 py-0.5 text-[13px] text-[var(--text-soft)] backdrop-blur-sm">
                halo.search
              </code>
              .
            </motion.p>
            <motion.div custom={3} variants={fadeUp} className="pointer-events-auto">
              <a
                href="#ask"
                className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-[14px] font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
              >
                {typo("Как это работает")}
              </a>
            </motion.div>

            <div className="mt-16 flex flex-col items-center gap-1 text-[12px] text-pretty text-[var(--text-faint)]">
              <p>
                {typo(
                  "Сделано Андреем Антошкиным для конкурса «Pet Projects 2026»",
                )}
              </p>
              <p>{typo("Halo · рабочий контекст отдела дизайна")}</p>
            </div>
          </div>
        </motion.section>
      </div>
    </MotionConfig>
  );
}
