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
} from "lucide-react";
import { useTheme } from "@/lib/use-theme";
import ClarasightHeroBackground from "./ClarasightHeroBackground";
import ConvergeSection from "./ConvergeSection";
import "./clarasight-hero.css";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${BASE}/orbit-logo.svg`}
      alt=""
      aria-hidden="true"
      className={`shrink-0 rounded-[28%] object-cover ${className}`}
      width={36}
      height={36}
    />
  );
}

const NAV_ITEMS = [
  { href: "#ask", label: "Спросить" },
  { href: "#sources", label: "Источники" },
  { href: "#explore", label: "Исследовать" },
  { href: "#memory", label: "Память" },
];

/** Источники, на которых работает Орбит — строка внизу героя как у Clarasight. */
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
        Орбит
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
            "Орбит сохраняет только явно зафиксированные решения и не придумывает новые действия.",
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
                      {typo("Орбит связывает задачи, встречи и решения")}
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
          aria-label="Зачем нужен Орбит"
        >
          <div className="cs-why__inner">
            <motion.div custom={0} variants={fadeUp} className="cs-why__badge">
              Зачем нужен Орбит
            </motion.div>
            <motion.h2 custom={1} variants={blurIn} className="cs-why__statement">
              {typo(
                "Рабочий контекст хранится в разных системах и быстро теряется. Орбит объединяет его, сохраняет историю изменений и помогает найти ответ со ссылками на источники.",
              )}
            </motion.h2>
          </div>
        </motion.section>

        <ConvergeSection />

        <Section
          id="ask"
          index={0}
          kicker="Спросить"
          title="Задайте вопрос — Орбит соберёт ответ по источникам"
          body="Узнайте, что произошло за время отпуска, подготовьте недельный отчёт или разберитесь в целях проекта. Орбит отличает текущее состояние от подтверждённых изменений."
          mockup={<AskMockup />}
        />

        <Section
          id="sources"
          index={1}
          kicker="Источники"
          title="Ответ можно проверить по источникам"
          body="Рядом с ответом Орбит показывает ссылки на Tracker, Wiki и встречи, даты и оценку достоверности. Если данных недостаточно, он прямо об этом скажет."
          mockup={<SourcesMockup />}
          reverse
        />

        <Section
          id="explore"
          index={2}
          kicker="Исследовать"
          title="Из ответа — к задаче, человеку или решению"
          body="Посмотрите историю изменений, связанные документы, участников и соседние задачи."
          mockup={<ExploreMockup />}
        />

        <Section
          id="memory"
          index={3}
          kicker="Память"
          title="Сохраняет подтверждённые решения и изменения"
          body="Орбит сохраняет явно зафиксированные решения, смены статусов и ответственных. AI формулирует ответ на основе найденных источников."
          mockup={<MemoryMockup />}
          reverse
        />

        <motion.section
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-60px" }}
          className="mx-auto flex max-w-2xl flex-col items-center px-6 py-20 text-center"
        >
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
            {typo("Орбит работает с контекстом HRTECHDESIGN и HRDS")}
          </motion.h3>
          <motion.p
            custom={2}
            variants={fadeUp}
            className="mt-3 max-w-md text-[15px] leading-relaxed text-pretty text-[var(--text-muted)]"
          >
            {typo("Эту же проверяемую информацию могут использовать AI-агенты через")}
            {"\u00a0"}
            <code className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 text-[13px] text-[var(--text-soft)]">
              orbit.ask
            </code>
            ,{" "}
            <code className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 text-[13px] text-[var(--text-soft)]">
              orbit.neighborhood
            </code>{" "}
            и{"\u00a0"}
            <code className="rounded-md bg-[var(--chip)] px-1.5 py-0.5 text-[13px] text-[var(--text-soft)]">
              orbit.search
            </code>
            .
          </motion.p>
          <motion.div custom={3} variants={fadeUp}>
            <a
              href="#ask"
              className="mt-8 inline-flex rounded-full bg-[var(--accent)] px-6 py-3 text-[14px] font-medium text-[var(--accent-fg)] transition hover:bg-[var(--accent-hover)]"
            >
              {typo("Как это работает")}
            </a>
          </motion.div>
        </motion.section>

        <footer className="mx-auto flex max-w-3xl flex-col items-center gap-1 px-6 pb-16 text-center text-[12px] text-pretty text-[var(--text-faint)]">
          <p>
            {typo(
              "Сделано Андреем Антошкиным для конкурса «Pet Projects 2026»",
            )}
          </p>
          <p>{typo("Орбит · рабочий контекст отдела дизайна")}</p>
        </footer>
      </div>
    </MotionConfig>
  );
}
