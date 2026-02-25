/**
 * CinePickr 메인 페이지
 *
 * Server Component로 TMDB API에서 초기 데이터를 fetch합니다.
 * ISR: revalidate 3600 (1시간)
 *
 * 섹션 구성:
 * 1. HeroBanner - 트렌딩 일간 (trending/all/day)
 * 2. "🔥 지금 뜨는 콘텐츠" - 트렌딩 주간 (trending/all/week)
 * 3. "🎬 이번 주 영화 TOP 10" - 인기 영화 (movie/popular) + 순위 번호
 * 4. "📺 인기 드라마" - 인기 TV (tv/popular)
 * 5. "🎭 요즘 핫한 예능" - 예능/리얼리티 장르 TV
 * 6. "⭐ 평점 높은 콘텐츠" - 높은 평점 영화 (movie/top_rated)
 *
 * 각 섹션은 Suspense + Skeleton으로 스트리밍 렌더링됩니다.
 */

import { Suspense } from "react";
import {
  getTrending,
  getPopularMovies,
  getPopularTVShows,
  getTopRatedMovies,
  discoverTVShows,
} from "@/lib/tmdb";
import HeroBanner from "@/components/content/HeroBanner";
import Carousel from "@/components/content/Carousel";
import { BannerSkeleton, HorizontalCardSkeleton } from "@/components/common/Skeleton";
import { WebSiteJsonLd } from "@/components/common/JsonLd";
import { SITE_CONFIG } from "@/constants";
import type { TrendingItem } from "@/types/tmdb";
import type { Movie, TVShow } from "@/types/tmdb";

// ==============================
// ISR 재검증 주기: 1시간 (3600초)
// ==============================
export const revalidate = 3600;

// ==============================
// 비동기 서버 컴포넌트: 히어로 배너
// ==============================

/**
 * HeroBannerSection
 *
 * trending/all/day API에서 상위 5개를 가져와 히어로 배너에 표시합니다.
 */
async function HeroBannerSection() {
  try {
    const data = await getTrending<TrendingItem>("all", "day");

    // API 키 없거나 응답 없으면 빈 배너 표시
    if (!data?.results) return null;

    // 백드롭 이미지가 있는 콘텐츠만 필터링, 최대 5개
    const bannerItems = data.results
      .filter((item) => item.backdrop_path && (item.media_type === "movie" || item.media_type === "tv"))
      .slice(0, 5);

    if (bannerItems.length === 0) return null;

    return <HeroBanner items={bannerItems} />;
  } catch {
    // TMDB API 실패 시 빈 배너 표시
    return null;
  }
}

// ==============================
// 비동기 서버 컴포넌트: 트렌딩 주간
// ==============================

/**
 * TrendingWeekSection
 *
 * trending/all/week API에서 인기 콘텐츠를 가져옵니다.
 * 영화와 TV가 혼합되어 있어 각 아이템의 media_type에 따라 처리합니다.
 */
async function TrendingWeekSection() {
  try {
    const data = await getTrending<TrendingItem>("all", "week");

    // API 키 없거나 응답 없으면 섹션 숨김
    if (!data?.results) return null;

    // TrendingItem을 Movie | TVShow로 변환 (Carousel에 전달)
    // media_type별로 적절한 필드명을 매핑합니다.
    const items: (Movie | TVShow)[] = data.results
      .filter((item) => item.poster_path && (item.media_type === "movie" || item.media_type === "tv"))
      .slice(0, 20)
      .map((item) => {
        if (item.media_type === "movie") {
          return {
            id: item.id,
            title: item.title || "",
            original_title: item.original_title || "",
            overview: item.overview,
            poster_path: item.poster_path,
            backdrop_path: item.backdrop_path,
            release_date: item.release_date || "",
            genre_ids: item.genre_ids,
            adult: item.adult || false,
            original_language: item.original_language,
            popularity: item.popularity,
            vote_average: item.vote_average,
            vote_count: item.vote_count,
            video: false,
          } as Movie;
        }
        return {
          id: item.id,
          name: item.name || "",
          original_name: item.original_name || "",
          overview: item.overview,
          poster_path: item.poster_path,
          backdrop_path: item.backdrop_path,
          first_air_date: item.first_air_date || "",
          genre_ids: item.genre_ids,
          origin_country: [],
          original_language: item.original_language,
          popularity: item.popularity,
          vote_average: item.vote_average,
          vote_count: item.vote_count,
        } as TVShow;
      });

    if (items.length === 0) return null;

    return (
      <Carousel
        title="🔥 지금 뜨는 콘텐츠"
        items={items}
        type="movie"
      />
    );
  } catch {
    return null;
  }
}

// ==============================
// 비동기 서버 컴포넌트: 인기 영화 TOP 10
// ==============================

/**
 * PopularMoviesSection
 *
 * movie/popular API에서 인기 영화 10개를 가져와 순위 번호와 함께 표시합니다.
 */
async function PopularMoviesSection() {
  try {
    const data = await getPopularMovies();
    if (!data?.results) return null;
    const movies = data.results.slice(0, 10);
    if (movies.length === 0) return null;

    return (
      <Carousel
        title="🎬 이번 주 영화 TOP 10"
        items={movies}
        type="movie"
        showRank
      />
    );
  } catch {
    return null;
  }
}

// ==============================
// 비동기 서버 컴포넌트: 인기 드라마
// ==============================

/**
 * PopularDramaSection
 *
 * tv/popular API에서 인기 TV 시리즈를 가져옵니다.
 */
async function PopularDramaSection() {
  try {
    const data = await getPopularTVShows();
    if (!data?.results) return null;
    const shows = data.results.slice(0, 20);
    if (shows.length === 0) return null;

    return (
      <Carousel
        title="📺 인기 드라마"
        items={shows}
        type="tv"
      />
    );
  } catch {
    return null;
  }
}

// ==============================
// 비동기 서버 컴포넌트: 예능/리얼리티
// ==============================

/**
 * VarietyShowSection
 *
 * discover/tv API에서 예능/리얼리티 장르(10764)를 필터링하여 가져옵니다.
 * TMDB 장르 ID: 10764 (Reality), 10767 (Talk)
 */
async function VarietyShowSection() {
  try {
    const data = await discoverTVShows({
      with_genres: "10764,10767",
      with_origin_country: "KR",
    });
    if (!data?.results) return null;
    const shows = data.results.slice(0, 20);
    if (shows.length === 0) return null;

    return (
      <Carousel
        title="🎭 요즘 핫한 예능"
        items={shows}
        type="tv"
      />
    );
  } catch {
    return null;
  }
}

// ==============================
// 비동기 서버 컴포넌트: 평점 높은 영화
// ==============================

/**
 * TopRatedSection
 *
 * movie/top_rated API에서 평점이 높은 영화를 가져옵니다.
 * 향후 자체 DB 기반 유저 평점으로 대체될 수 있습니다.
 */
async function TopRatedSection() {
  try {
    const data = await getTopRatedMovies();
    if (!data?.results) return null;
    const movies = data.results.slice(0, 20);
    if (movies.length === 0) return null;

    return (
      <Carousel
        title="⭐ 유저 평점 TOP"
        items={movies}
        type="movie"
      />
    );
  } catch {
    return null;
  }
}

// ==============================
// 캐러셀 스켈레톤 래퍼
// ==============================

/**
 * CarouselSkeleton
 *
 * 캐러셀 섹션의 로딩 상태를 표시하는 스켈레톤입니다.
 * 제목 플레이스홀더 + 수평 카드 스켈레톤으로 구성됩니다.
 */
function CarouselSkeleton() {
  return (
    <div className="py-6 sm:py-8">
      {/* 제목 스켈레톤 */}
      <div className="mb-4 px-4 lg:px-8">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-surface dark:bg-card" />
      </div>
      {/* 카드 스켈레톤 */}
      <div className="px-4 lg:px-8">
        <HorizontalCardSkeleton count={7} />
      </div>
    </div>
  );
}

// ==============================
// 메인 페이지 컴포넌트
// ==============================

/**
 * HomePage
 *
 * CinePickr의 메인 페이지입니다.
 * 각 섹션은 Suspense로 감싸여 독립적으로 스트리밍 렌더링됩니다.
 * 데이터 로딩 중에는 스켈레톤 UI가 표시됩니다.
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      {/* JSON-LD 구조화 데이터 — WebSite 스키마 (SEO) */}
      <WebSiteJsonLd url={SITE_CONFIG.url} />

      {/* ── 1. 히어로 배너 (트렌딩 일간) ── */}
      <Suspense fallback={<BannerSkeleton />}>
        <HeroBannerSection />
      </Suspense>

      {/* ── 콘텐츠 섹션들 ── */}
      <div className="space-y-2">
        {/* 2. 🔥 지금 뜨는 콘텐츠 (트렌딩 주간) */}
        <Suspense fallback={<CarouselSkeleton />}>
          <TrendingWeekSection />
        </Suspense>

        {/* 3. 🎬 이번 주 영화 TOP 10 (인기 영화 + 순위) */}
        <Suspense fallback={<CarouselSkeleton />}>
          <PopularMoviesSection />
        </Suspense>

        {/* 4. 📺 인기 드라마 */}
        <Suspense fallback={<CarouselSkeleton />}>
          <PopularDramaSection />
        </Suspense>

        {/* 5. 🎭 요즘 핫한 예능 */}
        <Suspense fallback={<CarouselSkeleton />}>
          <VarietyShowSection />
        </Suspense>

        {/* 6. ⭐ 유저 평점 TOP */}
        <Suspense fallback={<CarouselSkeleton />}>
          <TopRatedSection />
        </Suspense>
      </div>
    </main>
  );
}
