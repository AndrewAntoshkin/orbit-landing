import type { Metadata } from "next";
import LandingView from "./LandingView";

export const metadata: Metadata = {
  title: "Halo — задачи, встречи и решения в одном контексте",
  description:
    "Halo связывает задачи, встречи, документы и решения отдела дизайна и отвечает по рабочему контексту со ссылками на источники и датами.",
};

export default function LandingPage() {
  return <LandingView />;
}
