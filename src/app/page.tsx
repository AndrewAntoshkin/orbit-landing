import type { Metadata } from "next";
import LandingView from "./LandingView";

export const metadata: Metadata = {
  title: "Орбит — задачи, встречи и решения в одном контексте",
  description:
    "Орбит связывает задачи, встречи, документы и решения отдела дизайна и отвечает по рабочему контексту со ссылками на источники и датами.",
};

export default function LandingPage() {
  return <LandingView />;
}
