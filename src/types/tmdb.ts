/**
 * TMDB API 응답 타입 정의
 *
 * The Movie Database (TMDB) API에서 반환하는 데이터의
 * TypeScript 인터페이스를 정의합니다.
 *
 * @see https://developer.themoviedb.org/reference
 */

// ==============================
// 공통 타입
// ==============================

/** TMDB 페이지네이션 응답 래퍼 */
export interface TMDBPaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

/** TMDB API 에러 응답 */
export interface TMDBErrorResponse {
  status_code: number;
  status_message: string;
  success: boolean;
}

// ==============================
// 장르 (Genre)
// ==============================

/** 영화/TV 장르 정보 */
export interface Genre {
  id: number;
  name: string;
}

/** 장르 목록 API 응답 */
export interface GenreListResponse {
  genres: Genre[];
}

// ==============================
// 영화 (Movie)
// ==============================

/** 영화 기본 정보 (목록 조회 시) */
export interface Movie {
  id: number;
  title: string;
  original_title: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  release_date: string;
  genre_ids: number[];
  adult: boolean;
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  video: boolean;
}

/** 영화 상세 정보 (단건 조회 시) */
export interface MovieDetail extends Omit<Movie, "genre_ids"> {
  belongs_to_collection: Collection | null;
  budget: number;
  genres: Genre[];
  homepage: string | null;
  imdb_id: string | null;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  revenue: number;
  runtime: number | null;
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  /** append_to_response로 함께 요청 가능한 부가 데이터 */
  credits?: Credits;
  videos?: VideoListResponse;
  images?: ImageListResponse;
  recommendations?: TMDBPaginatedResponse<Movie>;
  similar?: TMDBPaginatedResponse<Movie>;
}

// ==============================
// TV 시리즈 (TV Show)
// ==============================

/** TV 시리즈 기본 정보 (목록 조회 시) */
export interface TVShow {
  id: number;
  name: string;
  original_name: string;
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  first_air_date: string;
  genre_ids: number[];
  origin_country: string[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
}

/** TV 시리즈 상세 정보 (단건 조회 시) */
export interface TVShowDetail extends Omit<TVShow, "genre_ids"> {
  created_by: Creator[];
  episode_run_time: number[];
  genres: Genre[];
  homepage: string | null;
  in_production: boolean;
  languages: string[];
  last_air_date: string;
  last_episode_to_air: Episode | null;
  next_episode_to_air: Episode | null;
  networks: Network[];
  number_of_episodes: number;
  number_of_seasons: number;
  production_companies: ProductionCompany[];
  production_countries: ProductionCountry[];
  seasons: Season[];
  spoken_languages: SpokenLanguage[];
  status: string;
  tagline: string | null;
  type: string;
  /** append_to_response로 함께 요청 가능한 부가 데이터 */
  credits?: Credits;
  videos?: VideoListResponse;
  images?: ImageListResponse;
  recommendations?: TMDBPaginatedResponse<TVShow>;
  similar?: TMDBPaginatedResponse<TVShow>;
}

/** TV 시즌 정보 */
export interface Season {
  id: number;
  air_date: string | null;
  episode_count: number;
  name: string;
  overview: string;
  poster_path: string | null;
  season_number: number;
  vote_average: number;
}

/** TV 에피소드 정보 */
export interface Episode {
  id: number;
  air_date: string;
  episode_number: number;
  name: string;
  overview: string;
  production_code: string;
  runtime: number | null;
  season_number: number;
  show_id: number;
  still_path: string | null;
  vote_average: number;
  vote_count: number;
}

/** TV 시리즈 제작자 */
export interface Creator {
  id: number;
  credit_id: string;
  name: string;
  gender: number;
  profile_path: string | null;
}

/** 방송 네트워크 */
export interface Network {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

// ==============================
// 인물 (Person)
// ==============================

/** 인물 기본 정보 */
export interface Person {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  adult: boolean;
  popularity: number;
  gender: number;
  known_for_department: string;
  known_for: (Movie | TVShow)[];
}

/** 인물 상세 정보 */
export interface PersonDetail {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  gender: number;
  homepage: string | null;
  imdb_id: string | null;
  known_for_department: string;
  place_of_birth: string | null;
  popularity: number;
  profile_path: string | null;
  adult: boolean;
  also_known_as: string[];
  /** append_to_response로 함께 요청 가능한 부가 데이터 */
  movie_credits?: PersonCredits<MovieCastCredit, MovieCrewCredit>;
  tv_credits?: PersonCredits<TVCastCredit, TVCrewCredit>;
  images?: { profiles: ImageInfo[] };
}

// ==============================
// 출연진 & 제작진 (Credits)
// ==============================

/** 콘텐츠의 출연진/제작진 정보 */
export interface Credits {
  id?: number;
  cast: CastMember[];
  crew: CrewMember[];
}

/** 출연 배우 정보 */
export interface CastMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  character: string;
  credit_id: string;
  order: number;
  gender: number;
  known_for_department: string;
  popularity: number;
  adult: boolean;
  cast_id?: number;
}

/** 제작진 정보 */
export interface CrewMember {
  id: number;
  name: string;
  original_name: string;
  profile_path: string | null;
  department: string;
  job: string;
  credit_id: string;
  gender: number;
  known_for_department: string;
  popularity: number;
  adult: boolean;
}

/** 인물별 크레딧 래퍼 */
export interface PersonCredits<TCast, TCrew> {
  id?: number;
  cast: TCast[];
  crew: TCrew[];
}

/** 인물의 영화 출연 크레딧 */
export interface MovieCastCredit extends Movie {
  character: string;
  credit_id: string;
  order: number;
}

/** 인물의 영화 제작 크레딧 */
export interface MovieCrewCredit extends Movie {
  department: string;
  job: string;
  credit_id: string;
}

/** 인물의 TV 출연 크레딧 */
export interface TVCastCredit extends TVShow {
  character: string;
  credit_id: string;
  episode_count: number;
}

/** 인물의 TV 제작 크레딧 */
export interface TVCrewCredit extends TVShow {
  department: string;
  job: string;
  credit_id: string;
  episode_count: number;
}

// ==============================
// 비디오 (Video)
// ==============================

/** 비디오 정보 (예고편, 티저 등) */
export interface Video {
  id: string;
  iso_639_1: string;
  iso_3166_1: string;
  key: string;
  name: string;
  site: string;
  size: number;
  type: VideoType;
  official: boolean;
  published_at: string;
}

/** 비디오 유형 */
export type VideoType =
  | "Trailer"
  | "Teaser"
  | "Clip"
  | "Behind the Scenes"
  | "Bloopers"
  | "Featurette"
  | "Opening Credits";

/** 비디오 목록 응답 */
export interface VideoListResponse {
  id?: number;
  results: Video[];
}

// ==============================
// 이미지 (Image)
// ==============================

/** 이미지 상세 정보 */
export interface ImageInfo {
  aspect_ratio: number;
  file_path: string;
  height: number;
  width: number;
  iso_639_1: string | null;
  vote_average: number;
  vote_count: number;
}

/** 이미지 목록 응답 */
export interface ImageListResponse {
  id?: number;
  backdrops: ImageInfo[];
  logos: ImageInfo[];
  posters: ImageInfo[];
}

// ==============================
// 컬렉션 / 제작사 / 국가 / 언어
// ==============================

/** 영화 컬렉션 (시리즈) */
export interface Collection {
  id: number;
  name: string;
  poster_path: string | null;
  backdrop_path: string | null;
}

/** 제작사 정보 */
export interface ProductionCompany {
  id: number;
  name: string;
  logo_path: string | null;
  origin_country: string;
}

/** 제작 국가 */
export interface ProductionCountry {
  iso_3166_1: string;
  name: string;
}

/** 사용 언어 */
export interface SpokenLanguage {
  english_name: string;
  iso_639_1: string;
  name: string;
}

// ==============================
// 검색 (Search)
// ==============================

/** 통합 검색 결과 (영화, TV, 인물 혼합) */
export interface MultiSearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  // Movie 필드
  title?: string;
  release_date?: string;
  // TVShow 필드
  name?: string;
  first_air_date?: string;
  // 공통 필드
  overview?: string;
  poster_path?: string | null;
  backdrop_path?: string | null;
  profile_path?: string | null;
  popularity: number;
  vote_average?: number;
  vote_count?: number;
  genre_ids?: number[];
  original_language?: string;
  adult?: boolean;
}

// ==============================
// 트렌딩 (Trending)
// ==============================

/** 트렌딩 조회 시간 범위 */
export type TimeWindow = "day" | "week";

/** 트렌딩 미디어 타입 */
export type MediaType = "movie" | "tv" | "person" | "all";

/**
 * 트렌딩 API 결과 아이템
 *
 * 영화와 TV를 모두 포함할 수 있는 통합 타입입니다.
 * media_type 필드로 영화/TV를 구분합니다.
 */
export interface TrendingItem {
  id: number;
  media_type: "movie" | "tv";
  /* 영화 필드 */
  title?: string;
  original_title?: string;
  release_date?: string;
  /* TV 필드 */
  name?: string;
  original_name?: string;
  first_air_date?: string;
  /* 공통 필드 */
  overview: string;
  poster_path: string | null;
  backdrop_path: string | null;
  genre_ids: number[];
  original_language: string;
  popularity: number;
  vote_average: number;
  vote_count: number;
  adult?: boolean;
}

// ==============================
// TMDB 이미지 사이즈 설정
// ==============================

/** 포스터 이미지 크기 */
export type PosterSize =
  | "w92"
  | "w154"
  | "w185"
  | "w342"
  | "w500"
  | "w780"
  | "original";

/** 배경 이미지 크기 */
export type BackdropSize = "w300" | "w780" | "w1280" | "original";

/** 프로필 이미지 크기 */
export type ProfileSize = "w45" | "w185" | "h632" | "original";

/** 로고 이미지 크기 */
export type LogoSize =
  | "w45"
  | "w92"
  | "w154"
  | "w185"
  | "w300"
  | "w500"
  | "original";

/** 스틸 이미지 크기 */
export type StillSize = "w92" | "w185" | "w300" | "original";
