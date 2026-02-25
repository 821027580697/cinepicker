/**
 * 내 리뷰 페이지
 *
 * 로그인한 사용자가 작성한 모든 리뷰를 표시합니다.
 *
 * 기능:
 * - 콘텐츠 포스터 + 제목 + 리뷰 내용
 * - 리뷰 수정 / 삭제 기능
 * - 날짜순 정렬
 */

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MyReviewsList from "./MyReviewsList";

// 빌드 시 DB 호출을 방지하기 위해 동적 렌더링 강제
export const dynamic = "force-dynamic";

// SEO 메타데이터
export const metadata: Metadata = {
  title: "내 리뷰",
  description: "내가 작성한 리뷰 목록입니다.",
};

export default async function MyReviewsPage() {
  // 1단계: 인증 확인
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    redirect("/login");
  }

  // 2단계: 내 리뷰 조회 (최신순)
  const reviews = await prisma.review.findMany({
    where: { userId: session.user.id },
    include: {
      _count: {
        select: { likes: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // 3단계: 응답 데이터 변환
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formattedReviews = reviews.map((review: any) => ({
    id: review.id,
    contentId: review.contentId,
    contentType: review.contentType as "movie" | "tv",
    rating: review.rating,
    title: review.title,
    content: review.content,
    spoiler: review.spoiler,
    likeCount: review._count?.likes || 0,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
  }));

  return (
    <section className="mx-auto max-w-4xl px-4 py-8">
      {/* 헤더 */}
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground">✍️ 내 리뷰</h1>
        <span className="text-sm text-muted">
          총 {formattedReviews.length}개
        </span>
      </div>

      {/* 리뷰 목록 (클라이언트 컴포넌트) */}
      <MyReviewsList reviews={formattedReviews} />
    </section>
  );
}
