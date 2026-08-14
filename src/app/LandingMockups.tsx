"use client";

import {
  ArrowUpRight,
  BookOpen,
  GitFork,
  Play,
  Ticket,
  Video,
  Zap,
} from "lucide-react";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
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

const SHORT_WORD =
  "(?:[а-яёa-z]{1,2}|для|при|над|под|без|про|как|или|что|чем|это)";
const HANGING = new RegExp(`(^|[\\s(«„"])(${SHORT_WORD})[ \\t]+`, "giu");

export function typo(input: string): string {
  let out = input.replace(/[ \t]+—/g, "\u00a0—");
  for (let pass = 0; pass < 3; pass += 1) {
    out = out.replace(
      HANGING,
      (_m, pre: string, word: string) => `${pre}${word}\u00a0`,
    );
  }
  return out;
}

export function SourcesMockup() {
  const links = [
    {
      Icon: Ticket,
      title: "HRDS-2171 · OverlayManager",
      meta: "Tracker · закрыт 04 авг",
    },
    { Icon: BookOpen, title: "Цели ДС 2026", meta: "Wiki · раздел «Токены»" },
    { Icon: Video, title: "Синк дизайн-системы", meta: "Встреча · 01 авг" },
  ];
  const why = [
    { title: "HRDS-2171: open → closed", meta: "04 авг · Tracker", conf: "100%" },
    {
      title: "Решили: убрать статус «на паузе»",
      meta: "01 авг · Встреча",
      conf: "94%",
    },
  ];
  return (
    <div className="hl-ui">
      <div className="hl-ui__bar">
        <span className="hl-ui__headline">Источники</span>
        <span className="hl-ui__meta">к ответу · 5</span>
      </div>

      <div className="hl-ui__group">
        <div className="hl-ui__label">Ссылки</div>
        <ul className="hl-ui__list">
          {links.map((s) => (
            <li key={s.title} className="hl-ui__item">
              <span className="hl-ui__icon">
                <s.Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="hl-ui__title">{typo(s.title)}</span>
                <span className="hl-ui__meta">{typo(s.meta)}</span>
              </span>
              <ArrowUpRight className="hl-ui__arrow" />
            </li>
          ))}
        </ul>
      </div>

      <div className="hl-ui__group">
        <div className="hl-ui__label">Как собран ответ</div>
        <ul className="hl-ui__list">
          {why.map((row) => (
            <li key={row.title} className="hl-ui__item">
              <span className="min-w-0 flex-1">
                <span className="hl-ui__title">{typo(row.title)}</span>
                <span className="hl-ui__meta">{typo(row.meta)}</span>
              </span>
              <span className="hl-ui__conf">{row.conf}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="hl-ui__note">
        {typo("Если данных недостаточно, Halo скажет об этом прямо в ответе.")}
      </p>
    </div>
  );
}

export function ExploreMockup() {
  const groups = [
    { label: "Люди", items: ["author · andrewaitken", "follower · tannygl"] },
    { label: "Рядом", items: ["HRTECHDESIGN-4282", "Цели ДС 2026"] },
  ];
  return (
    <div className="hl-ui">
      <div className="hl-ui__bar">
        <span className="hl-ui__icon hl-ui__icon--sm">
          <GitFork className="h-3.5 w-3.5" />
        </span>
        <span className="hl-ui__meta">Исследование связей</span>
      </div>

      <div className="hl-ui__head hl-ui__head--split">
        <span className="min-w-0">
          <span className="hl-ui__key">HRDS-2171</span>
          <span className="hl-ui__headline">OverlayManager</span>
        </span>
        <span className="hl-ui__status">closed</span>
      </div>

      <div className="hl-ui__panel">
        <div className="hl-ui__label">История изменений</div>
        <div className="hl-ui__timeline hl-ui__timeline--bare">
          {[
            "04 авг · open → closed",
            "29 июл · inProgress → open",
            "21 июл · создана из встречи",
          ].map((line) => (
            <div key={line} className="hl-ui__event">
              <span className="hl-ui__dot" aria-hidden />
              {typo(line)}
            </div>
          ))}
        </div>
      </div>

      {groups.map((group) => (
        <div key={group.label} className="hl-ui__group">
          <div className="hl-ui__label">{group.label}</div>
          <div className="hl-ui__chips">
            {group.items.map((item) => (
              <span key={item} className="hl-ui__chip">
                {typo(item)}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function WorkflowsMockup() {
  const cards = [
    {
      title: "Недельный апдейт",
      desc: "сделал · в работе · риски",
      meta: "запуск раз в неделю",
    },
    {
      title: "Подготовка к 1:1",
      desc: "прогресс · решения · вопросы",
      meta: "по участнику команды",
    },
    {
      title: "После отпуска",
      desc: "встречи · закрытия · план",
      meta: "период выбирается вручную",
    },
  ];
  return (
    <div className="hl-ui">
      <div className="hl-ui__bar">
        <span className="hl-ui__headline">Сценарии</span>
        <span className="hl-ui__meta">3 готовых · 1 черновик</span>
      </div>

      <ul className="hl-ui__list">
        {cards.map((c) => (
          <li key={c.title} className="hl-ui__item hl-ui__item--divided">
            <span className="hl-ui__icon">
              <Zap className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="hl-ui__title">{typo(c.title)}</span>
              <span className="hl-ui__meta">{c.desc}</span>
              <span className="hl-ui__meta hl-ui__meta--faint">
                {typo(c.meta)}
              </span>
            </span>
            <span className="hl-ui__play">
              <Play className="h-3 w-3" />
            </span>
          </li>
        ))}
      </ul>

      <p className="hl-ui__note">
        {typo("Заполните поля сценария — Halo соберёт ответ по источникам.")}
      </p>
    </div>
  );
}

export function MemoryMockup() {
  const events = [
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
  ];
  return (
    <div className="hl-ui">
      <div className="hl-ui__bar">
        <span className="hl-ui__headline">Рабочая память</span>
        <span className="hl-ui__meta">за неделю · 3 события</span>
      </div>

      <p className="hl-ui__desc">
        {typo(
          "Halo сохраняет только явно зафиксированные решения и не придумывает новые действия.",
        )}
      </p>

      <div className="hl-ui__track">
        {events.map((e, i) => (
          <div key={e.title} className="hl-ui__event-row">
            <span className="hl-ui__rail" aria-hidden>
              <span className="hl-ui__dot" />
              {i < events.length - 1 ? <span className="hl-ui__line" /> : null}
            </span>
            <span className="min-w-0">
              <span className="hl-ui__title">{typo(e.title)}</span>
              <span className="hl-ui__meta">{typo(e.meta)}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
