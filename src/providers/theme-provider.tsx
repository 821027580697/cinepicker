/**
 * 테마 프로바이더 컴포넌트
 *
 * next-themes 라이브러리를 사용하여 다크모드를 관리합니다.
 *
 * 설정:
 * - attribute="class": HTML 요소에 'dark' 클래스 추가 방식
 * - defaultTheme="system": 시스템 설정을 기본값으로 사용
 * - enableSystem: 시스템 다크모드 자동 감지
 * - disableTransitionOnChange: 테마 전환 시 깜빡임 방지
 */
"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
    </NextThemesProvider>
  );
}
