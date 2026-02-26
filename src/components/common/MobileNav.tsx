/**
 * 모바일 하단 네비게이션 바
 *
 * 모바일 환경에서 하단에 고정되는 네비게이션 바입니다.
 * md(768px) 이상에서는 숨겨지고, 모바일에서만 표시됩니다.
 *
 * 메뉴 구성:
 * - 홈: 메인 페이지
 * - 검색: 검색 모달 열기
 * - 보고싶다: 워치리스트 페이지
 * - 프로필: 마이페이지 / 로그인
 */
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useAppStore } from "@/store/use-app-store";
import { cn } from "@/utils";

/** 하단 네비게이션 아이템 정의 */
interface NavItem {
  /** 고유 키 */
  key: string;
  /** 라벨 */
  label: string;
  /** 경로 (null이면 액션 버튼) */
  href: string | null;
  /** 아이콘 렌더러 */
  icon: (active: boolean) => React.ReactNode;
}

export default function MobileNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { openSearch } = useAppStore();

  /** 현재 경로가 네비게이션 항목과 일치하는지 확인 */
  const isActive = (href: string | null) => {
    if (!href) return false;
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  /** 네비게이션 아이템 목록 */
  const navItems: NavItem[] = [
    {
      key: "home",
      label: "홈",
      href: "/",
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? 0 : 1.5}
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 12l8.954-8.955a1.126 1.126 0 011.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
          />
        </svg>
      ),
    },
    {
      key: "search",
      label: "검색",
      href: null, // 액션 버튼 (모달 열기)
      icon: () => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          className="h-6 w-6"
        >
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
      ),
    },
    {
      key: "watchlist",
      label: "보고싶다",
      href: "/watchlist",
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? 0 : 1.5}
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
          />
        </svg>
      ),
    },
    {
      key: "profile",
      label: session ? "프로필" : "로그인",
      href: session ? "/profile" : "/api/auth/signin",
      icon: (active) => (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill={active ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={active ? 0 : 1.5}
          className="h-6 w-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
          />
        </svg>
      ),
    },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border
                 bg-background/95 backdrop-blur-lg md:hidden"
      aria-label="모바일 하단 네비게이션"
    >
      {/* iOS safe area 대응 (하단 홈 인디케이터 영역) */}
      <div className="flex items-center justify-around pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const active = isActive(item.href);

          // 검색 버튼은 Link가 아닌 button
          if (!item.href) {
            return (
              <button
                key={item.key}
                onClick={openSearch}
                className="flex flex-1 flex-col items-center gap-0.5 py-2 text-muted
                           transition-colors active:scale-95"
                aria-label={item.label}
              >
                {item.icon(false)}
                <span className="text-[10px] font-medium">{item.label}</span>
              </button>
            );
          }

          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center gap-0.5 py-2 transition-colors active:scale-95",
                active ? "text-primary" : "text-muted"
              )}
              aria-label={item.label}
            >
              {item.icon(active)}
              <span className="text-[10px] font-medium">{item.label}</span>
              {/* 활성 인디케이터 도트 */}
              {active && (
                <motion.div
                  layoutId="mobile-nav-indicator"
                  className="absolute -top-0.5 h-0.5 w-5 rounded-full bg-primary"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
