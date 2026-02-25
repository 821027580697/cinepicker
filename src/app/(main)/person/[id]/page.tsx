/**
 * 인물 상세 페이지
 *
 * 배우/감독 등의 상세 정보를 표시합니다.
 * - 프로필 이미지 및 기본 정보
 * - 약력 (바이오그래피)
 * - 출연 작품 목록 (영화 / TV)
 * - 이미지 갤러리
 */

import type { Metadata } from "next";

interface PersonDetailPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: PersonDetailPageProps): Promise<Metadata> {
  const { id } = await params;
  // TODO: TMDB API로 인물 정보를 가져와 동적 메타데이터 생성
  return {
    title: `인물 #${id} | CinePickr`,
  };
}

export default async function PersonDetailPage({
  params,
}: PersonDetailPageProps) {
  const { id } = await params;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1>인물 상세 - ID: {id}</h1>
      {/* TODO: 인물 상세 정보 구현 */}
    </div>
  );
}
