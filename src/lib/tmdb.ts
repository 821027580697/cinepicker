/**
 * TMDB API 클라이언트
 *
 * The Movie Database (TMDB) API와 통신하기 위한 유틸리티 모듈입니다.
 * - 기본 fetch 래퍼 함수
 * - 에러 핸들링
 * - 한국어(ko-KR) 기본 설정
 * - 이미지 URL 헬퍼 함수
 *
 * @see https://developer.themoviedb.org/docs
 */

import type {
  TMDBPaginatedResponse,
  TMDBErrorResponse,
  Movie,
  MovieDetail,
  TVShow,
  TVShowDetail,
  PersonDetail,
  GenreListResponse,
  MultiSearchResult,
  MediaType,
  TimeWindow,
  PosterSize,
  BackdropSize,
  ProfileSize,
  StillSize,
} from "@/types/tmdb";

// ==============================
// 상수 설정
// ==============================

/** TMDB API v3 기본 URL */
const TMDB_BASE_URL = "https://api.themoviedb.org/3";

/** TMDB 이미지 CDN 기본 URL */
const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p";

/** 기본 언어 설정 (한국어) */
const DEFAULT_LANGUAGE = "ko-KR";

/** 기본 지역 설정 (한국) */
const DEFAULT_REGION = "KR";

// ==============================
// 커스텀 에러 클래스
// ==============================

/**
 * TMDB API 에러 클래스
 *
 * TMDB API 호출 실패 시 상세한 에러 정보를 제공합니다.
 */
export class TMDBError extends Error {
  public statusCode: number;
  public statusMessage: string;

  constructor(response: TMDBErrorResponse, httpStatus: number) {
    super(`TMDB API Error (${httpStatus}): ${response.status_message}`);
    this.name = "TMDBError";
    this.statusCode = response.status_code;
    this.statusMessage = response.status_message;
  }
}

// ==============================
// 기본 fetch 래퍼
// ==============================

/**
 * TMDB API fetch 래퍼 함수
 *
 * 1단계: API 키 확인
 * 2단계: URL 및 쿼리 파라미터 구성
 * 3단계: fetch 요청 실행
 * 4단계: 응답 상태 확인 및 에러 처리
 * 5단계: JSON 파싱 후 타입 안전 반환
 *
 * @param endpoint - API 엔드포인트 경로 (예: "/movie/popular")
 * @param params - 추가 쿼리 파라미터
 * @param options - fetch 옵션 (Next.js revalidate 등)
 * @returns 파싱된 API 응답 데이터
 */
async function fetchTMDB<T>(
  endpoint: string,
  params: Record<string, string> = {},
  options: RequestInit & { next?: { revalidate?: number } } = {}
): Promise<T> {
  // 1단계: API 키 확인
  // DATABASE_URL과 마찬가지로, API 키가 없으면 에러를 던지지 않고
  // 콘솔 경고만 출력합니다. (Vercel 빌드 / 초기 개발 시 크래시 방지)
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    console.warn(
      "[TMDB] TMDB_API_KEY 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인하세요."
    );
    return null as unknown as T;
  }

  // 2단계: URL 및 쿼리 파라미터 구성
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("language", DEFAULT_LANGUAGE);
  url.searchParams.set("region", DEFAULT_REGION);

  // 추가 파라미터 병합 (기본값 덮어쓰기 가능)
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  // 3단계: fetch 요청 실행 (Next.js ISR 캐싱 기본 설정: 1시간)
  const response = await fetch(url.toString(), {
    ...options,
    next: { revalidate: 3600, ...options.next },
  });

  // 4단계: 응답 상태 확인 및 에러 처리
  if (!response.ok) {
    const errorData: TMDBErrorResponse = await response.json();
    throw new TMDBError(errorData, response.status);
  }

  // 5단계: JSON 파싱 후 반환
  const data: T = await response.json();
  return data;
}

// ==============================
// 이미지 URL 헬퍼 함수
// ==============================

/**
 * TMDB 포스터 이미지 전체 URL을 생성합니다.
 *
 * @param path - TMDB에서 제공하는 이미지 경로 (예: "/abc123.jpg")
 * @param size - 이미지 크기 (기본값: "w500")
 * @returns 완전한 이미지 URL 또는 null일 경우 플레이스홀더 URL
 */
export function getPosterUrl(
  path: string | null,
  size: PosterSize = "w500"
): string {
  if (!path) return "/images/no-poster.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * TMDB 배경(백드롭) 이미지 전체 URL을 생성합니다.
 *
 * @param path - TMDB에서 제공하는 이미지 경로
 * @param size - 이미지 크기 (기본값: "w1280")
 * @returns 완전한 이미지 URL 또는 null일 경우 플레이스홀더 URL
 */
export function getBackdropUrl(
  path: string | null,
  size: BackdropSize = "w1280"
): string {
  if (!path) return "/images/no-backdrop.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * TMDB 프로필(인물) 이미지 전체 URL을 생성합니다.
 *
 * @param path - TMDB에서 제공하는 이미지 경로
 * @param size - 이미지 크기 (기본값: "w185")
 * @returns 완전한 이미지 URL 또는 null일 경우 플레이스홀더 URL
 */
export function getProfileUrl(
  path: string | null,
  size: ProfileSize = "w185"
): string {
  if (!path) return "/images/no-profile.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

/**
 * TMDB 스틸(에피소드) 이미지 전체 URL을 생성합니다.
 *
 * @param path - TMDB에서 제공하는 이미지 경로
 * @param size - 이미지 크기 (기본값: "w300")
 * @returns 완전한 이미지 URL 또는 null일 경우 플레이스홀더 URL
 */
export function getStillUrl(
  path: string | null,
  size: StillSize = "w300"
): string {
  if (!path) return "/images/no-still.svg";
  return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
}

// ==============================
// 영화 (Movie) API
// ==============================

/**
 * 인기 영화 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getPopularMovies(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>("/movie/popular", {
    page: String(page),
  });
}

/**
 * 현재 상영 중인 영화 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getNowPlayingMovies(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>("/movie/now_playing", {
    page: String(page),
  });
}

/**
 * 평점 높은 영화 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getTopRatedMovies(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>("/movie/top_rated", {
    page: String(page),
  });
}

/**
 * 개봉 예정 영화 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getUpcomingMovies(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>("/movie/upcoming", {
    page: String(page),
  });
}

/**
 * 영화 상세 정보를 조회합니다.
 *
 * credits, videos, images, recommendations, similar 데이터를
 * append_to_response로 함께 가져옵니다.
 *
 * @param movieId - 영화 ID
 */
export async function getMovieDetail(movieId: number) {
  return fetchTMDB<MovieDetail>(
    `/movie/${movieId}`,
    {
      append_to_response: "credits,videos,images,recommendations,similar",
      include_image_language: "ko,null",
    },
    { next: { revalidate: 86400 } } // 24시간 캐싱
  );
}

// ==============================
// TV 시리즈 (TV Show) API
// ==============================

/**
 * 인기 TV 시리즈 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getPopularTVShows(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<TVShow>>("/tv/popular", {
    page: String(page),
  });
}

/**
 * 현재 방영 중인 TV 시리즈 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getOnTheAirTVShows(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<TVShow>>("/tv/on_the_air", {
    page: String(page),
  });
}

/**
 * 평점 높은 TV 시리즈 목록을 조회합니다.
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getTopRatedTVShows(page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<TVShow>>("/tv/top_rated", {
    page: String(page),
  });
}

/**
 * TV 시리즈 상세 정보를 조회합니다.
 *
 * credits, videos, images, recommendations, similar 데이터를
 * append_to_response로 함께 가져옵니다.
 *
 * @param tvId - TV 시리즈 ID
 */
export async function getTVShowDetail(tvId: number) {
  return fetchTMDB<TVShowDetail>(
    `/tv/${tvId}`,
    {
      append_to_response: "credits,videos,images,recommendations,similar",
      include_image_language: "ko,null",
    },
    { next: { revalidate: 86400 } } // 24시간 캐싱
  );
}

// ==============================
// 인물 (Person) API
// ==============================

/**
 * 인물 상세 정보를 조회합니다.
 *
 * movie_credits, tv_credits, images 데이터를
 * append_to_response로 함께 가져옵니다.
 *
 * @param personId - 인물 ID
 */
export async function getPersonDetail(personId: number) {
  return fetchTMDB<PersonDetail>(`/person/${personId}`, {
    append_to_response: "movie_credits,tv_credits,images",
  });
}

// ==============================
// 검색 (Search) API
// ==============================

/**
 * 영화, TV, 인물을 통합 검색합니다.
 *
 * @param query - 검색어
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function searchMulti(query: string, page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<MultiSearchResult>>(
    "/search/multi",
    {
      query,
      page: String(page),
      include_adult: "false",
    },
    { cache: "no-store" } // 검색은 항상 실시간
  );
}

/**
 * 영화만 검색합니다.
 *
 * @param query - 검색어
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function searchMovies(query: string, page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>(
    "/search/movie",
    {
      query,
      page: String(page),
      include_adult: "false",
    },
    { cache: "no-store" } // 검색은 항상 실시간
  );
}

/**
 * TV 시리즈만 검색합니다.
 *
 * @param query - 검색어
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function searchTVShows(query: string, page = 1) {
  return fetchTMDB<TMDBPaginatedResponse<TVShow>>(
    "/search/tv",
    {
      query,
      page: String(page),
    },
    { cache: "no-store" } // 검색은 항상 실시간
  );
}

// ==============================
// 트렌딩 (Trending) API
// ==============================

/**
 * 트렌딩 콘텐츠 목록을 조회합니다.
 *
 * @param mediaType - 미디어 타입 ("movie" | "tv" | "person" | "all")
 * @param timeWindow - 시간 범위 ("day" | "week")
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function getTrending<T = Movie | TVShow>(
  mediaType: MediaType = "all",
  timeWindow: TimeWindow = "week",
  page = 1
) {
  return fetchTMDB<TMDBPaginatedResponse<T>>(
    `/trending/${mediaType}/${timeWindow}`,
    { page: String(page) }
  );
}

// ==============================
// 장르 (Genre) API
// ==============================

/** 영화 장르 목록을 조회합니다. */
export async function getMovieGenres() {
  return fetchTMDB<GenreListResponse>("/genre/movie/list");
}

/** TV 시리즈 장르 목록을 조회합니다. */
export async function getTVGenres() {
  return fetchTMDB<GenreListResponse>("/genre/tv/list");
}

// ==============================
// 장르별 콘텐츠 조회 (Discover) API
// ==============================

/**
 * 특정 조건으로 영화를 탐색합니다.
 *
 * @param params - 필터링 조건 (장르, 정렬, 연도 등)
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function discoverMovies(
  params: Record<string, string> = {},
  page = 1
) {
  return fetchTMDB<TMDBPaginatedResponse<Movie>>("/discover/movie", {
    page: String(page),
    sort_by: "popularity.desc",
    ...params,
  });
}

/**
 * 특정 조건으로 TV 시리즈를 탐색합니다.
 *
 * @param params - 필터링 조건 (장르, 정렬, 연도 등)
 * @param page - 페이지 번호 (기본값: 1)
 */
export async function discoverTVShows(
  params: Record<string, string> = {},
  page = 1
) {
  return fetchTMDB<TMDBPaginatedResponse<TVShow>>("/discover/tv", {
    page: String(page),
    sort_by: "popularity.desc",
    ...params,
  });
}
