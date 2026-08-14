"use client";

import {
  ArrowUp,
  ArrowUpRight,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Copy,
  GitFork,
  ListTodo,
  MessageSquare,
  PanelLeft,
  Plus,
  RefreshCw,
  Split,
  Ticket,
  Video,
  X,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { LogoMark, typo } from "./LandingMockups";

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

type Issue = {
  key: string;
  status: string;
  title: string;
  assignee: string;
};

type Scenario = {
  id: string;
  label: string;
  source: string;
  Icon: typeof CalendarDays;
  question: string;
  answer: string;
  bullets: string[];
  heading: string;
  issues: Issue[];
  planHeading: string;
  plan: string[];
  sources: {
    title: string;
    meta: string;
    quote: string;
    Icon: typeof Ticket;
  }[];
};

const SCENARIOS: Scenario[] = [
  {
    id: "return-from-leave",
    label: "После отпуска",
    source: "Память · план",
    Icon: CalendarDays,
    question: "Я вернулся из отпуска. Что произошло? Собери план на сегодня.",
    answer:
      "Тебя не было 8 дней. Главное: OverlayManager закрыли, статус «на паузе» убрали из процесса, а правила кнопок вернулись к тебе. Ниже — что изменилось и с чего начать сегодня.",
    bullets: [
      "HRDS-2171 «OverlayManager» закрыт: забрал tannygl, ревью прошло без замечаний.",
      "На синке дизайн-системы 1 августа договорились убрать статус «на паузе».",
      "Правила применения кнопок ждут текста — макет обновили 6 августа.",
      "Два тикета из HRTECHDESIGN приехали в бэклог без владельца.",
    ],
    heading: "В работе на тебе",
    issues: [
      {
        key: "HRDS-2147",
        status: "inProgress",
        title: "Правила применения кнопок",
        assignee: "andrewaitken · обновлено 6 авг",
      },
      {
        key: "HRDS-2150",
        status: "inProgress",
        title: "Лейаут: 4 колонки слева",
        assignee: "andrewaitken · ревью у tannygl",
      },
      {
        key: "HRDS-2168",
        status: "open",
        title: "Гайд по формам: раздел про валидацию",
        assignee: "без исполнителя",
      },
    ],
    planHeading: "План на сегодня",
    plan: [
      "Дописать текст в правилах кнопок и отдать на ревью — HRDS-2147.",
      "Проверить лейаут из четырёх колонок после смены статусов — HRDS-2150.",
      "Разобрать два тикета без владельца: назначить или закрыть.",
    ],
    sources: [
      {
        title: "HRDS-2171 · OverlayManager",
        meta: "Tracker · закрыт 4 авг",
        quote: "Статус: closed. Исполнитель tannygl, ревью без замечаний.",
        Icon: Ticket,
      },
      {
        title: "Синк дизайн-системы",
        meta: "Встреча · 01 авг",
        quote:
          "«Статус „на паузе“ убираем: задача либо в работе, либо в бэклоге».",
        Icon: Video,
      },
      {
        title: "Правила применения кнопок",
        meta: "Wiki · обновлено 6 авг",
        quote: "Раздел «Иерархия» готов, текста для «Состояний» пока нет.",
        Icon: BookOpen,
      },
      {
        title: "HRTECHDESIGN · бэклог",
        meta: "Tracker · 2 тикета",
        quote: "Два тикета созданы 2 и 3 августа, исполнитель не назначен.",
        Icon: Ticket,
      },
    ],
  },
  {
    id: "weekly-update",
    label: "Недельный апдейт",
    source: "встречи · память · риски",
    Icon: ListTodo,
    question: "Собери черновик недельного апдейта руководителю.",
    answer:
      "Собрал черновик по неделе: три задачи закрыты, одно решение зафиксировано, срокам ничего не угрожает. Формулировки можно править прямо в тексте.",
    bullets: [
      "Закрыто: OverlayManager, ревизия токенов и правки в гайде по формам.",
      "Решение недели: статус «на паузе» больше не используем.",
      "В работе: правила применения кнопок и лейаут из четырёх колонок.",
      "Риск: на следующей неделе на одного ревьюера меньше — tannygl в отпуске.",
    ],
    heading: "Закрыто и в работе",
    issues: [
      {
        key: "HRDS-2171",
        status: "closed",
        title: "OverlayManager",
        assignee: "tannygl · закрыт 4 авг",
      },
      {
        key: "HRDS-2140",
        status: "closed",
        title: "Ревизия токенов типографики",
        assignee: "annkuz · закрыт 5 авг",
      },
      {
        key: "HRDS-2147",
        status: "inProgress",
        title: "Правила применения кнопок",
        assignee: "andrewaitken · ревью в среду",
      },
    ],
    planHeading: "Что дальше",
    plan: [
      "Отдать правила кнопок на ревью до среды.",
      "Согласовать лейаут с командой HRTECHDESIGN.",
      "Найти ревьюера на неделю отпуска tannygl.",
    ],
    sources: [
      {
        title: "HRDS-2171 · OverlayManager",
        meta: "Tracker · закрыт 4 авг",
        quote: "Статус: closed. Исполнитель tannygl, ревью без замечаний.",
        Icon: Ticket,
      },
      {
        title: "Цели ДС 2026",
        meta: "Wiki",
        quote: "Ключевой результат квартала: единые правила компонентов.",
        Icon: BookOpen,
      },
      {
        title: "Планирование недели",
        meta: "Встреча · 05 авг",
        quote: "«Релиз токенов переносим на конец августа, ревьюеров не хватает».",
        Icon: Video,
      },
    ],
  },
  {
    id: "meetings",
    label: "Решения со встреч",
    source: "AI-саммари efficiency",
    Icon: Video,
    question: "Какие решения зафиксировали на встречах за последнюю неделю?",
    answer:
      "За неделю было три встречи. Зафиксировано одно продуктовое решение и две договорённости по процессу — всё сохранено в рабочей памяти со ссылками на записи.",
    bullets: [
      "1 августа, синк ДС: статус «на паузе» убираем из процесса.",
      "3 августа, ревью макетов: правила кнопок принимаем блоками, а не целиком.",
      "5 августа, планирование: релиз токенов переносим на конец месяца.",
      "Открытый вопрос: кто владеет гайдом по формам — решаем на следующем синке.",
    ],
    heading: "Зафиксировано",
    issues: [
      {
        key: "решение",
        status: "decision",
        title: "Убрать статус «на паузе»",
        assignee: "01 авг · синк дизайн-системы",
      },
      {
        key: "решение",
        status: "decision",
        title: "Принимать правила кнопок блоками",
        assignee: "03 авг · ревью макетов",
      },
      {
        key: "решение",
        status: "decision",
        title: "Релиз токенов — конец августа",
        assignee: "05 авг · планирование",
      },
    ],
    planHeading: "Требует твоего ответа",
    plan: [
      "Подтвердить перенос релиза токенов на 28 августа.",
      "Назначить владельца гайда по формам.",
    ],
    sources: [
      {
        title: "Синк дизайн-системы",
        meta: "Встреча · 01 авг",
        quote:
          "«Статус „на паузе“ убираем: задача либо в работе, либо в бэклоге».",
        Icon: Video,
      },
      {
        title: "Ревью макетов",
        meta: "Встреча · 03 авг",
        quote: "«Правила кнопок принимаем блоками — не ждём весь документ».",
        Icon: Video,
      },
      {
        title: "Планирование недели",
        meta: "Встреча · 05 авг",
        quote: "«Релиз токенов переносим на 28 августа».",
        Icon: Video,
      },
    ],
  },
];

const HOME_ROWS = [
  SCENARIOS[0]!,
  SCENARIOS[1]!,
  SCENARIOS[2]!,
  {
    id: "goals",
    label: "Цели и roadmap",
    source: "Wiki · цели",
    Icon: BookOpen,
    question: SCENARIOS[1]!.question,
  },
  {
    id: "onboard",
    label: "Онбординг в отдел",
    source: "Staff · пространства",
    Icon: ListTodo,
    question: SCENARIOS[0]!.question,
  },
  {
    id: "changed",
    label: "Что изменилось",
    source: "memory events · weekly",
    Icon: CalendarDays,
    question: SCENARIOS[1]!.question,
  },
] as const;

type Phase =
  | "home"
  | "typing"
  | "sent"
  | "thinking"
  | "streaming"
  | "blocks"
  | "done";

function statusTone(status: string) {
  const s = status.toLowerCase();
  if (/closed|resolved|done|decision/.test(s)) {
    return "bg-[var(--ok-bg)] text-[var(--ok-fg)]";
  }
  if (/progress|develop|design/.test(s)) {
    return "bg-[var(--chip)] text-[var(--icon)]";
  }
  return "bg-[var(--chip)] text-[var(--text-soft)]";
}

function titleFromMessage(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.length > 42 ? `${clean.slice(0, 42)}…` : clean || "Новый чат";
}

/** Staggered reveal for the parts of the answer that come after the text. */
function Fade({
  delay,
  className,
  children,
}: {
  delay: number;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, delay, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function BrandLockup() {
  return (
    <div className="flex items-center gap-[7px]">
      <LogoMark className="h-8 w-8 text-[var(--text)]" />
      <div className="min-w-0 leading-none text-[var(--text)]">
        <div className="truncate text-[15px] font-bold capitalize tracking-[-0.45px]">
          Halo
        </div>
        <div className="mt-0.5 truncate text-[11px] tracking-[-0.33px] text-[var(--text-muted)]">
          Рабочая память
        </div>
      </div>
    </div>
  );
}

function Composer({
  value,
  loading,
  caret,
}: {
  value: string;
  loading?: boolean;
  caret?: boolean;
}) {
  return (
    <div className="w-full">
      <div className="relative z-[1] cursor-text rounded-[22px] border border-[var(--line)] bg-[var(--raised)] p-3.5 shadow-[var(--shadow-raised)]">
        <div className="relative w-full">
          {!value ? (
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 z-[1] overflow-hidden px-2 py-2 text-[16px] leading-relaxed text-[var(--text-faint)]"
            >
              Спросите Halo…
            </div>
          ) : null}
          <div className="relative z-[2] min-h-[52px] bg-transparent px-2 py-2 text-[16px] leading-relaxed text-[var(--text)]">
            {value}
            {caret ? (
              <span
                aria-hidden
                className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-[var(--text-muted)]"
              />
            ) : null}
          </div>
        </div>
        <div className="relative z-[2] flex justify-end p-0.5">
          <button
            type="button"
            disabled={!value.trim() && !loading}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-fg)] transition enabled:hover:bg-[var(--accent-hover)] disabled:bg-[var(--chip)] disabled:text-[var(--text-muted)]"
          >
            {loading ? (
              <span
                className="h-4 w-4 rounded-full border-2 border-[var(--accent-fg)] border-t-transparent"
                style={{ animation: "hl-spin 0.7s linear infinite" }}
              />
            ) : (
              <ArrowUp className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      <div className="relative mt-2.5 flex flex-wrap items-center gap-1 px-0.5 text-[13px]">
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[var(--text-soft)]">
          <Plus className="h-3.5 w-3.5" />
          Создать
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[var(--text-soft)]">
          <Split className="h-3.5 w-3.5" />
          Источники
        </span>
        <span className="ml-auto inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[var(--text-muted)]">
          Рабочая память
        </span>
      </div>
    </div>
  );
}

export default function ChatFlowDemo() {
  const rootRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const [reduced, setReduced] = useState(false);
  const [activeId, setActiveId] = useState(SCENARIOS[0]!.id);
  const [run, setRun] = useState(0);
  const [phase, setPhase] = useState<Phase>("home");
  const [typedQ, setTypedQ] = useState("");
  const [typedA, setTypedA] = useState("");
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [activeSource, setActiveSource] = useState<string | null>(null);
  const [view, setView] = useState<"home" | "chat">("home");
  const fromUserRef = useRef(false);

  const scenario = SCENARIOS.find((s) => s.id === activeId) ?? SCENARIOS[0]!;
  const inChat = view === "chat";
  const showThread = phase !== "home" && phase !== "typing";
  const busy = phase === "typing" || phase === "thinking" || phase === "streaming";

  const openSource = (title: string) => {
    setSourcesOpen(true);
    setActiveSource((current) => (current === title ? null : title));
  };

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) setInView(true);
      },
      { threshold: 0.25 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!inView) return;
    setSourcesOpen(false);
    setActiveSource(null);

    const fromUser = fromUserRef.current;
    fromUserRef.current = false;

    if (reduced) {
      setTypedQ(scenario.question);
      setTypedA(scenario.answer);
      setView("chat");
      setPhase("done");
      return;
    }

    let cancelled = false;
    const timers: number[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });
    const typeText = async (
      full: string,
      setter: (v: string) => void,
      speed: number,
    ) => {
      let i = 0;
      setter("");
      while (i < full.length && !cancelled) {
        i += 1;
        setter(full.slice(0, i));
        await wait(speed);
      }
    };

    const play = async () => {
      setTypedQ("");
      setTypedA("");
      if (!fromUser) {
        setView("home");
        setPhase("home");
        await wait(700);
        if (cancelled) return;
      }
      setPhase("typing");
      await typeText(scenario.question, setTypedQ, 22);
      if (cancelled) return;
      await wait(320);
      setView("chat");
      setPhase("sent");
      await wait(180);
      if (cancelled) return;
      setPhase("thinking");
      await wait(800);
      if (cancelled) return;
      setPhase("streaming");
      await typeText(scenario.answer, setTypedA, 12);
      if (cancelled) return;
      setPhase("blocks");
      await wait(1500);
      if (cancelled) return;
      setPhase("done");
    };

    void play();
    return () => {
      cancelled = true;
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [inView, reduced, scenario, run]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTo({
      top: el.scrollHeight,
      behavior: reduced ? "auto" : "smooth",
    });
  }, [typedA, phase, sourcesOpen, reduced]);

  const pick = (id: string) => {
    const match =
      SCENARIOS.find((s) => s.id === id) ??
      SCENARIOS.find((s) => s.question === HOME_ROWS.find((r) => r.id === id)?.question);
    fromUserRef.current = inChat;
    setSourcesOpen(false);
    setActiveSource(null);
    setActiveId(match?.id ?? SCENARIOS[0]!.id);
    setRun((n) => n + 1);
  };

  const composerValue = phase === "typing" ? typedQ : "";
  const headerTitle = inChat
    ? titleFromMessage(scenario.question)
    : "Персональный рабочий ассистент";

  return (
    <div ref={rootRef} className="hl-app">
      <aside className="hl-app__side">
        <div className="flex h-14 w-full shrink-0 items-center px-3">
          <BrandLockup />
        </div>
        <div className="space-y-0.5 px-2 pb-3">
          <div className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--text-soft)]">
            <MessageSquare className="h-4 w-4 shrink-0" />
            Новый чат
          </div>
          <div className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--text-soft)]">
            <Zap className="h-4 w-4 shrink-0" />
            Сценарии
          </div>
          <div className="flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-[13.5px] text-[var(--text-soft)]">
            <GitFork className="h-4 w-4 shrink-0" />
            Исследовать
          </div>
        </div>
        <div className="min-h-0 flex-1 overflow-hidden px-2 pb-3">
          {inChat ? (
            <div className="mb-3">
              <div className="px-2 pt-2 pb-1 text-[11px] font-medium tracking-wide text-[var(--text-muted)] uppercase">
                Сегодня
              </div>
              <div className="rounded-xl bg-[var(--side-active)] pl-2.5">
                <div className="truncate py-2.5 text-left text-sm text-[var(--text)]">
                  {titleFromMessage(scenario.question)}
                </div>
              </div>
            </div>
          ) : (
            <p className="px-2 pt-3 text-xs text-[var(--text-muted)]">
              История появится после первого вопроса
            </p>
          )}
        </div>
        <div className="shrink-0 border-t border-[var(--line)] p-3">
          <div className="flex items-center gap-2.5 rounded-xl px-1.5 py-1.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent)] text-[10px] text-[var(--accent-fg)]">
              АА
            </span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Андрей Антошкин</div>
              <div className="truncate text-[11px] text-[var(--text-muted)]">
                andrewaitken
              </div>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-full text-[var(--text-soft)]">
            <PanelLeft className="h-4 w-4" />
          </span>
          <div className="text-sm text-[var(--text-muted)]">{headerTitle}</div>
        </header>

        <div className="relative flex min-h-0 flex-1 flex-col">
          {!inChat ? (
            <div className="relative mx-auto flex h-full w-full max-w-[720px] flex-1 flex-col overflow-hidden px-4">
              <div
                aria-hidden
                className="pointer-events-none absolute top-[32%] left-1/2 h-[320px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(0,0,0,0.045),transparent)] blur-[36px]"
              />
              <div className="relative z-10 flex w-full flex-1 flex-col items-center justify-center py-6">
                <LogoMark className="mb-4 h-10 w-10 text-[var(--text)]" />
                <h1 className="mb-1 text-center font-display text-[2rem] font-medium tracking-tight text-[var(--text)] sm:text-[2.25rem]">
                  Halo
                </h1>
                <p className="mb-6 text-center text-[15px] text-[var(--text-muted)]">
                  Что бы ты хотел сделать?
                </p>
                <div className="mb-1 w-full shrink-0">
                  <Composer
                    value={composerValue}
                    caret={phase === "typing"}
                    loading={false}
                  />
                </div>
                <div className="mt-4 w-full divide-y divide-[var(--line-soft)]">
                  {HOME_ROWS.map((row) => (
                    <button
                      key={row.id}
                      type="button"
                      onClick={() => pick(row.id)}
                      className="flex w-full items-center gap-3 px-1 py-2.5 text-left transition hover:bg-[var(--hover)]"
                    >
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[var(--chip)] text-[var(--icon)]">
                        <row.Icon className="h-3.5 w-3.5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] text-[var(--text)]">
                          {row.label}
                        </span>
                        <span className="mt-0.5 block truncate text-[11.5px] text-[var(--text-muted)]">
                          {row.source}
                        </span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="relative flex min-h-0 flex-1">
              <div className="flex min-w-0 flex-1 flex-col">
                <div
                  ref={scrollRef}
                  className="relative min-h-0 flex-1 overflow-y-auto"
                >
                  <div className="mx-auto flex w-full max-w-[760px] flex-col gap-8 px-4 py-6">
                    {showThread ? (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className="flex justify-end gap-2.5">
                          <div className="max-w-[78%] rounded-[22px] bg-[var(--chip-strong)] px-5 py-3 text-[15px] leading-relaxed text-[var(--text)]">
                            {typo(scenario.question)}
                          </div>
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--chip)] text-xs">
                            А
                          </span>
                        </div>
                      </motion.div>
                    ) : null}

                    {phase === "thinking" ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="animate-pulse text-[15px] text-[var(--text-muted)]">
                          Собираю ответ…
                        </div>
                        <div className="text-[12.5px] text-[var(--text-faint)]">
                          {typo(
                            `Читаю ${scenario.source} · ${scenario.sources.length} источника`,
                          )}
                        </div>
                      </div>
                    ) : null}

                    {phase === "streaming" ||
                    phase === "blocks" ||
                    phase === "done" ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="w-full"
                      >
                        <div className="halo-answer relative text-[15px] leading-relaxed text-[var(--text)]">
                          {typo(typedA)}
                          {phase === "streaming" ? (
                            <span
                              aria-hidden
                              className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[2px] animate-pulse bg-[var(--text-muted)]"
                            />
                          ) : null}
                        </div>

                        {phase === "blocks" || phase === "done" ? (
                          <div className="mt-5 flex flex-col gap-7">
                            <ul className="m-0 flex list-none flex-col gap-2 p-0">
                              {scenario.bullets.map((line, i) => (
                                <Fade key={line} delay={i * 0.09}>
                                  <li className="flex gap-2.5 text-[15px] leading-relaxed text-[var(--text-soft)]">
                                    <span
                                      aria-hidden
                                      className="mt-[0.6em] h-[5px] w-[5px] shrink-0 rounded-full bg-[var(--text-faint)]"
                                    />
                                    <span>{typo(line)}</span>
                                  </li>
                                </Fade>
                              ))}
                            </ul>

                            <Fade delay={scenario.bullets.length * 0.09 + 0.1}>
                              <section>
                                <h2 className="font-display text-[1.05rem] font-medium tracking-tight text-[var(--text)]">
                                  {typo(scenario.heading)}
                                </h2>
                                <div className="mt-3">
                                  {scenario.issues.map((item) => (
                                    <div
                                      key={`${item.key}-${item.title}`}
                                      className="group flex items-start gap-3 border-b border-[var(--line-soft)] py-3 last:border-0"
                                    >
                                      <div className="min-w-0 flex-1">
                                        <div className="mb-1 flex flex-wrap items-center gap-2">
                                          <span className="font-mono text-[12px] font-medium text-[var(--text-soft)]">
                                            {item.key}
                                          </span>
                                          <span
                                            className={cn(
                                              "rounded px-1.5 py-0.5 text-[10px] font-medium",
                                              statusTone(item.status),
                                            )}
                                          >
                                            {item.status}
                                          </span>
                                        </div>
                                        <div className="text-[14.5px] leading-snug text-[var(--text)]">
                                          {typo(item.title)}
                                        </div>
                                        <div className="mt-1.5 text-[12px] text-[var(--text-muted)]">
                                          {item.assignee}
                                        </div>
                                      </div>
                                      <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" />
                                    </div>
                                  ))}
                                </div>
                              </section>
                            </Fade>

                            <Fade delay={scenario.bullets.length * 0.09 + 0.28}>
                              <section>
                                <h2 className="font-display text-[1.05rem] font-medium tracking-tight text-[var(--text)]">
                                  {typo(scenario.planHeading)}
                                </h2>
                                <ol className="m-0 mt-3 flex list-none flex-col gap-2.5 p-0">
                                  {scenario.plan.map((line, i) => (
                                    <li
                                      key={line}
                                      className="flex gap-3 text-[15px] leading-relaxed text-[var(--text)]"
                                    >
                                      <span className="mt-[0.15em] flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-lg bg-[var(--chip)] font-mono text-[11px] text-[var(--text-soft)]">
                                        {i + 1}
                                      </span>
                                      <span>{typo(line)}</span>
                                    </li>
                                  ))}
                                </ol>
                              </section>
                            </Fade>

                            <Fade delay={scenario.bullets.length * 0.09 + 0.46}>
                              <div className="flex flex-wrap items-center gap-1.5">
                                {scenario.sources.map((s) => (
                                  <button
                                    key={s.title}
                                    type="button"
                                    onClick={() => openSource(s.title)}
                                    className={cn(
                                      "inline-flex max-w-full items-center gap-1.5 rounded-full border border-[var(--line)] px-2.5 py-1 text-[12px] text-[var(--text-soft)] transition hover:border-[var(--text-faint)] hover:text-[var(--text)]",
                                      activeSource === s.title &&
                                        "border-[var(--text-faint)] bg-[var(--chip)] text-[var(--text)]",
                                    )}
                                  >
                                    <s.Icon className="h-3 w-3 shrink-0 text-[var(--text-faint)]" />
                                    <span className="truncate">{s.title}</span>
                                  </button>
                                ))}
                              </div>
                            </Fade>
                          </div>
                        ) : null}

                        {phase === "done" ? (
                          <div className="mt-4 flex flex-wrap items-center gap-1 text-[12.5px] text-[var(--text-muted)]">
                            <span className="mr-1 inline-flex items-center gap-1.5 text-[var(--text-soft)]">
                              <CheckCircle2 className="h-3.5 w-3.5" />
                              Готово
                            </span>
                            <button
                              type="button"
                              onClick={() => setSourcesOpen((v) => !v)}
                              className={cn(
                                "inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-[var(--hover)] hover:text-[var(--text)]",
                                sourcesOpen &&
                                  "bg-[var(--hover)] text-[var(--text)]",
                              )}
                            >
                              <BookOpen className="h-3.5 w-3.5" />
                              Источники
                              <span className="tabular-nums text-[var(--text-faint)]">
                                {scenario.sources.length}
                              </span>
                            </button>
                            <span className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5">
                              <Copy className="h-3.5 w-3.5" />
                              Копировать
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                fromUserRef.current = true;
                                setRun((n) => n + 1);
                              }}
                              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
                            >
                              <RefreshCw className="h-3.5 w-3.5" />
                              Ещё раз
                            </button>
                          </div>
                        ) : null}
                      </motion.div>
                    ) : null}
                  </div>
                </div>

                <div className="relative z-40 shrink-0 bg-gradient-to-t from-[var(--app-bg)] via-[var(--app-bg)] to-transparent px-4 pt-2 pb-5">
                  <div className="mx-auto w-full max-w-[760px]">
                    <Composer
                      value={composerValue}
                      caret={phase === "typing"}
                      loading={phase === "thinking"}
                    />
                    <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                      {SCENARIOS.map((s) => (
                        <button
                          key={s.id}
                          type="button"
                          onClick={() => pick(s.id)}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] px-3 py-1.5 text-[12.5px] text-[var(--text-soft)] transition hover:border-[var(--text-faint)] hover:text-[var(--text)]",
                            s.id === activeId &&
                              "border-[var(--text-faint)] bg-[var(--chip)] text-[var(--text)]",
                          )}
                        >
                          <s.Icon className="h-3.5 w-3.5 text-[var(--text-faint)]" />
                          {s.label}
                        </button>
                      ))}
                    </div>
                    <p className="mt-2 text-center text-[11px] text-[var(--text-faint)]">
                      {busy
                        ? "Halo отвечает…"
                        : "Нажмите вопрос под полем — Halo ответит и покажет источники."}
                    </p>
                  </div>
                </div>
              </div>

              <AnimatePresence initial={false}>
                {sourcesOpen ? (
                  <motion.aside
                    key="sources-panel"
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 280, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                    className="hidden shrink-0 overflow-hidden border-l border-[var(--line)] bg-[var(--raised)] lg:block"
                  >
                    <div className="flex h-full w-[280px] flex-col">
                      <div className="flex h-14 shrink-0 items-center gap-2 px-4 text-[14px] font-medium text-[var(--text)]">
                        Источники
                        <span className="tabular-nums text-[12px] font-normal text-[var(--text-faint)]">
                          {scenario.sources.length}
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setSourcesOpen(false);
                            setActiveSource(null);
                          }}
                          aria-label="Закрыть источники"
                          className="ml-auto flex h-7 w-7 items-center justify-center rounded-lg text-[var(--text-muted)] transition hover:bg-[var(--hover)] hover:text-[var(--text)]"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="min-h-0 flex-1 space-y-0.5 overflow-y-auto px-3 pb-6">
                        {scenario.sources.map((s) => (
                          <button
                            key={s.title}
                            type="button"
                            onClick={() =>
                              setActiveSource((current) =>
                                current === s.title ? null : s.title,
                              )
                            }
                            className={cn(
                              "w-full rounded-xl px-2 py-2 text-left transition hover:bg-[var(--hover)]",
                              activeSource === s.title && "bg-[var(--chip)]",
                            )}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--chip)] text-[var(--text-soft)]">
                                <s.Icon className="h-3.5 w-3.5" />
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-[13px] text-[var(--text)]">
                                  {s.title}
                                </span>
                                <span className="block truncate text-[11px] text-[var(--text-muted)]">
                                  {s.meta}
                                </span>
                              </span>
                              <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-[var(--text-faint)]" />
                            </span>
                            {activeSource === s.title ? (
                              <motion.span
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-2 block border-l-2 border-[var(--line)] pl-2.5 text-[12px] leading-relaxed text-[var(--text-soft)]"
                              >
                                {typo(s.quote)}
                              </motion.span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </div>
                  </motion.aside>
                ) : null}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
