/**
 * 콘텐츠 카드 컴포넌트
 *
 * 영화/드라마 포스터를 카드 형태로 표시합니다.
 *
 * 기능:
 * - 포스터 이미지 (Next.js Image, lazy loading)
 * - 제목 (1줄 ellipsis)
 * - 평점 ⭐ 숫자
 * - 호버 효과: scale(1.05), 그림자 증가
 * - 호버 시 오버레이: 장르 태그, 개봉년도, 짧은 줄거리
 * - 클릭 시 상세 페이지로 이동
 * - 반응형 크기 조절
 * - TOP 10 번호 오버레이 옵션
 */
"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { getPosterUrl } from "@/lib/tmdb";
import { getYear, truncateText, cn } from "@/utils";

/** 장르 ID → 장르 이름 매핑 (TMDB 기본 장르) */
const GENRE_MAP: Record<number, string> = {
  28: "액션",
  12: "모험",
  16: "애니메이션",
  35: "코미디",
  80: "범죄",
  99: "다큐멘터리",
  18: "드라마",
  10751: "가족",
  14: "판타지",
  36: "역사",
  27: "공포",
  10402: "음악",
  9648: "미스터리",
  10749: "로맨스",
  878: "SF",
  10770: "TV 영화",
  53: "스릴러",
  10752: "전쟁",
  37: "서부",
  /* TV 장르 */
  10759: "액션/모험",
  10762: "키즈",
  10763: "뉴스",
  10764: "리얼리티",
  10765: "SF/판타지",
  10766: "연속극",
  10767: "토크쇼",
  10768: "전쟁/정치",
};

// ==============================
// 컴포넌트 Props
// ==============================

interface ContentCardProps {
  /** 콘텐츠 ID */
  id: number;
  /** 콘텐츠 타입 (영화 또는 TV) */
  type: "movie" | "tv";
  /** 제목 */
  title: string;
  /** 포스터 이미지 경로 (TMDB path) */
  posterPath: string | null;
  /** 평점 (10점 만점) */
  voteAverage: number;
  /** 장르 ID 배열 */
  genreIds?: number[];
  /** 개봉/방영일 (ISO 날짜 문자열) */
  releaseDate?: string;
  /** 줄거리 */
  overview?: string;
  /** TOP 10 순위 번호 (선택) */
  rank?: number;
}

export default function ContentCard({
  id,
  type,
  title,
  posterPath,
  voteAverage,
  genreIds = [],
  releaseDate = "",
  overview = "",
  rank,
}: ContentCardProps) {
  /** 호버 상태 관리 */
  const [isHovered, setIsHovered] = useState(false);

  /** 상세 페이지 URL 생성 */
  const detailUrl = type === "movie" ? `/movies/${id}` : `/tv/${id}`;

  /** 포스터 이미지 URL (w500 사이즈) */
  const posterUrl = getPosterUrl(posterPath, "w500");

  /** 장르 이름 배열 (최대 2개) */
  const genres = genreIds
    .slice(0, 2)
    .map((gid) => GENRE_MAP[gid])
    .filter(Boolean);

  /** 개봉/방영 연도 */
  const year = getYear(releaseDate);

  return (
    <Link
      href={detailUrl}
      className="group relative block shrink-0"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        /* 호버 시 scale(1.05) + 그림자 증가 */
        whileHover={{ scale: 1.05 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className="relative overflow-hidden rounded-xl bg-card shadow-md
                   transition-shadow duration-300 group-hover:shadow-xl group-hover:shadow-black/30"
      >
        {/* ── 포스터 이미지 ── */}
        <div className="relative aspect-[2/3] w-full overflow-hidden">
          <Image
            src={posterUrl}
            alt={title}
            fill
            sizes="(max-width: 640px) 45vw, (max-width: 768px) 30vw, (max-width: 1024px) 22vw, 18vw"
            className="object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />

          {/* ── TOP 10 순위 번호 오버레이 ── */}
          {rank && (
            <div
              className="absolute -left-1 bottom-0 flex items-end"
              aria-label={`${rank}위`}
            >
              <span
                className="text-[5rem] font-black leading-none text-white sm:text-[6rem]"
                style={{
                  textShadow: "2px 2px 8px rgba(0,0,0,0.8)",
                  WebkitTextStroke: "2px rgba(229, 9, 20, 0.6)",
                }}
              >
                {rank}
              </span>
            </div>
          )}

          {/* ── 호버 시 오버레이 ── */}
          <motion.div
            initial={false}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 flex flex-col justify-end
                       bg-gradient-to-t from-black/90 via-black/50 to-transparent
                       p-3 sm:p-4"
          >
            {/* 장르 태그 */}
            {genres.length > 0 && (
              <div className="mb-2 flex flex-wrap gap-1">
                {genres.map((genre) => (
                  <span
                    key={genre}
                    className="rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-medium
                               text-white backdrop-blur-sm sm:text-xs"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            )}

            {/* 개봉 연도 */}
            {year !== "미정" && (
              <p className="mb-1 text-xs text-white/70">{year}</p>
            )}

            {/* 줄거리 (2줄 제한) */}
            {overview && (
              <p className="line-clamp-2 text-xs leading-relaxed text-white/80">
                {truncateText(overview, 80)}
              </p>
            )}
          </motion.div>
        </div>
      </motion.div>

      {/* ── 포스터 하단: 제목 + 평점 ── */}
      <div className="mt-2 px-0.5">
        {/* 제목 (1줄 ellipsis) */}
        <h3 className="truncate text-sm font-semibold text-foreground">
          {title}
        </h3>

        {/* 평점 */}
        <div className="mt-0.5 flex items-center gap-1 text-xs text-muted">
          <span className="text-gold">★</span>
          <span>{voteAverage.toFixed(1)}</span>
        </div>
      </div>
    </Link>
  );
}
