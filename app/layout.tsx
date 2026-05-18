import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { DIAGRAM_PUBLIC_URL } from "@/lib/constants";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "人生スケジュール管理ツール",
  description: `実行カレンダー中心のMVP。画面と操作の図解: ${DIAGRAM_PUBLIC_URL}`,
  openGraph: {
    title: "人生スケジュール管理ツール",
    description: "北極星バー＋年・月・週・日の四ペイン（設計図解に準拠した骨格）",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
