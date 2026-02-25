/**
 * 캐러셀(가로 스크롤) 컴포넌트
 *
 * 재사용 가능한 넷플릭스 스타일 가로 스크롤 캐러셀입니다.
 *
 * 기능:
 * - Props: title(섹션 제목), items(콘텐츠 배열), type('movie'|'tv')
 * - 좌우 화살표 네비게이션 (호버 시 표시, Framer Motion)
 * - 마우스 드래그 스크롤 지원
 * - 반응형: 모바일 터치 스와이프
 * - 넷플릭스 스타일: 호버 시 카드 확대 (주변 카드 밀림)
 * - TOP 10 모드: 순위 번호 오버레이
 */
"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils";
import ContentCard from "./ContentCard";
import type { Movie, TVShow } from "@/types/tmdb";

// ==============================
// 컴포넌트 Props
// ==============================

interface CarouselProps {
  /** 섹션 제목 (예: "🔥 지금 뜨는 콘텐츠") */
  title: string;
  /** 콘텐츠 아이템 배열 */
  items: (Movie | TVShow)[];
  /** 콘텐츠 타입 */
  type: "movie" | "tv";
  /** TOP 10 순위 번호 표시 여부 */
  showRank?: boolean;
  /** 스크롤 시 fade-in-up 애니메이션 적용 */
  animate?: boolean;
}

/** Movie 타입 가드 */
function isMovie(item: Movie | TVShow): item is Movie {
  return "title" in item;
}

export default function Carousel({
  title,
  items,
  type,
  showRank = false,
  animate = true,
}: CarouselProps) {
  /** 스크롤 컨테이너 참조 */
  const scrollRef = useRef<HTMLDivElement>(null);

  /** 화살표 버튼 표시 상태 */
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  /** 마우스 드래그 상태 */
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  /** 마우스가 캐러셀 위에 있는지 여부 */
  const [isHovering, setIsHovering] = useState(false);

  // ──────────────────────────────
  // 1단계: 스크롤 위치에 따라 화살표 표시/숨김
  // ──────────────────────────────
  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    // 왼쪽 끝인지 확인 (약간의 여유값 10px)
    setShowLeftArrow(el.scrollLeft > 10);
    // 오른쪽 끝인지 확인
    setShowRightArrow(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    updateArrows();
    el.addEventListener("scroll", updateArrows, { passive: true });
    return () => el.removeEventListener("scroll", updateArrows);
  }, [updateArrows]);

  // ──────────────────────────────
  // 2단계: 화살표 클릭 시 스크롤 이동
  // ──────────────────────────────
  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;

    // 한 번에 컨테이너 너비의 80%만큼 이동
    const scrollAmount = el.clientWidth * 0.8;
    el.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  // ──────────────────────────────
  // 3단계: 마우스 드래그 스크롤
  // ──────────────────────────────
  const handleMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;

    setIsDragging(true);
    setStartX(e.pageX - el.offsetLeft);
    setScrollLeft(el.scrollLeft);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();

    const el = scrollRef.current;
    if (!el) return;

    // 드래그 거리 계산 (가속도 2배)
    const x = e.pageX - el.offsetLeft;
    const walk = (x - startX) * 2;
    el.scrollLeft = scrollLeft - walk;
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // ──────────────────────────────
  // 4단계: 렌더링
  // ──────────────────────────────

  /** 래퍼 컴포넌트: animate 여부에 따라 motion.section 또는 일반 section */
  const Wrapper = animate ? motion.section : "section";
  const wrapperProps = animate
    ? {
        initial: { opacity: 0, y: 40 },
        whileInView: { opacity: 1, y: 0 },
        viewport: { once: true, margin: "-100px" },
        transition: { duration: 0.6, ease: "easeOut" as const },
      }
    : {};

  return (
    <Wrapper
      {...wrapperProps}
      className="relative py-6 sm:py-8"
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => {
        setIsHovering(false);
        setIsDragging(false);
      }}
    >
      {/* ── 섹션 제목 ── */}
      <h2 className="mb-4 px-4 text-xl font-bold text-foreground sm:text-2xl lg:px-8">
        {title}
      </h2>

      {/* ── 스크롤 컨테이너 ── */}
      <div className="relative">
        {/* 좌측 화살표 */}
        <AnimatePresence>
          {showLeftArrow && isHovering && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("left")}
              className="absolute left-0 top-0 z-10 hidden h-full w-12 items-center
                         justify-center bg-gradient-to-r from-background/80 to-transparent
                         hover:from-background/95 md:flex"
              aria-label="왼쪽으로 스크롤"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-6 w-6 text-foreground"
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>

        {/* 카드 리스트 (가로 스크롤) */}
        <div
          ref={scrollRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className={cn(
            "flex gap-3 overflow-x-auto px-4 pb-4 sm:gap-4 lg:px-8",
            /* 스크롤바 숨김 */
            "scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]",
            /* 드래그 중 커서 변경 */
            isDragging ? "cursor-grabbing" : "cursor-grab"
          )}
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item, index) => {
            const movie = isMovie(item);
            return (
              <div
                key={item.id}
                className="w-[140px] shrink-0 sm:w-[160px] md:w-[180px] lg:w-[200px]"
              >
                <ContentCard
                  id={item.id}
                  type={type}
                  title={movie ? item.title : item.name}
                  posterPath={item.poster_path}
                  voteAverage={item.vote_average}
                  genreIds={item.genre_ids}
                  releaseDate={
                    movie ? item.release_date : item.first_air_date
                  }
                  overview={item.overview}
                  rank={showRank ? index + 1 : undefined}
                />
              </div>
            );
          })}
        </div>

        {/* 우측 화살표 */}
        <AnimatePresence>
          {showRightArrow && isHovering && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => scroll("right")}
              className="absolute right-0 top-0 z-10 hidden h-full w-12 items-center
                         justify-center bg-gradient-to-l from-background/80 to-transparent
                         hover:from-background/95 md:flex"
              aria-label="오른쪽으로 스크롤"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2.5}
                className="h-6 w-6 text-foreground"
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </Wrapper>
  );
}
