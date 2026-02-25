/**
 * 스크롤 감지 커스텀 훅
 *
 * 페이지 스크롤 위치를 추적하여 헤더 숨기기/보이기,
 * 스크롤 진행도 표시 등에 활용합니다.
 *
 * @example
 * const { scrollY, isScrolled, scrollDirection } = useScroll(50);
 */

"use client";

import { useState, useEffect, useCallback } from "react";

interface UseScrollReturn {
  /** 현재 스크롤 Y 위치 (px) */
  scrollY: number;
  /** 지정된 임계값 이상 스크롤되었는지 여부 */
  isScrolled: boolean;
  /** 스크롤 방향 ("up" | "down") */
  scrollDirection: "up" | "down";
}

/**
 * @param threshold - 스크롤 감지 임계값 (기본값: 50px)
 * @returns 스크롤 상태 객체
 */
export function useScroll(threshold = 50): UseScrollReturn {
  const [scrollY, setScrollY] = useState(0);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [scrollDirection, setScrollDirection] = useState<"up" | "down">("up");

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;

    // 스크롤 방향 결정
    if (currentScrollY > lastScrollY) {
      setScrollDirection("down");
    } else {
      setScrollDirection("up");
    }

    setLastScrollY(currentScrollY);
    setScrollY(currentScrollY);
  }, [lastScrollY]);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  return {
    scrollY,
    isScrolled: scrollY > threshold,
    scrollDirection,
  };
}
