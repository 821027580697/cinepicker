/**
 * 다크모드 토글 컴포넌트
 *
 * 태양(라이트) ↔ 달(다크) 아이콘을 전환합니다.
 * - next-themes의 useTheme() 훅으로 테마 상태 관리
 * - Framer Motion rotate 애니메이션 적용
 * - 시스템 설정 자동 감지 (defaultTheme="system")
 * - 하이드레이션 불일치 방지를 위해 mounted 체크
 */
"use client";

import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  /** 하이드레이션 완료 여부 (SSR ↔ CSR 불일치 방지) */
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme, resolvedTheme } = useTheme();

  // 클라이언트 마운트 후에만 렌더링
  useEffect(() => setMounted(true), []);

  // 마운트 전에는 플레이스홀더 표시 (레이아웃 시프트 방지)
  if (!mounted) {
    return (
      <button
        className="flex h-9 w-9 items-center justify-center rounded-full"
        aria-label="테마 전환"
      >
        <div className="h-5 w-5" />
      </button>
    );
  }

  /** 현재 다크모드 여부 (시스템 설정 포함) */
  const isDark = resolvedTheme === "dark";

  /** 테마 토글 핸들러 */
  const toggleTheme = () => {
    setTheme(isDark ? "light" : "dark");
  };

  return (
    <button
      onClick={toggleTheme}
      className="relative flex h-9 w-9 items-center justify-center rounded-full
                 hover:bg-surface-hover active:scale-95"
      aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      title={isDark ? "라이트 모드" : "다크 모드"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {isDark ? (
          /* 달 아이콘 (다크모드) */
          <motion.svg
            key="moon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gold"
            /* 등장: 45도 회전하며 나타남 */
            initial={{ rotate: -45, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 45, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </motion.svg>
        ) : (
          /* 태양 아이콘 (라이트모드) */
          <motion.svg
            key="sun"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-gold"
            /* 등장: -45도 회전하며 나타남 */
            initial={{ rotate: 45, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: -45, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* 태양 중심 원 */}
            <circle cx="12" cy="12" r="5" />
            {/* 태양 광선 */}
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
