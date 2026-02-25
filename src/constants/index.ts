/**
 * 전역 상수 정의
 *
 * 애플리케이션 전체에서 사용되는 상수값을 한곳에 모아 관리합니다.
 * 매직 넘버나 반복 사용 문자열을 방지합니다.
 */

/** 사이트 기본 정보 */
export const SITE_CONFIG = {
  name: "CinePickr",
  description: "영화와 콘텐츠를 큐레이션하는 플랫폼",
  url: process.env.NEXTAUTH_URL || "http://localhost:3000",
} as const;

/** 헤더 네비게이션 메뉴 항목 */
export const NAV_ITEMS = [
  { label: "영화", href: "/movies" },
  { label: "드라마", href: "/tv?genre=drama" },
  { label: "예능", href: "/tv?genre=variety" },
  { label: "트렌딩", href: "/trending" },
] as const;

/** 푸터 링크 항목 */
export const FOOTER_LINKS = [
  { label: "이용약관", href: "/terms" },
  { label: "개인정보처리방침", href: "/privacy" },
  { label: "고객센터", href: "/support" },
] as const;

/** 페이지네이션 기본 설정 */
export const PAGINATION = {
  /** 한 페이지당 표시할 항목 수 */
  PER_PAGE: 20,
  /** 최대 페이지 수 (TMDB 제한) */
  MAX_PAGE: 500,
} as const;

/** TMDB 관련 상수 */
export const TMDB = {
  /** TMDB 이미지 CDN 기본 URL */
  IMAGE_BASE_URL: "https://image.tmdb.org/t/p",
  /** YouTube 동영상 URL 템플릿 */
  YOUTUBE_URL: "https://www.youtube.com/watch?v=",
  /** YouTube 임베드 URL 템플릿 */
  YOUTUBE_EMBED_URL: "https://www.youtube.com/embed/",
  /** TMDB 로고 URL */
  LOGO_URL: "https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg",
} as const;

/** 영화 정렬 옵션 */
export const SORT_OPTIONS = [
  { label: "인기순", value: "popularity.desc" },
  { label: "평점순", value: "vote_average.desc" },
  { label: "최신순", value: "release_date.desc" },
  { label: "제목순", value: "title.asc" },
] as const;

/** 최근 검색어 관련 상수 */
export const SEARCH = {
  /** 최근 검색어 최대 저장 개수 */
  MAX_RECENT: 10,
  /** 디바운스 대기 시간 (ms) */
  DEBOUNCE_MS: 300,
  /** 로컬스토리지 키 */
  STORAGE_KEY: "cinepickr-recent-searches",
} as const;
