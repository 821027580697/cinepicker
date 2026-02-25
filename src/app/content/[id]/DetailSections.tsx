/**
 * 상세 페이지 하단 섹션 컴포넌트 (클라이언트)
 *
 * 줄거리, 출연진, 예고편, 리뷰, 비슷한 콘텐츠 등
 * 인터랙티브 기능이 포함된 섹션들을 묶어 렌더링합니다.
 *
 * 서버 컴포넌트(page.tsx)로부터 데이터를 Props로 전달받아 표시합니다.
 */
"use client";

import {
  Synopsis,
  CastList,
  VideoPlayer,
  ReviewList,
  SimilarContent,
} from "@/components/detail";
import type { CastMember, Video, Movie, TVShow } from "@/types/tmdb";
import type { ReviewData } from "@/components/detail/ReviewCard";

// ==============================
// 컴포넌트 Props
// ==============================

interface DetailSectionsProps {
  /** 줄거리 */
  overview: string;
  /** 태그라인 */
  tagline?: string | null;
  /** 출연진 */
  cast: CastMember[];
  /** 비디오 목록 */
  videos: Video[];
  /** 유사 콘텐츠 */
  similarItems: (Movie | TVShow)[];
  /** 콘텐츠 타입 */
  contentType: "movie" | "tv";
}

// ==============================
// 임시 리뷰 데이터 (자체 DB 연동 전)
// ==============================

/**
 * 샘플 리뷰 데이터
 *
 * 향후 자체 DB(Prisma)와 연동하여 실제 리뷰를 로드합니다.
 * 현재는 UI 확인용 목 데이터를 사용합니다.
 */
const MOCK_REVIEWS: ReviewData[] = [
  {
    id: "1",
    authorName: "영화팬",
    authorAvatar: null,
    rating: 5,
    createdAt: "2025-12-01T10:00:00Z",
    content:
      "정말 인상적인 작품이었습니다. 배우들의 연기력과 감독의 연출이 완벽하게 조화를 이루었고, 스토리 전개도 흡입력이 대단했어요. 강력 추천합니다!",
    hasSpoiler: false,
    likeCount: 24,
  },
  {
    id: "2",
    authorName: "시네필",
    authorAvatar: null,
    rating: 4,
    createdAt: "2025-11-28T15:30:00Z",
    content:
      "전체적으로 좋았지만, 중반부에 약간의 전개 이슈가 있었습니다. 그래도 결말이 인상적이어서 만족스러운 관람이었어요.",
    hasSpoiler: false,
    likeCount: 12,
  },
  {
    id: "3",
    authorName: "리뷰어K",
    authorAvatar: null,
    rating: 5,
    createdAt: "2025-11-25T09:15:00Z",
    content:
      "마지막 반전 장면에서 주인공이 사실은 빌런과 형제였다는 것이 밝혀지는 부분이 정말 충격적이었습니다. 이 장면 하나로 영화 전체의 맥락이 완전히 달라져요.",
    hasSpoiler: true,
    likeCount: 8,
  },
];

// ==============================
// DetailSections 컴포넌트
// ==============================

export default function DetailSections({
  overview,
  tagline,
  cast,
  videos,
  similarItems,
  contentType,
}: DetailSectionsProps) {
  /** 리뷰 작성 핸들러 (향후 모달 구현) */
  const handleWriteReview = () => {
    // TODO: ReviewForm 모달 열기
    alert("리뷰 작성 기능은 곧 제공될 예정입니다!");
  };

  return (
    <>
      {/* ── 2. 줄거리 섹션 ── */}
      <Synopsis text={overview} tagline={tagline} />

      {/* ── 3. 출연진 섹션 ── */}
      <CastList cast={cast} maxCount={20} />

      {/* ── 4. 예고편 섹션 ── */}
      <VideoPlayer videos={videos} />

      {/* ── 5. 유저 리뷰 섹션 ── */}
      <ReviewList reviews={MOCK_REVIEWS} onWriteReview={handleWriteReview} />

      {/* ── 6. 비슷한 콘텐츠 섹션 ── */}
      <section className="py-4">
        <SimilarContent items={similarItems} type={contentType} />
      </section>
    </>
  );
}
