/**
 * 루트 레이아웃
 *
 * 모든 페이지의 최상위 레이아웃입니다.
 * - Pretendard (CDN) + Inter (next/font/google) 폰트 적용
 * - next-themes ThemeProvider 래핑 (attribute="class", defaultTheme="system")
 * - NextAuth SessionProvider 래핑
 * - 공통 메타데이터 설정 (한글 title, description, OG 태그)
 */

import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/providers/theme-provider";
import { AuthProvider } from "@/providers/auth-provider";
import "./globals.css";

/** Inter 폰트: 라틴 문자에 사용 (next/font 최적화) */
const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

/** 모바일 뷰포트 설정: 줌 방지 + safe-area 대응 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

/** 공통 메타데이터 및 OG 태그 */
export const metadata: Metadata = {
  title: {
    default: "CinePickr - 콘텐츠 큐레이션 플랫폼",
    template: "%s | CinePickr",
  },
  description:
    "영화, 드라마, 예능을 한눈에! CinePickr에서 나만의 콘텐츠를 큐레이션하세요.",
  keywords: ["영화", "드라마", "예능", "콘텐츠 큐레이션", "TMDB", "CinePickr"],
  authors: [{ name: "CinePickr" }],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "CinePickr",
    title: "CinePickr - 콘텐츠 큐레이션 플랫폼",
    description:
      "영화, 드라마, 예능을 한눈에! CinePickr에서 나만의 콘텐츠를 큐레이션하세요.",
  },
  twitter: {
    card: "summary_large_image",
    title: "CinePickr - 콘텐츠 큐레이션 플랫폼",
    description:
      "영화, 드라마, 예능을 한눈에! CinePickr에서 나만의 콘텐츠를 큐레이션하세요.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} antialiased`}>
        {/* 키보드 접근성: 본문 건너뛰기 링크 (Tab 시 표시) */}
        <a
          href="#main-content"
          className="fixed left-4 top-4 z-[100] -translate-y-full rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-white shadow-lg transition-transform focus:translate-y-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          본문으로 건너뛰기
        </a>

        {/* 인증 세션 컨텍스트 */}
        <AuthProvider>
          {/* 다크모드 테마 컨텍스트 */}
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
