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
        <Sidebar />
        <div style={{ marginLeft: "var(--sidebar-width)" }}>
          <Header />
          <main className="p-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
