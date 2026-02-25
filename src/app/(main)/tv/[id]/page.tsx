/**
 * TV 시리즈 상세 페이지
 *
 * 특정 TV 시리즈의 상세 정보를 표시합니다.
 *
 * 기능:
 * - 배경 이미지 히어로 섹션
 * - 기본 정보 (제목, 방영일, 장르, 시즌/에피소드 수, 평점)
 * - 줄거리
 * - 출연진 & 제작진
 * - 예고편 (YouTube 임베드)
 * - 추천 시리즈 / 비슷한 시리즈
 * - SEO: 동적 메타데이터 + JSON-LD TVSeries 스키마
 *
 * ISR: 24시간 주기 재검증
 */

import { Suspense } from "react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Image from "next/image";
import {
  getTVShowDetail,
  getBackdropUrl,
  getPosterUrl,
} from "@/lib/tmdb";
import {
  getYear,
  convertRatingToFiveScale,
  truncateText,
} from "@/utils";
import { SITE_CONFIG } from "@/constants";
import { TVSeriesJsonLd } from "@/components/common/JsonLd";
import { HorizontalCardSkeleton, TextSkeleton } from "@/components/common/Skeleton";
import TVDetailClient from "./TVDetailClient";

// ISR: 24시간 캐싱
export const revalidate = 86400;

// ==============================
// 타입 정의
// ==============================

interface TVDetailPageProps {
  params: Promise<{ id: string }>;
}

// ==============================
// 동적 메타데이터 생성 (SEO)
// ==============================

export async function generateMetadata({
  params,
}: TVDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  const tvId = parseInt(id);

  if (isNaN(tvId)) return {};

  try {
    const show = await getTVShowDetail(tvId);
    const description = truncateText(show.overview || "줄거리 정보 없음", 160);
    const backdropUrl = getBackdropUrl(show.backdrop_path, "w1280");
    const posterUrl = getPosterUrl(show.poster_path, "w500");

    return {
      title: show.name,
      description,
      openGraph: {
        title: `${show.name} - CinePickr`,
        description,
        images: [
          { url: backdropUrl, width: 1280, height: 720, alt: show.name },
          { url: posterUrl, width: 500, height: 750, alt: show.name },
        ],
        type: "video.tv_show",
      },
      twitter: {
        card: "summary_large_image",
        title: `${show.name} - CinePickr`,
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

export default async function TVDetailPage({ params }: TVDetailPageProps) {
  const { id } = await params;
  const tvId = parseInt(id);

  if (isNaN(tvId)) {
    notFound();
  }

  let show;
  try {
    show = await getTVShowDetail(tvId);
  } catch {
    notFound();
  }

  // 제작자 찾기
  const creator = show.created_by?.[0];

  // 평점 변환
  const tmdbRating = convertRatingToFiveScale(show.vote_average);

  // 페이지 URL
  const pageUrl = `${SITE_CONFIG.url}/tv/${tvId}`;

  return (
    <>
      {/* JSON-LD 구조화 데이터 (SEO) */}
      <TVSeriesJsonLd
        name={show.name}
        description={truncateText(show.overview || "", 300)}
        image={getPosterUrl(show.poster_path, "w500")}
        datePublished={show.first_air_date}
        creator={creator?.name}
        ratingValue={show.vote_average}
        ratingCount={show.vote_count}
        genres={show.genres.map((g) => g.name)}
        numberOfSeasons={show.number_of_seasons}
        numberOfEpisodes={show.number_of_episodes}
        url={pageUrl}
      />

      <article className="min-h-screen bg-background text-foreground">
        {/* ── 히어로 섹션 ── */}
        <section
          className="relative h-[400px] w-full md:h-[500px] lg:h-[600px]"
          aria-label="TV 시리즈 히어로 배너"
        >
          <Image
            src={getBackdropUrl(show.backdrop_path, "w1280")}
            alt={`${show.name} 배경`}
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />

          <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end p-4 pb-8 md:flex-row md:items-end md:gap-8 lg:p-8 lg:pb-12">
            {/* 포스터 */}
            <div className="relative -mt-20 h-[280px] w-[180px] shrink-0 overflow-hidden rounded-lg shadow-xl md:h-[360px] md:w-[240px] lg:h-[450px] lg:w-[300px]">
              <Image
                src={getPosterUrl(show.poster_path, "w500")}
                alt={show.name}
                fill
                sizes="(max-width: 768px) 180px, (max-width: 1200px) 240px, 300px"
                className="object-cover"
                priority
              />
            </div>

            {/* 텍스트 정보 */}
            <div className="mt-6 flex-1 text-white md:mt-0">
              <h1 className="text-3xl font-bold md:text-4xl lg:text-5xl">
                {show.name}
              </h1>
              {show.original_name !== show.name && (
                <p className="mt-1 text-lg text-white/70 md:text-xl">
                  {show.original_name}
                </p>
              )}

              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm md:text-base">
                <div className="flex items-center gap-1">
                  <span className="text-gold">★</span>
                  <span className="font-semibold">{tmdbRating.toFixed(1)}</span>
                  <span className="text-white/60">/ 5</span>
                </div>
                <span>{getYear(show.first_air_date)}</span>
                <span className="text-white/40">•</span>
                <span>{show.genres.map((g) => g.name).join(", ")}</span>
                <span className="text-white/40">•</span>
                <span>{show.number_of_seasons} 시즌</span>
                <span className="text-white/40">•</span>
                <span>{show.number_of_episodes} 에피소드</span>
              </div>

              {/* 제작자 */}
              {creator && (
                <p className="mt-3 text-sm text-white/70">
                  <span className="font-semibold text-white">제작:</span>{" "}
                  {creator.name}
                </p>
              )}

              {/* 태그라인 */}
              {show.tagline && (
                <p className="mt-3 text-sm italic text-white/60">
                  &ldquo;{show.tagline}&rdquo;
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
          <TVDetailClient show={show} />
        </Suspense>
      </article>
    </>
  );
}
