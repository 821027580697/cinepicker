/**
 * 영화 상세 페이지
 *
 * 특정 영화의 상세 정보를 표시합니다.
 *
 * 기능:
 * - 배경 이미지 히어로 섹션
 * - 기본 정보 (제목, 개봉일, 장르, 러닝타임, 평점)
 * - 줄거리
 * - 출연진 & 제작진 (수평 스크롤)
 * - 예고편 (YouTube 임베드)
 * - 추천 영화 / 비슷한 영화
 * - SEO: 동적 메타데이터 + JSON-LD Movie 스키마
 *
 * ISR: 24시간 주기 재검증
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getMovieDetail,
  getBackdropUrl,
  getPosterUrl,
} from "@/lib/tmdb";
import {
  getYear,
  convertRatingToFiveScale,
  formatRuntime,
  truncateText,
} from "@/utils";
import { SITE_CONFIG } from "@/constants";
import { MovieJsonLd } from "@/components/common/JsonLd";
import { HorizontalCardSkeleton, TextSkeleton } from "@/components/common/Skeleton";
import MovieDetailClient from "./MovieDetailClient";

// ISR: 24시간 캐싱
export const revalidate = 86400;

// ==============================
// 타입 정의
// ==============================

interface MovieDetailPageProps {
  params: Promise<{ id: string }>;
}

// ==============================
// 동적 메타데이터 생성 (SEO)
// ==============================

export async function generateMetadata({
  params,
}: MovieDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const movieId = parseInt(id);

  if (isNaN(movieId)) return {};

  try {
    const movie = await getMovieDetail(movieId);
    const description = truncateText(movie.overview || "줄거리 정보 없음", 160);
    const backdropUrl = getBackdropUrl(movie.backdrop_path, "w1280");
    const posterUrl = getPosterUrl(movie.poster_path, "w500");

    return {
      title: movie.title,
      description,
      openGraph: {
        title: `${movie.title} - CinePickr`,
        description,
        images: [
          { url: backdropUrl, width: 1280, height: 720, alt: movie.title },
          { url: posterUrl, width: 500, height: 750, alt: movie.title },
        ],
        type: "video.movie",
      },
      twitter: {
        card: "summary_large_image",
        title: `${movie.title} - CinePickr`,
        description,
        images: [backdropUrl],
      },
    };
  } catch {
    return {};
  }
}

// ==============================
// 메인 서버 컴포넌트
// ==============================

export default async function MovieDetailPage({ params }: MovieDetailPageProps) {
  const { id } = await params;
  const movieId = parseInt(id);

  // 유효하지 않은 ID → 404
  if (isNaN(movieId)) {
    notFound();
  }

  // TMDB API 호출 (credits, videos, similar 포함)
  let movie;
  try {
    movie = await getMovieDetail(movieId);
  } catch {
    notFound();
  }

  // 감독 찾기
  const director = movie.credits?.crew.find((c) => c.job === "Director");

  // 평점 변환 (10점 → 5점)
  const tmdbRating = convertRatingToFiveScale(movie.vote_average);

  // 페이지 URL
  const pageUrl = `${SITE_CONFIG.url}/movies/${movieId}`;

  return (
    <>
      {/* JSON-LD 구조화 데이터 (SEO) */}
      <MovieJsonLd
        name={movie.title}
        description={truncateText(movie.overview || "", 300)}
        image={getPosterUrl(movie.poster_path, "w500")}
        datePublished={movie.release_date}
        director={director?.name}
        ratingValue={movie.vote_average}
        ratingCount={movie.vote_count}
        genres={movie.genres.map((g) => g.name)}
        duration={movie.runtime}
        url={pageUrl}
      />

      <article className="min-h-screen bg-background text-foreground">
        {/* ── 히어로 섹션 ── */}
        <section
          className="relative h-[300px] w-full sm:h-[400px] md:h-[500px] lg:h-[600px]"
          aria-label="영화 히어로 배너"
        >
          {/* 배경 이미지 */}
          <Image
            src={getBackdropUrl(movie.backdrop_path, "w1280")}
            alt={`${movie.title} 배경`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* 그라데이션 오버레이 */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

          {/* 콘텐츠 정보 */}
          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-4 pb-6 sm:px-6 md:flex-row md:items-end md:gap-8 lg:px-8 lg:pb-12">
            {/* 포스터: 모바일에서는 작게, 데스크톱에서 크게 */}
            <div className="relative hidden h-[280px] w-[180px] shrink-0 overflow-hidden rounded-lg shadow-xl sm:block md:h-[360px] md:w-[240px] lg:h-[450px] lg:w-[300px]">
              <Image
                src={getPosterUrl(movie.poster_path, "w500")}
                alt={movie.title}
                fill
                sizes="(max-width: 768px) 180px, (max-width: 1200px) 240px, 300px"
                className="object-cover"
                priority
              />
            </div>

            {/* 텍스트 정보 */}
            <div className="flex-1 text-white">
              <h1 className="text-2xl font-bold sm:text-3xl md:text-4xl lg:text-5xl">
                {movie.title}
              </h1>
              {movie.original_title !== movie.title && (
                <p className="mt-1 text-sm text-white/70 sm:text-lg md:text-xl">
                  {movie.original_title}
                </p>
              )}

              {/* 메타 정보 */}
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs sm:mt-3 sm:gap-x-4 sm:gap-y-2 sm:text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <span className="text-gold">★</span>
                  <span className="font-semibold">{tmdbRating.toFixed(1)}</span>
                  <span className="text-white/60">/ 5</span>
                </div>
                <span>{getYear(movie.release_date)}</span>
                <span className="text-white/40">•</span>
                <span>{movie.genres.map((g) => g.name).join(", ")}</span>
                {movie.runtime && (
                  <>
                    <span className="text-white/40">•</span>
                    <span>{formatRuntime(movie.runtime)}</span>
                  </>
                )}
              </div>

              {/* 감독 정보 */}
              {director && (
                <p className="mt-2 text-xs text-white/70 sm:mt-3 sm:text-sm">
                  <span className="font-semibold text-white">감독:</span>{" "}
                  {director.name}
                </p>
              )}

              {/* 태그라인 (모바일에서 숨김) */}
              {movie.tagline && (
                <p className="mt-2 hidden text-sm italic text-white/60 sm:block sm:mt-3">
                  &ldquo;{movie.tagline}&rdquo;
                </p>
              )}
            </div>
          </div>
        </section>

        {/* ── 상세 섹션 (클라이언트 컴포넌트) ── */}
        <Suspense
          fallback={
            <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 lg:px-8">
              <TextSkeleton lines={4} />
              <HorizontalCardSkeleton count={6} />
            </div>
          }
        >
          <MovieDetailClient movie={movie} />
        </Suspense>
      </article>
    </>
  );
}
