/**
 * 유틸리티 함수 모음
 *
 * 프로젝트 전반에서 재사용되는 범용 헬퍼 함수들을 정의합니다.
 */

/**
 * Tailwind CSS 클래스를 조건부로 결합합니다.
 *
 * @param classes - 클래스 문자열 또는 조건부 값 배열
 * @returns 공백으로 구분된 클래스 문자열
 *
 * @example
 * cn("px-4", isActive && "bg-primary", "text-white")
 * // isActive가 true이면: "px-4 bg-primary text-white"
 * // isActive가 false이면: "px-4 text-white"
 */
export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(" ");
}

/**
 * 날짜 문자열을 한국어 형식으로 변환합니다.
 *
 * @param dateString - ISO 날짜 문자열 (예: "2024-01-15")
 * @returns 한국어 날짜 문자열 (예: "2024년 1월 15일")
 */
export function formatDate(dateString: string): string {
  if (!dateString) return "미정";

  const date = new Date(dateString);
  return date.toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

/**
 * 날짜에서 연도만 추출합니다.
 *
 * @param dateString - ISO 날짜 문자열
 * @returns 연도 문자열 (예: "2024") 또는 "미정"
 */
export function getYear(dateString: string): string {
  if (!dateString) return "미정";
  return new Date(dateString).getFullYear().toString();
}

/**
 * 분 단위 시간을 "0시간 00분" 형식으로 변환합니다.
 *
 * @param minutes - 분 단위 시간 (예: 148)
 * @returns 한국어 시간 문자열 (예: "2시간 28분")
 */
export function formatRuntime(minutes: number | null): string {
  if (!minutes) return "정보 없음";

  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;

  if (hours === 0) return `${mins}분`;
  if (mins === 0) return `${hours}시간`;
  return `${hours}시간 ${mins}분`;
}

/**
 * 숫자를 한국어 통화 형식으로 변환합니다.
 *
 * @param amount - 금액 (달러)
 * @returns 포맷된 달러 문자열 (예: "$1,234,567")
 */
export function formatCurrency(amount: number): string {
  if (!amount) return "정보 없음";
  return `$${amount.toLocaleString("en-US")}`;
}

/**
 * 평점을 10점 만점에서 5점 만점으로 변환합니다.
 *
 * @param voteAverage - TMDB 10점 만점 평점
 * @returns 5점 만점 평점 (소수점 1자리)
 */
export function convertRatingToFiveScale(voteAverage: number): number {
  return Math.round((voteAverage / 2) * 10) / 10;
}

/**
 * 텍스트를 지정된 길이로 자르고 "..."을 추가합니다.
 *
 * @param text - 원본 텍스트
 * @param maxLength - 최대 길이 (기본값: 150)
 * @returns 잘린 텍스트
 */
export function truncateText(text: string, maxLength = 150): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + "...";
}

/**
 * 디바운스 함수
 *
 * 연속적인 함수 호출을 지정된 시간 동안 지연시킵니다.
 * 검색 입력 등에서 불필요한 API 호출을 방지합니다.
 *
 * @param func - 실행할 함수
 * @param wait - 대기 시간 (밀리초, 기본값: 300ms)
 * @returns 디바운스된 함수
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait = 300
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), wait);
  };
}
