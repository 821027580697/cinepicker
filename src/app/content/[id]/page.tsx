/**
 * 콘텐츠 상세 페이지
 *
 * URL: /content/[id]?type=movie 또는 /content/[id]?type=tv
 *
 * Server Component로 TMDB API를 병렬 호출하여 콘텐츠 상세 정보를 표시합니다.
 * generateMetadata()로 동적 SEO 메타데이터를 생성합니다.
 *
 * 레이아웃:
 * 1. 상단 히어로 영역 (백드롭 + 포스터 + 기본 정보)
 * 2. 줄거리 섹션 (접기/펼치기)
 * 3. 출연진 (가로 스크롤 프로필 카드)
 * 4. 예고편 (YouTube iframe)
 * 5. 유저 리뷰 (평점 분포 + 리뷰 목록)
 * 6. 비슷한 콘텐츠 (Carousel 재사용)
 */

import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import {
  getMovieDetail,
  getTVShowDetail,
  getBackdropUrl,
  getPosterUrl,
} from "@/lib/tmdb";
import { getYear, formatRuntime, truncateText, cn } from "@/utils";
import { TMDB } from "@/constants";
import type { MovieDetail, TVShowDetail, CastMember, Video } from "@/types/tmdb";
import type { Movie, TVShow } from "@/types/tmdb";
import { SkeletonBlock, HorizontalCardSkeleton, TextSkeleton } from "@/components/common/Skeleton";

// 클라이언트 컴포넌트 임포트
import HeroActions from "./HeroActions";
import DetailSections from "./DetailSections";

// ==============================
// 타입 정의
// ==============================

/** 페이지 params */
interface PageParams {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ type?: string }>;
}

// ==============================
// ISR 재검증: 1시간
// ==============================
export const revalidate = 3600;

// ==============================
// 동적 메타데이터 생성
// ==============================

/**
 * generateMetadata
 *
 * 콘텐츠 정보를 기반으로 SEO 메타데이터를 동적 생성합니다.
 *
 * 1단계: URL 파라미터에서 ID와 타입 추출
 * 2단계: TMDB API로 콘텐츠 상세 정보 조회
 * 3단계: 제목, 설명, OG 이미지 설정
 */
export async function generateMetadata({
  params,
  searchParams,
}: PageParams): Promise<Metadata> {
  const { id } = await params;
  const { type } = await searchParams;
  const contentId = parseInt(id, 10);
  const contentType = type === "tv" ? "tv" : "movie";

  try {
    if (contentType === "movie") {
      const movie = await getMovieDetail(contentId);
      return {
        title: `${movie.title} - CinePickr`,
        description: truncateText(movie.overview, 160),
        openGraph: {
          title: `${movie.title} - CinePickr`,
          description: truncateText(movie.overview, 160),
          images: movie.backdrop_path
            ? [{ url: getBackdropUrl(movie.backdrop_path, "w1280") }]
            : [],
        },
      };
    } else {
      const tvShow = await getTVShowDetail(contentId);
      return {
        title: `${tvShow.name} - CinePickr`,
        description: truncateText(tvShow.overview, 160),
        openGraph: {
          title: `${tvShow.name} - CinePickr`,
          description: truncateText(tvShow.overview, 160),
          images: tvShow.backdrop_path
            ? [{ url: getBackdropUrl(tvShow.backdrop_path, "w1280") }]
            : [],
        },
      };
    }
  } catch {
    return {
      title: "콘텐츠를 찾을 수 없습니다 - CinePickr",
    };
  }
}

// ==============================
// 메인 페이지 컴포넌트
// ==============================

/**
 * ContentDetailPage
 *
 * 서버 컴포넌트로 TMDB API 병렬 호출 후 데이터를 하위 컴포넌트에 전달합니다.
 *
 * 1단계: URL에서 ID, type 추출
 * 2단계: TMDB API 호출 (상세정보 + credits + videos + similar 모두 append_to_response)
 * 3단계: 히어로 영역 렌더링 (서버)
 * 4단계: 나머지 섹션은 클라이언트 컴포넌트로 위임
 */
export default async function ContentDetailPage({
  params,
  searchParams,
}: PageParams) {
  // 1단계: URL 파라미터 추출
  const { id } = await params;
  const { type } = await searchParams;
  const contentId = parseInt(id, 10);
  const contentType = type === "tv" ? "tv" : "movie";

  // 유효하지 않은 ID인 경우 404
  if (isNaN(contentId)) notFound();

  // 2단계: TMDB API 호출 (append_to_response로 한 번에 가져옴)
  let movieDetail: MovieDetail | null = null;
  let tvDetail: TVShowDetail | null = null;

  try {
    if (contentType === "movie") {
      movieDetail = await getMovieDetail(contentId);
    } else {
      tvDetail = await getTVShowDetail(contentId);
    }
  } catch {
    notFound();
  }

  // 3단계: 공통 데이터 추출
  const isMovie = contentType === "movie";
  const detail = isMovie ? movieDetail! : tvDetail!;

  /** 제목 */
  const title = isMovie
    ? (movieDetail!.title)
    : (tvDetail!.name);

  /** 원제 */
  const originalTitle = isMovie
    ? movieDetail!.original_title
    : tvDetail!.original_name;

  /** 줄거리 */
  const overview = detail.overview;

  /** 태그라인 */
  const tagline = detail.tagline;

  /** 백드롭 이미지 */
  const backdropUrl = getBackdropUrl(detail.backdrop_path, "original");

  /** 포스터 이미지 */
  const posterUrl = getPosterUrl(detail.poster_path, "w500");

  /** 평점 */
  const voteAverage = detail.vote_average;
  const voteCount = detail.vote_count;

  /** 장르 */
  const genres = detail.genres;

  /** 연도 */
  const releaseYear = isMovie
    ? getYear(movieDetail!.release_date)
    : getYear(tvDetail!.first_air_date);

  /** 런타임 / 시즌 수 */
  const runtimeOrSeasons = isMovie
    ? formatRuntime(movieDetail!.runtime)
    : `${tvDetail!.number_of_seasons}시즌 · ${tvDetail!.number_of_episodes}에피소드`;

  /** 감독 / 제작 */
  const director = isMovie
    ? detail.credits?.crew?.find((c) => c.job === "Director")?.name
    : tvDetail!.created_by?.map((c) => c.name).join(", ");

  /** 출연진 */
  const cast: CastMember[] = detail.credits?.cast ?? [];

  /** 비디오 (예고편 등) */
  const videos: Video[] = detail.videos?.results ?? [];

  /** 유사 콘텐츠 */
  const similarItems: (Movie | TVShow)[] = isMovie
    ? (movieDetail!.similar?.results ?? [])
    : (tvDetail!.similar?.results ?? []);

  /** 제작 상태 */
  const status = detail.status;

  return (
    <main className="min-h-screen bg-background">
      {/* ══════════════════════════════
          상단 히어로 영역
          ══════════════════════════════ */}
      <section className="relative w-full">
        {/* 백드롭 배경 이미지 */}
        {/* 모바일에서 높이를 줄여 콘텐츠 접근성 개선 */}
        <div className="relative h-[40vh] w-full sm:h-[50vh] md:h-[60vh] lg:h-[70vh]">
          <Image
            src={backdropUrl}
            alt={title}
            fill
            priority
            className="object-cover"
            sizes="100vw"
            style={{ filter: "blur(2px)" }}
          />

          {/* 그라데이션 오버레이 (하단 → 배경색) */}
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-background/20" />

          {/* 좌측 그라데이션 (가독성) */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/70 via-transparent to-transparent" />
        </div>

        {/* 히어로 콘텐츠 (포스터 + 정보) */}
        <div className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8 lg:px-16">
          <div className="mx-auto flex max-w-6xl gap-4 sm:gap-6 md:gap-8">
            {/* ── 포스터 이미지: 모바일에서 작게, sm 이상에서 크게 ── */}
            <div className="shrink-0">
              <div className="relative h-[160px] w-[107px] overflow-hidden rounded-lg shadow-2xl shadow-black/50 sm:h-[280px] sm:w-[190px] md:h-[340px] md:w-[230px] lg:h-[400px] lg:w-[270px]">
                <Image
                  src={posterUrl}
                  alt={title}
                  fill
                  priority
                  className="object-cover"
                  sizes="(max-width: 640px) 107px, (max-width: 768px) 190px, (max-width: 1024px) 230px, 270px"
                />
              </div>
            </div>

            {/* ── 콘텐츠 정보 ── */}
            <div className="flex flex-1 flex-col justify-end">
              {/* 제목 (한글) */}
              <h1 className="mb-1 text-lg font-black leading-tight text-white drop-shadow-lg sm:text-2xl md:text-3xl lg:text-5xl">
                {title}
              </h1>

              {/* 원제 (다른 경우만 표시, 모바일에서 숨김) */}
              {originalTitle !== title && (
                <p className="mb-2 hidden text-sm text-white/60 sm:block sm:mb-3 sm:text-base">
                  {originalTitle}
                </p>
              )}

              {/* 메타 정보: 평점 · 연도 · 장르 · 런타임 */}
              <div className="mb-2 flex flex-wrap items-center gap-x-2 gap-y-1 sm:mb-4 sm:gap-x-3 sm:gap-y-1.5">
                {/* TMDB 평점 */}
                <span className="flex items-center gap-1 text-xs font-bold text-gold sm:text-sm md:text-base">
                  ★ {voteAverage.toFixed(1)}
                  <span className="hidden text-xs font-normal text-white/50 sm:inline">
                    ({voteCount.toLocaleString()})
                  </span>
                </span>

                <span className="text-white/30">·</span>

                {/* 연도 */}
                <span className="text-xs text-white/80 sm:text-sm">{releaseYear}</span>

                <span className="hidden text-white/30 sm:inline">·</span>

                {/* 런타임/시즌 (모바일에서 숨김) */}
                <span className="hidden text-sm text-white/80 sm:inline">{runtimeOrSeasons}</span>

                {/* 상태 뱃지 (모바일에서 숨김) */}
                {status && (
                  <>
                    <span className="hidden text-white/30 sm:inline">·</span>
                    <span className="hidden rounded-md bg-white/10 px-2 py-0.5 text-xs text-white/70 sm:inline">
                      {status}
                    </span>
                  </>
                )}
              </div>

              {/* 장르 태그 */}
              <div className="mb-2 flex flex-wrap gap-1.5 sm:mb-4 sm:gap-2">
                {genres.slice(0, 3).map((genre) => (
                  <Link
                    key={genre.id}
                    href={`/genre/${genre.id}?type=${contentType}`}
                    className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-medium text-white/90
                               backdrop-blur-sm transition-colors hover:bg-white/20 sm:px-3 sm:py-1 sm:text-xs md:text-sm"
                  >
                    {genre.name}
                  </Link>
                ))}
              </div>

              {/* 감독/제작 정보 (모바일에서 숨김) */}
              {director && (
                <p className="mb-4 hidden text-sm text-white/70 sm:block">
                  <span className="font-semibold text-white/90">
                    {isMovie ? "감독" : "제작"}
                  </span>
                  {" "}
                  {director}
                </p>
              )}

              {/* 액션 버튼 (클라이언트 컴포넌트) */}
              <HeroActions
                contentId={contentId}
                contentType={contentType}
                hasTrailer={videos.some((v) => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"))}
                trailerKey={
                  videos.find(
                    (v) => v.site === "YouTube" && v.type === "Trailer"
                  )?.key ||
                  videos.find(
                    (v) => v.site === "YouTube" && v.type === "Teaser"
                  )?.key
                }
              />
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════
          콘텐츠 상세 섹션들
          ══════════════════════════════ */}
      <div className="mx-auto max-w-6xl px-4 sm:px-8 lg:px-16">
        {/* 나머지 섹션들은 클라이언트 컴포넌트로 위임 (인터랙티브 기능 포함) */}
        <DetailSections
          overview={overview}
          tagline={tagline}
          cast={cast}
          videos={videos}
          similarItems={similarItems}
          contentType={contentType}
        />
      </div>
    </main>
  );
}
