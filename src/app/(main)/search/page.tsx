/**
 * 검색 페이지
 *
 * 영화, TV 시리즈, 인물을 통합 검색하는 페이지입니다.
 * - 실시간 검색 (디바운스 적용)
 * - 검색 결과 탭 (영화 / TV / 인물)
 * - 검색어 하이라이트
 * - 무한 스크롤 또는 페이지네이션
 */

import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "검색 | CinePickr",
  description: "영화, TV 시리즈, 인물을 검색해보세요.",
};

export default function SearchPage() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-3xl font-bold">검색</h1>
      {/* TODO: 검색바, 검색 결과 탭, 결과 그리드 구현 */}
    </section>
  );
}
