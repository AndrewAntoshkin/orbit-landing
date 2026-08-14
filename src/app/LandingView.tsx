"use client";

import Link from "next/link";
import { motion, MotionConfig } from "motion/react";
import { useRef } from "react";
import GravityGallery from "./GravityGallery";
import ChatFlowDemo from "./ChatFlowDemo";
import {
  ExploreMockup,
  LogoMark,
  MemoryMockup,
  SourcesMockup,
  typo,
  WorkflowsMockup,
} from "./LandingMockups";
import ConvergeSection from "./trake/ConvergeSection";
import HeroSplitTitle from "./trake/HeroSplitTitle";
import PerspectiveCard from "./trake/PerspectiveCard";
import Reveal from "./trake/Reveal";
import ScrollMark from "./trake/ScrollMark";
import TypewriterBadge from "./trake/TypewriterBadge";
import "./trake-landing.css";

const NAV = [
  { href: "#for-whom", label: "Для кого" },
  { href: "#how", label: "Как работает" },
  { href: "#ask", label: "Демо" },
  { href: "#faq", label: "FAQ" },
] as const;

const MARK_WORDS = [
  "Tracker",
  "Wiki",
  "Встречи",
  "Staff",
  "Calendar",
  "Решения",
  "Задачи",
  "Контекст",
] as const;

const AUDIENCES = [
  {
    title: "Руководителям",
    body: "Статус команды, решения и риски без ручного сбора апдейтов.",
    image: "/for-whom/leader.png",
    alt: "Руководительница команды",
    ph: "hl-grid__ph--1",
  },
  {
    title: "Проджект-менеджерам",
    body: "Недельный статус, синк и изменения по проекту в одном месте.",
    image: "/for-whom/project-manager.png",
    alt: "Проджект-менеджер",
    ph: "hl-grid__ph--2",
  },
  {
    title: "Дизайнерам",
    body: "Контекст задачи, связанные решения и участники обсуждения.",
    image: "/for-whom/designer.png",
    alt: "Дизайнер",
    ph: "hl-grid__ph--3",
  },
  {
    title: "Разработчикам",
    body: "Почему приняли решение, где источник и что поменялось.",
    image: "/for-whom/developer.png",
    alt: "Разработчик",
    ph: "hl-grid__ph--4",
  },
  {
    title: "Аналитикам",
    body: "Факты по датам и источникам, связи задач и документов.",
    image: "/for-whom/analyst.png",
    alt: "Аналитик",
    ph: "hl-grid__ph--5",
  },
  {
    title: "Новым участникам",
    body: "История проекта, договорённости и роли в команде.",
    image: "/for-whom/newcomer.png",
    alt: "Новый участник",
    ph: "hl-grid__ph--6",
  },
  {
    title: "Тем, кто собирает контекст",
    body: "Сначала контекст. Потом действие.",
    image: "/for-whom/context-poster.png",
    alt: "Редакционный постер про контекст",
    ph: "hl-grid__ph--7",
  },
  {
    title: "Тем, кто хранит решения",
    body: "Решение должно помнить, почему оно принято.",
    image: "/for-whom/decisions-poster.png",
    alt: "Редакционный постер про решения",
    ph: "hl-grid__ph--8",
  },
  {
    title: "Тем, кто проверяет факты",
    body: "Найти источник — часть ответа.",
    image: "/for-whom/sources-poster.png",
    alt: "Редакционный постер про источники",
    ph: "hl-grid__ph--9",
  },
] as const;

const STEPS = [
  {
    n: "01",
    h: "Спросите",
    p: "Задайте вопрос на русском — Halo соберёт ответ из задач, встреч и документов.",
  },
  {
    n: "02",
    h: "Проверьте",
    p: "Рядом с ответом — ссылки на Tracker, Wiki и встречи с датами и уверенностью.",
  },
  {
    n: "03",
    h: "Исследуйте",
    p: "Из ответа перейдите к задаче, человеку или решению и посмотрите историю.",
  },
] as const;

const FEATURES = [
  {
    id: "workflows",
    kicker: "Сценарии",
    title: "Готовые рецепты поверх рабочей памяти",
    body: "Недельный апдейт, 1:1, после отпуска, блокеры — заполните поля и запустите.",
    mockup: <WorkflowsMockup />,
    reverse: true,
  },
  {
    id: "sources",
    kicker: "Источники",
    title: "Ответ можно проверить",
    body: "Halo показывает, откуда взялся каждый вывод, и говорит, если данных мало.",
    mockup: <SourcesMockup />,
  },
  {
    id: "explore",
    kicker: "Исследовать",
    title: "Из ответа — к задаче или человеку",
    body: "История изменений, связанные документы, участники и соседние задачи.",
    mockup: <ExploreMockup />,
    reverse: true,
  },
  {
    id: "memory",
    kicker: "Память",
    title: "Сохраняет подтверждённые решения",
    body: "Явно зафиксированные решения, смены статусов и ответственных — не выдумки.",
    mockup: <MemoryMockup />,
  },
] as const;

const FAQ = [
  {
    q: "Откуда Halo берёт данные?",
    a: "Из Tracker, Wiki, «Мои встречи», Staff и Calendar — только то, к чему у вас уже есть доступ в компании.",
  },
  {
    q: "Можно ли проверить ответ?",
    a: "Да. Каждый вывод сопровождается ссылками на источники, датами и оценкой достоверности.",
  },
  {
    q: "Halo придумывает решения?",
    a: "Нет. Он сохраняет только явно зафиксированные решения и изменения, найденные в источниках.",
  },
  {
    q: "Для кого это сделано?",
    a: "Для команд, где контекст размазан по задачам, встречам и документам — особенно в HR Tech Design.",
  },
  {
    q: "Что видит Halo из моих доступов?",
    a: "Ровно то же, что и вы: права наследуются из исходных систем. Если у вас нет доступа к задаче или странице, они не попадут ни в ответ, ни в источники.",
  },
  {
    q: "Как быстро появляются новые изменения?",
    a: "Задачи и статусы подтягиваются в течение нескольких минут, саммари встреч — после того как готова запись и расшифровка.",
  },
  {
    q: "Можно ли собрать свой сценарий?",
    a: "Да. Сценарий — это набор полей и источников: период, участники, проекты. Готовые шаблоны можно скопировать и изменить под свою команду.",
  },
  {
    q: "Что если данных для ответа мало?",
    a: "Halo скажет об этом прямо в ответе и покажет, чего не хватает, вместо того чтобы достроить недостающее самостоятельно.",
  },
] as const;

function TrakeNav() {
  return (
    <motion.nav
      className="hl-nav"
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.55, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href="/" className="hl-nav__logo">
        <LogoMark className="h-4 w-4" />
        Halo
      </Link>
      {NAV.map((item) => (
        <a key={item.href} className="hl-nav__link" href={item.href}>
          {item.label}
        </a>
      ))}
      <Link href="/" className="hl-nav__cta">
        Открыть <span aria-hidden>↗</span>
      </Link>
    </motion.nav>
  );
}

export default function LandingView() {
  const examplesRef = useRef<HTMLElement>(null);

  return (
    <MotionConfig reducedMotion="user">
      <div className="hl-page min-h-dvh">
        <TrakeNav />

        <header className="hl-hero">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            <TypewriterBadge />
          </motion.div>
          <HeroSplitTitle text={"Меньше\u00a0поисков. Больше\u00a0контекста."} />
          <motion.p
            className="hl-hero__sub"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.45 }}
          >
            {typo(
              "Halo связывает задачи, встречи и решения — и отвечает по рабочему контексту со ссылками на источники.",
            )}
          </motion.p>
          <motion.a
            className="hl-hero__cta"
            href="#ask"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.58 }}
          >
            Посмотреть, как работает <span aria-hidden>↗</span>
          </motion.a>
        </header>

        <section className="hl-why" id="why">
          <Reveal>
            <p className="hl-why__badge">Зачем нужен Halo</p>
          </Reveal>
          <Reveal>
            <h2 className="hl-why__statement">
              <span className="hl-why__dim">
                {typo(
                  "Рабочий контекст живёт в разных системах и быстро теряется.",
                )}
              </span>{" "}
              {typo(
                "Halo собирает его вместе, хранит историю изменений и отвечает со ссылками на источники.",
              )}
            </h2>
          </Reveal>
        </section>

        <ConvergeSection />

        <section className="hl-examples" id="for-whom" ref={examplesRef}>
          <ScrollMark containerRef={examplesRef} words={MARK_WORDS} />
          <div className="hl-grid">
            {AUDIENCES.map((item, index) => (
              <PerspectiveCard
                key={item.title}
                index={index}
                title={item.title}
                body={item.body}
                image={item.image}
                alt={item.alt}
                placeholderClass={item.ph}
              />
            ))}
          </div>
        </section>

        <section className="hl-steps" id="how">
          <Reveal>
            <h2 className="hl-sect__title">
              {typo("От вопроса к ответу за три шага.")}
            </h2>
          </Reveal>
          <ol className="hl-steps__list">
            {STEPS.map((step) => (
              <li key={step.n}>
                <Reveal>
                  <span className="hl-step__n">{step.n}</span>
                  <h3 className="hl-step__h">{step.h}</h3>
                  <p className="hl-step__p">{typo(step.p)}</p>
                </Reveal>
              </li>
            ))}
          </ol>
        </section>

        <section className="hl-demo" id="ask">
          <div className="hl-demo__frame">
            <ChatFlowDemo />
          </div>
        </section>

        {FEATURES.map((feature) => (
          <section
            key={feature.id}
            id={feature.id}
            className={`hl-feature${"reverse" in feature && feature.reverse ? " hl-feature--reverse" : ""}`}
          >
            <Reveal className="hl-feature__copy">
              <p className="hl-feature__kicker">{feature.kicker}</p>
              <h2 className="hl-feature__h">{typo(feature.title)}</h2>
              <p className="hl-feature__p">{typo(feature.body)}</p>
            </Reveal>
            <Reveal>{feature.mockup}</Reveal>
          </section>
        ))}

        <section className="hl-faq" id="faq">
          <Reveal>
            <h2 className="hl-sect__title">{typo("Вопросы и ответы")}</h2>
          </Reveal>
          <div className="hl-faq__list">
            {FAQ.map((item) => (
              <Reveal key={item.q}>
                <details className="hl-qa">
                  <summary>{item.q}</summary>
                  <p>{typo(item.a)}</p>
                </details>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="hl-pills" aria-label="Halo в действии">
          <div className="absolute inset-0">
            <GravityGallery
              count={20}
              size={58}
              responsiveSize
              staggerMs={50}
              startWhenVisible
            />
          </div>
          <div className="hl-pills__copy">
            <Reveal>
              <h2 className="hl-last__h">
                {typo("Перестаньте искать.")}
                <br />
                {typo("Просто спросите.")}
              </h2>
            </Reveal>
            <Reveal>
              <Link href="/" className="hl-hero__cta">
                Открыть Halo <span aria-hidden>↗</span>
              </Link>
              <p className="hl-last__p">
                {typo("Уже работает с HRTECHDESIGN и HRDS.")}
              </p>
              <p className="hl-last__sign">
                {typo("Pet Projects 2026 · Андрей Антошкин")}
              </p>
            </Reveal>
          </div>
        </section>
      </div>
    </MotionConfig>
  );
}
