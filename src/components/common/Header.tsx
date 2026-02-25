/**
 * 헤더 컴포넌트
 *
 * 사이트 상단 네비게이션 바를 구성합니다.
 *
 * 구성 요소:
 * - 왼쪽: 로고 "CinePickr" (클릭 시 홈으로 이동)
 * - 중앙: 네비게이션 [영화] [드라마] [예능] [트렌딩]
 *   - 현재 페이지 활성 상태 표시 (하단 밑줄 Framer Motion 애니메이션)
 * - 오른쪽: 검색 아이콘, 다크모드 토글, 로그인/프로필
 *
 * 동작:
 * - 스크롤 시 배경색 변경 (투명 → 반투명 블러)
 * - 모바일: 햄버거 메뉴 (Framer Motion 슬라이드 애니메이션)
 * - 반응형 디자인 적용
 */
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { useScroll } from "@/hooks/use-scroll";
import { useAppStore } from "@/store/use-app-store";
import { NAV_ITEMS } from "@/constants";
import { cn } from "@/utils";
import ThemeToggle from "./ThemeToggle";

export default function Header() {
  const pathname = usePathname();
  const { isScrolled } = useScroll(20);
  const { data: session } = useSession();
  const { openSearch } = useAppStore();

  /** 모바일 메뉴 열림 상태 */
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  /**
   * 현재 경로가 네비게이션 항목과 일치하는지 확인
   * (하위 경로 포함: /movies/123 → /movies 활성)
   */
  const isActiveLink = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href.split("?")[0]);
  };

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        /* 스크롤 전: 투명 배경 / 스크롤 후: 반투명 블러 배경 */
        isScrolled
          ? "border-b border-border bg-background/80 backdrop-blur-lg shadow-sm"
          : "bg-transparent"
      )}
    >
      <nav
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 lg:px-8"
        aria-label="메인 네비게이션"
      >
        {/* ── 왼쪽: 로고 ── */}
        <Link
          href="/"
          className="flex items-center gap-1 text-xl font-extrabold tracking-tight"
          aria-label="CinePickr 홈"
        >
          <span className="text-primary">Cine</span>
          <span className="text-foreground">Pickr</span>
        </Link>

        {/* ── 중앙: 데스크톱 네비게이션 ── */}
        <ul className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const active = isActiveLink(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2 text-sm font-medium transition-colors duration-300",
                    active
                      ? "text-primary"
                      : "text-muted hover:text-foreground"
                  )}
                >
                  {item.label}
                  {/* 활성 상태 하단 밑줄 애니메이션 */}
                  {active && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      transition={{
                        type: "spring",
                        stiffness: 380,
                        damping: 30,
                      }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* ── 오른쪽: 액션 버튼들 ── */}
        <div className="flex items-center gap-1">
          {/* 검색 아이콘 버튼 */}
          <button
            onClick={openSearch}
            className="flex h-9 w-9 items-center justify-center rounded-full
                       hover:bg-surface-hover active:scale-95"
            aria-label="검색 열기"
            title="검색"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-5 w-5"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>

          {/* 다크모드 토글 */}
          <ThemeToggle />

          {/* 로그인 / 프로필 버튼 */}
          {session?.user ? (
            /* 로그인된 상태: 프로필 아바타 */
            <Link
              href="/profile"
              className="ml-1 flex h-8 w-8 items-center justify-center
                         overflow-hidden rounded-full border-2 border-primary/50
                         hover:border-primary active:scale-95"
              title="프로필"
              aria-label="내 프로필 페이지로 이동"
            >
              {session.user.image ? (
                <img
                  src={session.user.image}
                  alt={session.user.name || "프로필"}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-primary">
                  {session.user.name?.charAt(0) || "U"}
                </span>
              )}
            </Link>
          ) : (
            /* 비로그인 상태: 로그인 버튼 */
            <button
              onClick={() => signIn()}
              className="ml-1 rounded-full bg-primary px-4 py-1.5 text-sm font-medium
                         text-white hover:bg-primary-hover active:scale-95"
            >
              로그인
            </button>
          )}

          {/* ── 모바일: 햄버거 메뉴 버튼 ── */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="ml-1 flex h-9 w-9 items-center justify-center rounded-full
                       hover:bg-surface-hover md:hidden"
            aria-label={isMobileMenuOpen ? "메뉴 닫기" : "메뉴 열기"}
          >
            <div className="relative flex h-5 w-5 flex-col items-center justify-center">
              {/* 햄버거 → X 변환 애니메이션 */}
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? 45 : 0,
                  y: isMobileMenuOpen ? 0 : -6,
                }}
                className="absolute h-0.5 w-5 rounded-full bg-foreground"
                transition={{ duration: 0.3 }}
              />
              <motion.span
                animate={{
                  opacity: isMobileMenuOpen ? 0 : 1,
                  scaleX: isMobileMenuOpen ? 0 : 1,
                }}
                className="absolute h-0.5 w-5 rounded-full bg-foreground"
                transition={{ duration: 0.2 }}
              />
              <motion.span
                animate={{
                  rotate: isMobileMenuOpen ? -45 : 0,
                  y: isMobileMenuOpen ? 0 : 6,
                }}
                className="absolute h-0.5 w-5 rounded-full bg-foreground"
                transition={{ duration: 0.3 }}
              />
            </div>
          </button>
        </div>
      </nav>

      {/* ── 모바일 메뉴 (슬라이드 다운 애니메이션) ── */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden border-b border-border bg-background/95
                       backdrop-blur-lg md:hidden"
          >
            <ul className="flex flex-col px-4 py-4">
              {NAV_ITEMS.map((item) => {
                const active = isActiveLink(item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block rounded-lg px-4 py-3 text-base font-medium transition-colors duration-300",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted hover:bg-surface-hover hover:text-foreground"
                      )}
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
