/**
 * 히어로 배너 컴포넌트
 *
 * 메인 페이지 상단에 표시되는 대형 슬라이드 배너입니다.
 * TMDB trending/all/day API로 가져온 인기 콘텐츠 5개를 순환합니다.
 *
 * 기능:
 * - 자동 슬라이드 (5초 간격, Framer Motion AnimatePresence)
 * - 배경: 백드롭 이미지 풀스크린 + 블러(8px) + 하단 그라데이션
 * - 콘텐츠 정보: 제목(한글), 평점 ⭐, 장르 태그, 줄거리 (2줄 제한)
 * - 버튼: [▶ 예고편 보기] [+ 보고싶다]
 * - 하단 인디케이터 도트 (현재 슬라이드 표시)
 * - 모바일에서 높이 축소, 텍스트 크기 조절
 */
"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { getBackdropUrl } from "@/lib/tmdb";
import { truncateText, cn } from "@/utils";
import { GENRE_MAP } from "@/constants";
import type { TrendingItem } from "@/types/tmdb";

// ==============================
// 애니메이션 Variants
// ==============================

/** 배경 이미지 페이드 + 슬라이드 애니메이션 */
const backdropVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? 80 : -80,
  }),
  center: {
    opacity: 1,
    x: 0,
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction > 0 ? -80 : 80,
  }),
};

/** 텍스트 콘텐츠 페이드-인-업 애니메이션 */
const contentVariants = {
  enter: {
    opacity: 0,
    y: 30,
  },
  center: {
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.3,
      duration: 0.5,
      ease: "easeOut" as const,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

// ==============================
// 컴포넌트 Props
// ==============================

interface HeroBannerProps {
  /** 트렌딩 콘텐츠 아이템 배열 (최대 5개 권장) */
  items: TrendingItem[];
}

export default function HeroBanner({ items }: HeroBannerProps) {
  /** 현재 활성 슬라이드 인덱스 */
  const [currentIndex, setCurrentIndex] = useState(0);

  /** 슬라이드 전환 방향 (1: 오른쪽, -1: 왼쪽) */
  const [direction, setDirection] = useState(1);

  /** 자동 슬라이드 일시정지 여부 */
  const [isPaused, setIsPaused] = useState(false);

  /** 현재 활성 아이템 */
  const currentItem = items[currentIndex];

  // ──────────────────────────────
  // 1단계: 자동 슬라이드 (5초 간격)
  // ──────────────────────────────
  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  useEffect(() => {
    if (isPaused || items.length <= 1) return;

    const timer = setInterval(goToNext, 5000);
    return () => clearInterval(timer);
  }, [goToNext, isPaused, items.length]);

  // ──────────────────────────────
  // 2단계: 인디케이터 도트 클릭
  // ──────────────────────────────
  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // 아이템이 없는 경우 처리
  if (!items || items.length === 0) return null;

  /** 제목: 영화는 title, TV는 name */
  const displayTitle =
    currentItem.media_type === "movie"
      ? currentItem.title || currentItem.original_title || ""
      : currentItem.name || currentItem.original_name || "";

  /** 상세 페이지 경로 */
  const detailUrl =
    currentItem.media_type === "movie"
      ? `/movies/${currentItem.id}`
      : `/tv/${currentItem.id}`;

  /** 장르 이름 배열 (최대 3개) */
  const genres = currentItem.genre_ids
    .slice(0, 3)
    .map((gid) => GENRE_MAP[gid])
    .filter(Boolean);

  /** 백드롭 이미지 URL (w1280: original 대비 ~60% 용량 절감, 충분한 해상도) */
  const backdropUrl = getBackdropUrl(currentItem.backdrop_path, "w1280");

  return (
    <section
      className="relative w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="히어로 배너 슬라이더"
    >
      {/* ── 배경 이미지 레이어 ── */}
      <div className="relative h-[50vh] w-full sm:h-[60vh] md:h-[70vh] lg:h-[80vh]">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentItem.id}
            custom={direction}
            variants={backdropVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.7, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            {/* 백드롭 이미지 */}
            <Image
              src={backdropUrl}
              alt={displayTitle}
              fill
              priority={currentIndex === 0}
              className="object-cover"
              sizes="100vw"
              style={{ filter: "blur(1px)" }}
            />

            {/* 상단 → 하단 어두운 그라데이션 */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />

            {/* 좌측 어두운 그라데이션 (텍스트 가독성) */}
            <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>

        {/* ── 콘텐츠 정보 오버레이 ── */}
        <div className="absolute inset-0 flex items-end">
          <div className="w-full px-4 pb-16 sm:px-8 sm:pb-20 lg:px-16 lg:pb-24">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentItem.id}
                variants={contentVariants}
                initial="enter"
                animate="center"
                exit="exit"
                className="max-w-2xl"
              >
                {/* 미디어 타입 뱃지 */}
                <span
                  className="mb-2 inline-block rounded-md bg-primary/90 px-2 py-0.5
                             text-xs font-bold uppercase tracking-wider text-white"
                >
                  {currentItem.media_type === "movie" ? "영화" : "TV"}
                </span>

                {/* 제목 */}
                <h1 className="mb-2 text-2xl font-black leading-tight text-white drop-shadow-lg sm:text-3xl md:text-4xl lg:text-5xl">
                  {displayTitle}
                </h1>

                {/* 평점 + 장르 태그 */}
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  {/* 평점 */}
                  <span className="flex items-center gap-1 text-sm font-semibold text-gold sm:text-base">
                    ★ {currentItem.vote_average.toFixed(1)}
                  </span>

                  {/* 구분선 */}
                  <span className="text-white/30">|</span>

                  {/* 장르 태그 */}
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs font-medium
                                 text-white/90 backdrop-blur-sm sm:text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>

                {/* 줄거리 (2줄 제한) */}
                {currentItem.overview && (
                  <p className="mb-5 line-clamp-2 max-w-xl text-sm leading-relaxed text-white/80 sm:text-base">
                    {truncateText(currentItem.overview, 150)}
                  </p>
                )}

                {/* 액션 버튼 */}
                <div className="flex gap-3">
                  {/* 예고편 보기 버튼 */}
                  <Link
                    href={detailUrl}
                    className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5
                               text-sm font-bold text-white shadow-lg shadow-primary/30
                               transition-all hover:bg-primary-hover hover:shadow-xl
                               hover:shadow-primary/40 sm:px-6 sm:py-3 sm:text-base"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      className="h-5 w-5"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                    예고편 보기
                  </Link>

                  {/* 보고싶다 버튼 */}
                  <button
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-white/30
                               bg-white/10 px-4 py-2.5 text-sm font-bold text-white
                               backdrop-blur-sm transition-all hover:bg-white/20
                               sm:px-6 sm:py-3 sm:text-base"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      className="h-5 w-5"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    보고싶다
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* ── 하단 인디케이터 도트 ── */}
        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2 sm:bottom-6">
          {items.map((item, index) => (
            <button
              key={item.id}
              onClick={() => goToSlide(index)}
              aria-label={`슬라이드 ${index + 1}로 이동`}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "w-8 bg-primary"
                  : "w-1.5 bg-white/40 hover:bg-white/60"
              )}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
