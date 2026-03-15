import type { Metadata } from "next";
import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export const metadata: Metadata = {
  title: "AI 강의 분석 리포트",
  description: "LangGraph 기반 에이전틱 강의 평가 파이프라인 - 15개 강의 분석 대시보드",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="stylesheet"
          as="style"
          crossOrigin="anonymous"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased">
        <div className="app-shell lg:flex">
          <Sidebar />
          <div className="min-w-0 flex-1 lg:pl-[var(--sidebar-width)]">
            <Header />
            <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-10 lg:py-8">
              <div className="mx-auto flex max-w-[1440px] flex-col gap-7">
                {children}
              </div>
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
