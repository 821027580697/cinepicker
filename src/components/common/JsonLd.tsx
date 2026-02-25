/**
 * JSON-LD 구조화 데이터 컴포넌트
 *
 * SEO를 위한 JSON-LD 스키마 마크업을 페이지에 삽입합니다.
 * Google 검색 등에서 리치 결과(Rich Results)를 표시할 수 있습니다.
 *
 * 지원 스키마:
 * - WebSite: 메인 페이지
 * - Movie: 영화 상세
 * - TVSeries: TV 시리즈 상세
 */

// ==============================
// 메인 (WebSite) 스키마
// ==============================

/** WebSite 스키마 — 메인 페이지에 사용 */
export function WebSiteJsonLd({ url }: { url: string }) {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "CinePickr",
    alternateName: "씨네피커",
    url,
    description:
      "영화, 드라마, 예능을 한눈에! CinePickr에서 나만의 콘텐츠를 큐레이션하세요.",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${url}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ==============================
// 영화 (Movie) 스키마
// ==============================

interface MovieJsonLdProps {
  /** 영화 제목 */
  name: string;
  /** 영화 설명 */
  description: string;
  /** 포스터 이미지 URL */
  image: string;
  /** 개봉일 (ISO 날짜) */
  datePublished: string;
  /** 감독 이름 */
  director?: string;
  /** TMDB 평점 (10점 만점) */
  ratingValue: number;
  /** 평점 참여자 수 */
  ratingCount: number;
  /** 장르 이름 배열 */
  genres: string[];
  /** 러닝타임 (분) */
  duration?: number | null;
  /** 페이지 URL */
  url: string;
}

/** Movie 스키마 — 영화 상세 페이지에 사용 */
export function MovieJsonLd({
  name,
  description,
  image,
  datePublished,
  director,
  ratingValue,
  ratingCount,
  genres,
  duration,
  url,
}: MovieJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name,
    description,
    image,
    datePublished,
    genre: genres,
    url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (ratingValue / 2).toFixed(1), // 5점 만점으로 변환
      bestRating: "5",
      worstRating: "1",
      ratingCount,
    },
  };

  // 선택적 필드
  if (director) {
    schema.director = { "@type": "Person", name: director };
  }
  if (duration) {
    schema.duration = `PT${duration}M`; // ISO 8601 Duration
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}

// ==============================
// TV 시리즈 (TVSeries) 스키마
// ==============================

interface TVSeriesJsonLdProps {
  /** TV 시리즈 제목 */
  name: string;
  /** 시리즈 설명 */
  description: string;
  /** 포스터 이미지 URL */
  image: string;
  /** 첫 방영일 (ISO 날짜) */
  datePublished: string;
  /** 제작자 이름 */
  creator?: string;
  /** TMDB 평점 (10점 만점) */
  ratingValue: number;
  /** 평점 참여자 수 */
  ratingCount: number;
  /** 장르 이름 배열 */
  genres: string[];
  /** 시즌 수 */
  numberOfSeasons?: number;
  /** 에피소드 수 */
  numberOfEpisodes?: number;
  /** 페이지 URL */
  url: string;
}

/** TVSeries 스키마 — TV 시리즈 상세 페이지에 사용 */
export function TVSeriesJsonLd({
  name,
  description,
  image,
  datePublished,
  creator,
  ratingValue,
  ratingCount,
  genres,
  numberOfSeasons,
  numberOfEpisodes,
  url,
}: TVSeriesJsonLdProps) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "TVSeries",
    name,
    description,
    image,
    datePublished,
    genre: genres,
    url,
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: (ratingValue / 2).toFixed(1),
      bestRating: "5",
      worstRating: "1",
      ratingCount,
    },
  };

  if (creator) {
    schema.creator = { "@type": "Person", name: creator };
  }
  if (numberOfSeasons) {
    schema.numberOfSeasons = numberOfSeasons;
  }
  if (numberOfEpisodes) {
    schema.numberOfEpisodes = numberOfEpisodes;
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
