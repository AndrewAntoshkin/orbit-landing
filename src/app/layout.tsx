import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Орбит — задачи, встречи и решения в одном контексте",
  description:
    "Орбит связывает задачи, встречи, документы и решения отдела дизайна и отвечает по рабочему контексту со ссылками на источники и датами.",
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/orbit-logo.svg` },
};

const THEME_BOOT = `(function(){try{var p=localStorage.getItem('orbit.theme')||'system';var d=p==='dark'||(p==='system'&&matchMedia('(prefers-color-scheme: dark)').matches);var r=document.documentElement;r.dataset.theme=d?'dark':'light';r.style.colorScheme=d?'dark':'light';}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body
        className={`${geistMono.variable} min-h-dvh bg-[var(--app-bg)] font-sans text-[var(--text)] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
